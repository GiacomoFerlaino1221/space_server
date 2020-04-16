import { IMap } from "../interface/Map.interface";
import { Land } from "./Land";
import { Player } from "./Player";
import { Base } from "./Base";
import { Entity } from "./Entity";
import { loadMap } from "../utils";
import { Tower } from "./Tower";

export class Map implements IMap {
  public mapData: any = [];
  public rows: number = 10;
  public cols: number = 10;
  public players: Player[] = [];
  public maxPlayers: number = 0;
  public maxTowers: number = 0;
  public land: any = {};
  public fogs: any = {};
  public wood: any = {};
  public towers: any = {};
  public bases: any = {};
  public coins: number = 0;
  public colors: string[] = [
    "red",
    "blue",
    "green",
    "yellow",
    "cyan",
    "orange",
    "violet",
    "magenta"
  ];
  public towerSound: boolean = false;

  public init = async (
    players: Player[],
    maxPlayers: number,
    maxTowers: number,
    coins: number,
    rows: number,
    cols: number
  ) => {
    this.rows = rows;
    this.cols = cols;
    this.coins = coins;
    this.players = players;
    this.maxPlayers = maxPlayers;
    this.maxTowers = maxTowers;

    try {
      await this.fogFactory();
      await this.mapFactory(loadMap(this.maxPlayers));
      await this.towerFactory(6);

      for (let i in this.players) {
        let generated = true;
        while (generated) {
          let player = this.players[i];
          let point = await this.randPosition(10);

          if (point) {
            generated = point.v;
            if (!generated) {
              player.x = point.x;
              player.y = point.y;
              player.color = this.randomColor();
              this.mapData[point.x][point.y] = new Base(
                player.socket_id,
                point.x,
                point.y
              );
              this.mapData[point.x][point.y].color = player.color;
              this.mapData[point.x][point.y].selection = true;
              player.updateFog(player.x, player.y);
            }
          }
          // let interval = setInterval(() => {
          //   let point = this.randPosition(10);
          //   let generated = point.v;
          //   if (!generated) {
          //     player.x = point.x;
          //     player.y = point.y;
          //     player.color = this.randomColor();
          //     this.mapData[point.x][point.y] = new Base(
          //       player.socket_id,
          //       point.x,
          //       point.y
          //     );
          //     this.mapData[point.x][point.y].color = player.color;
          //     this.mapData[point.x][point.y].selection = true;
          //     player.updateFog(player.x, player.y);
          //     clearInterval(interval);
          //   }
          // });
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  private randomColor = () => {
    let color = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.colors = this.colors.filter(c => c !== color);
    return color;
  };

  public playerMove = async (direction: string, player: any) => {
    this.towerSound = false;
    // old position
    let o = {
      x: player.x,
      y: player.y
    };

    // moving position
    let m = {
      x: o.x,
      y: o.y
    };

    if (direction === "up") {
      m.x--;
    } else if (direction === "down") {
      m.x++;
    } else if (direction === "left") {
      m.y--;
    } else {
      m.y++;
    }

    if (
      m.x >= 0 &&
      m.x < this.mapData.length &&
      m.y >= 0 &&
      m.y < this.mapData.length
    ) {
      try {
        let obstacle = await this.isObstacle(m.x, m.y);

        if (!obstacle) {
          let prevPoint = this.mapData[o.x][o.y];
          let nextPoint = this.mapData[m.x][m.y];

          setTimeout(async () => {
            // переход от своей клетки к своей
            if (
              prevPoint.owner === player.socket_id &&
              nextPoint.owner === player.socket_id
            ) {
              this.mapData[o.x][o.y].selection = false;
              nextPoint.count = prevPoint.count - 1 + nextPoint.count;
              prevPoint.count = 1;
            }

            // переход от своей клетки к чужой или нейтральной клетке
            // или нейтральной башне
            if (
              prevPoint.owner === player.socket_id &&
              nextPoint.owner !== player.socket_id
            ) {
              // Если у предидущей больше
              if (prevPoint.count > nextPoint.count) {
                let enemy = this.players[nextPoint.owner];
                let count = prevPoint.count - nextPoint.count;
                prevPoint.count = 1;

                if (!nextPoint.tower && !nextPoint.base && count > 1) {
                  this.mapData[m.x][m.y] = new Land(
                    m.x,
                    m.y,
                    count - 1,
                    player.socket_id,
                    "land"
                  );

                  player.updateFog(m.x, m.y);
                  this.mapData[m.x][m.y].color = player.color;
                } else if (nextPoint.tower) {
                  this.mapData[m.x][m.y] = new Tower(
                    m.x,
                    m.y,
                    count,
                    player.socket_id,
                    "tower"
                  );
                  this.mapData[m.x][m.y].own(player.socket_id);
                  this.mapData[m.x][m.y].color = player.color;
                  player.updateFog(m.x, m.y);
                  // this.towerSound = true;
                } else if (nextPoint.base) {
                  enemy.makeLose(m.x, m.y, count, player, this.mapData);
                }

                if (enemy) enemy.removeFog(`${m.x}:${m.y}`, this.mapData);
              }

              // Если у предидущей меньше
              if (prevPoint.count < nextPoint.count) {
                nextPoint.count = nextPoint.count - (prevPoint.count - 1);
                prevPoint.count = 1;
              }

              // Если значения равны
              if (prevPoint.count === nextPoint.count) {
                prevPoint.count = 1;
                nextPoint.count = 1;
              }
            }
          });

          player.x = m.x;
          player.y = m.y;
          this.mapData[m.x][m.y].selection = true;
          // this.towerSound = false;
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  public playerMoveTo = async (
    x: number,
    y: number,
    player: Player,
    selection: boolean
  ) => {
    try {
      this.mapData[player.x][player.y].selection = false;
      player.x = x;
      player.y = y;
      if (this.mapData[x][y]) this.mapData[x][y].selection = true;
    } catch (e) {
      console.log(e);
    }
  };

  private fogFactory = async () => {
    try {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.fogs[`${i}:${j}`] = {};
          this.fogs[`${i}:${j}`].isFog = true;
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  private mapFactory = async (data: any) => {
    try {
      for (let row in data) {
        let r = [];
        for (let col in data[row]) {
          let tmp = data[row][col];
          let obj = new Entity(tmp.x, tmp.y, 0, "", "");

          if (tmp.obstacle) {
            obj.obstacle = true;
          }

          r.push(obj);
        }
        this.mapData.push(r);
      }
    } catch (e) {
      console.log(e);
    }
  };

  private towerFactory = (length: number) => {
    let generated = true;
    let generatedCount = 0;

    const generateTower = () => {
      let x = this.randCount(0, 19);
      let y = this.randCount(0, 19);

      if (this.mapData[x][y] && !this.mapData[x][y].obstacle) {
        this.mapData[x][y] = new Tower(
          x,
          y,
          this.randCount(40, 50),
          "",
          "tower"
        );
        generated = true;
        generatedCount++;
      } else {
        x = this.randCount(0, 19);
        y = this.randCount(0, 19);
        generated = false;
      }
    };

    for (let i = 0; i < length; i++) {
      generateTower();
    }

    if (!generated) {
      let l = length - generatedCount;
      for (let i = 0; i < l; i++) {
        generateTower();
      }
    }

    return { generated };
  };

  private addLand = async (
    direction: string,
    x: number,
    y: number,
    count: number,
    player: string,
    type: string
  ) => {
    try {
      this.land[direction] = new Land(x, y, count, player, type);
    } catch (e) {
      console.log(e);
    }
  };

  private randCount = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  private randPosition = async (r: number) => {
    try {
      // flag
      let v = false;
      let tr = 3;

      // random numbers
      let x = this.randCount(0, 19);
      let y = this.randCount(0, 19);

      // check points in radius and change flag
      for (let z = 1; z <= r; z++) {
        if (this.mapData[x - z]) {
          if (
            (await this.has(this.mapData[x - z][y], "owner")) &&
            this.mapData[x - z][y].owner !== ""
          )
            v = true;
        }

        if (this.mapData[x][y - z]) {
          if (
            (await this.has(this.mapData[x][y - z], "owner")) &&
            this.mapData[x][y - z].owner !== ""
          )
            v = true;
        }

        if (this.mapData[x][y + z]) {
          if (
            (await this.has(this.mapData[x][y + z], "owner")) &&
            this.mapData[x][y + z].owner !== ""
          )
            v = true;
        }

        if (this.mapData[x - z]) {
          if (
            (await this.has(this.mapData[x - z][y], "owner")) &&
            this.mapData[x - z][y].owner !== ""
          )
            v = true;

          if (this.mapData[x - z][y - z]) {
            for (let t = 1; t <= r; t++) {
              if (
                (await this.has(this.mapData[x - z][y - t], "owner")) &&
                this.mapData[x - z][y - t] !== ""
              )
                v = true;
            }
          }

          if (this.mapData[x - z][y + z]) {
            for (let t = 1; t <= r; t++) {
              if (
                (await this.has(this.mapData[x - z][y + t], "owner")) &&
                this.mapData[x - z][y + t].owner !== ""
              )
                v = true;
            }
          }
        }

        if (this.mapData[x + z]) {
          if (
            (await this.has(this.mapData[x + z][y], "owner")) &&
            this.mapData[x + z][y].owner !== ""
          )
            v = true;

          if (this.mapData[x + z][y + z]) {
            for (let t = 1; t <= r; t++) {
              if (
                (await this.has(this.mapData[x + z][y + t], "owner")) &&
                this.mapData[x + z][y + t].owner !== ""
              )
                v = true;
            }
          }

          if (this.mapData[x + z][y - z]) {
            for (let t = 1; t <= r; t++) {
              if (
                (await this.has(this.mapData[x + z][y - t], "owner")) &&
                this.mapData[x + z][y - t].owner !== ""
              )
                v = true;
            }
          }
        }

        if (this.mapData[x][y]) {
          if (
            ((await this.has(this.mapData[x][y], "owner")) &&
              this.mapData[x][y].owner !== "") ||
            this.mapData[x][y].obstacle
          )
            v = true;
        }
      }

      for (let z = 1; z <= tr; z++) {
        if (this.mapData[x - z]) {
          if (
            (await this.has(this.mapData[x - z][y], "tower")) &&
            this.mapData[x - z][y].tower
          )
            v = true;
        }

        if (this.mapData[x][y - z]) {
          if (
            (await this.has(this.mapData[x][y - z], "tower")) &&
            this.mapData[x][y - z].tower
          )
            v = true;
        }

        if (this.mapData[x][y + z]) {
          if (
            (await this.has(this.mapData[x][y + z], "tower")) &&
            this.mapData[x][y + z].tower
          )
            v = true;
        }

        if (this.mapData[x - z]) {
          if (
            (await this.has(this.mapData[x - z][y], "tower")) &&
            this.mapData[x - z][y].tower
          )
            v = true;

          if (this.mapData[x - z][y - z]) {
            for (let t = 1; t <= tr; t++) {
              if (
                (await this.has(this.mapData[x - z][y - t], "tower")) &&
                this.mapData[x - z][y - t]
              )
                v = true;
            }
          }

          if (this.mapData[x - z][y + z]) {
            for (let t = 1; t <= tr; t++) {
              if (
                (await this.has(this.mapData[x - z][y + t], "tower")) &&
                this.mapData[x - z][y + t].tower
              )
                v = true;
            }
          }
        }

        if (this.mapData[x + z]) {
          if (
            (await this.has(this.mapData[x + z][y], "tower")) &&
            this.mapData[x + z][y].tower
          )
            v = true;

          if (this.mapData[x + z][y + z]) {
            for (let t = 1; t <= tr; t++) {
              if (
                (await this.has(this.mapData[x + z][y + t], "tower")) &&
                this.mapData[x + z][y + t].tower
              )
                v = true;
            }
          }

          if (this.mapData[x + z][y - z]) {
            for (let t = 1; t <= tr; t++) {
              if (
                (await this.has(this.mapData[x + z][y - t], "tower")) &&
                this.mapData[x + z][y - t].tower
              )
                v = true;
            }
          }
        }
      }

      if (
        (await this.has(this.mapData[x][y], "obstacle")) &&
        this.mapData[x][y].obstacle
      )
        v = true;

      // return values
      return {
        v,
        x,
        y
      };
    } catch (e) {
      console.log(e);
    }
  };

  private has = async (object: any, key: any) => {
    try {
      return object ? Object.hasOwnProperty.call(object, key) : false;
    } catch (e) {
      console.log(e);
    }
  };

  private isObstacle = async (x: number, y: number) => {
    try {
      return this.mapData[x][y] && this.mapData[x][y].obstacle ? true : false;
    } catch (e) {
      console.log(e);
    }
  };
}

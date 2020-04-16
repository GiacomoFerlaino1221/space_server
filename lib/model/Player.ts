import { IPlayer } from "../interface/Player.interface";
import { Fog } from "./Fog";
import { Tower } from "./Tower";

export class Player implements IPlayer {
  public id: string;
  public avatar: string;
  public socket_id: string;
  public alive: boolean;
  public pos_x: number = 0;
  public pos_y: number = 0;
  public steps: number = 0;
  public color: string = "";
  public base: any = {};
  public fogs: any = {};
  public land: number = 0;
  public lose: boolean = false;
  public selection: boolean = false;
  public username: string = "";
  public x: number = 0;
  public y: number = 0;
  public points: any = [];
  public gameID: string = "";

  constructor(id: string, avatar: string, socket_id: string) {
    this.id = id;
    this.avatar = avatar;
    this.socket_id = socket_id;
    this.alive = true;
  }

  public updateFog = async (x: number, y: number) => {
    try {
      this.points.push({ x, y });
      this.fogs[`${x}:${y}`] = new Fog(this.socket_id);
      this.fogs[`${x - 1}:${y}`] = new Fog(this.socket_id);
      this.fogs[`${x + 1}:${y}`] = new Fog(this.socket_id);

      this.fogs[`${x - 1}:${y + 1}`] = new Fog(this.socket_id);
      this.fogs[`${x + 1}:${y + 1}`] = new Fog(this.socket_id);

      this.fogs[`${x - 1}:${y - 1}`] = new Fog(this.socket_id);
      this.fogs[`${x + 1}:${y - 1}`] = new Fog(this.socket_id);

      this.fogs[`${x}:${y - 1}`] = new Fog(this.socket_id);
      this.fogs[`${x}:${y + 1}`] = new Fog(this.socket_id);
      this.land += 1;
    } catch (e) {
      console.log(e);
    }
  };

  public removeFog = async (direction: string, land: any) => {
    // let base_pos = this.base.position.split(':');
    // let base_x = parseInt(base_pos[0]);
    // let base_y = parseInt(base_pos[1]);
    try {
      let x = String(direction).split(":");
      let x_pos = parseInt(x[0]);
      let y_pos = parseInt(x[1]);

      this.points = this.points.filter(
        (p: any) => p.x !== x_pos && p.y !== y_pos
      );

      this.land--;

      delete this.fogs[`${x_pos}:${y_pos}`];
      delete this.fogs[`${x_pos - 1}:${y_pos}`];
      delete this.fogs[`${x_pos + 1}:${y_pos}`];

      delete this.fogs[`${x_pos - 1}:${y_pos + 1}`];
      delete this.fogs[`${x_pos + 1}:${y_pos + 1}`];

      delete this.fogs[`${x_pos - 1}:${y_pos - 1}`];
      delete this.fogs[`${x_pos + 1}:${y_pos - 1}`];

      delete this.fogs[`${x_pos}:${y_pos - 1}`];
      delete this.fogs[`${x_pos}:${y_pos + 1}`];

      land.forEach((row: any) => {
        row.forEach((col: any) => {
          if (col.owner === this.socket_id) {
            this.updateFog(col.x, col.y);
          }
        });
      });
    } catch (e) {
      console.log(e);
    }
  };

  public makeLose = async (
    x: number,
    y: number,
    towerCount: number,
    player: any,
    mapData: any
  ) => {
    try {
      mapData[x][y] = new Tower(x, y, towerCount, player.socket_id, "tower");
      mapData[x][y].own(player.socket_id);
      mapData[x][y].color = player.color;

      mapData.forEach((row: any) => {
        row.forEach((col: any) => {
          if (col.owner === this.socket_id) {
            col.owner = player.socket_id;
            col.color = player.color;
            this.updateFog(col.x, col.y);
          }
        });
      });

      this.alive = false;
      this.lose = true;
    } catch (e) {
      console.log(e);
    }
  };
}

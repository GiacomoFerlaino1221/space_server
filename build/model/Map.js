"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Land_1 = require("./Land");
const Base_1 = require("./Base");
const Entity_1 = require("./Entity");
const utils_1 = require("../utils");
const Tower_1 = require("./Tower");
class Map {
    constructor() {
        this.mapData = [];
        this.rows = 10;
        this.cols = 10;
        this.players = [];
        this.maxPlayers = 0;
        this.maxTowers = 0;
        this.land = {};
        this.fogs = {};
        this.wood = {};
        this.towers = {};
        this.bases = {};
        this.coins = 0;
        this.colors = [
            "red",
            "blue",
            "green",
            "yellow",
            "cyan",
            "orange",
            "violet",
            "magenta"
        ];
        this.towerSound = false;
        this.init = (players, maxPlayers, maxTowers, coins, rows, cols) => __awaiter(this, void 0, void 0, function* () {
            this.rows = rows;
            this.cols = cols;
            this.coins = coins;
            this.players = players;
            this.maxPlayers = maxPlayers;
            this.maxTowers = maxTowers;
            try {
                yield this.fogFactory();
                yield this.mapFactory(utils_1.loadMap(this.maxPlayers));
                yield this.towerFactory(6);
                for (let i in this.players) {
                    let generated = true;
                    while (generated) {
                        let player = this.players[i];
                        let point = yield this.randPosition(10);
                        if (point) {
                            generated = point.v;
                            if (!generated) {
                                player.x = point.x;
                                player.y = point.y;
                                player.color = this.randomColor();
                                this.mapData[point.x][point.y] = new Base_1.Base(player.socket_id, point.x, point.y);
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
            }
            catch (e) {
                console.log(e);
            }
        });
        this.randomColor = () => {
            let color = this.colors[Math.floor(Math.random() * this.colors.length)];
            this.colors = this.colors.filter(c => c !== color);
            return color;
        };
        this.playerMove = (direction, player) => __awaiter(this, void 0, void 0, function* () {
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
            }
            else if (direction === "down") {
                m.x++;
            }
            else if (direction === "left") {
                m.y--;
            }
            else {
                m.y++;
            }
            if (m.x >= 0 &&
                m.x < this.mapData.length &&
                m.y >= 0 &&
                m.y < this.mapData.length) {
                try {
                    let obstacle = yield this.isObstacle(m.x, m.y);
                    if (!obstacle) {
                        let prevPoint = this.mapData[o.x][o.y];
                        let nextPoint = this.mapData[m.x][m.y];
                        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                            // переход от своей клетки к своей
                            if (prevPoint.owner === player.socket_id &&
                                nextPoint.owner === player.socket_id) {
                                this.mapData[o.x][o.y].selection = false;
                                nextPoint.count = prevPoint.count - 1 + nextPoint.count;
                                prevPoint.count = 1;
                            }
                            // переход от своей клетки к чужой или нейтральной клетке
                            // или нейтральной башне
                            if (prevPoint.owner === player.socket_id &&
                                nextPoint.owner !== player.socket_id) {
                                // Если у предидущей больше
                                if (prevPoint.count > nextPoint.count) {
                                    let enemy = this.players[nextPoint.owner];
                                    let count = prevPoint.count - nextPoint.count;
                                    prevPoint.count = 1;
                                    if (!nextPoint.tower && !nextPoint.base && count > 1) {
                                        this.mapData[m.x][m.y] = new Land_1.Land(m.x, m.y, count - 1, player.socket_id, "land");
                                        player.updateFog(m.x, m.y);
                                        this.mapData[m.x][m.y].color = player.color;
                                    }
                                    else if (nextPoint.tower) {
                                        this.mapData[m.x][m.y] = new Tower_1.Tower(m.x, m.y, count, player.socket_id, "tower");
                                        this.mapData[m.x][m.y].own(player.socket_id);
                                        this.mapData[m.x][m.y].color = player.color;
                                        player.updateFog(m.x, m.y);
                                        // this.towerSound = true;
                                    }
                                    else if (nextPoint.base) {
                                        enemy.makeLose(m.x, m.y, count, player, this.mapData);
                                    }
                                    if (enemy)
                                        enemy.removeFog(`${m.x}:${m.y}`, this.mapData);
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
                        }));
                        player.x = m.x;
                        player.y = m.y;
                        this.mapData[m.x][m.y].selection = true;
                        // this.towerSound = false;
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }
        });
        this.playerMoveTo = (x, y, player, selection) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.mapData[player.x][player.y].selection = false;
                player.x = x;
                player.y = y;
                if (this.mapData[x][y])
                    this.mapData[x][y].selection = true;
            }
            catch (e) {
                console.log(e);
            }
        });
        this.fogFactory = () => __awaiter(this, void 0, void 0, function* () {
            try {
                for (let i = 0; i < this.rows; i++) {
                    for (let j = 0; j < this.cols; j++) {
                        this.fogs[`${i}:${j}`] = {};
                        this.fogs[`${i}:${j}`].isFog = true;
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        });
        this.mapFactory = (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                for (let row in data) {
                    let r = [];
                    for (let col in data[row]) {
                        let tmp = data[row][col];
                        let obj = new Entity_1.Entity(tmp.x, tmp.y, 0, "", "");
                        if (tmp.obstacle) {
                            obj.obstacle = true;
                        }
                        r.push(obj);
                    }
                    this.mapData.push(r);
                }
            }
            catch (e) {
                console.log(e);
            }
        });
        this.towerFactory = (length) => {
            let generated = true;
            let generatedCount = 0;
            const generateTower = () => {
                let x = this.randCount(0, 19);
                let y = this.randCount(0, 19);
                if (this.mapData[x][y] && !this.mapData[x][y].obstacle) {
                    this.mapData[x][y] = new Tower_1.Tower(x, y, this.randCount(40, 50), "", "tower");
                    generated = true;
                    generatedCount++;
                }
                else {
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
        this.addLand = (direction, x, y, count, player, type) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.land[direction] = new Land_1.Land(x, y, count, player, type);
            }
            catch (e) {
                console.log(e);
            }
        });
        this.randCount = (min, max) => {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        this.randPosition = (r) => __awaiter(this, void 0, void 0, function* () {
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
                        if ((yield this.has(this.mapData[x - z][y], "owner")) &&
                            this.mapData[x - z][y].owner !== "")
                            v = true;
                    }
                    if (this.mapData[x][y - z]) {
                        if ((yield this.has(this.mapData[x][y - z], "owner")) &&
                            this.mapData[x][y - z].owner !== "")
                            v = true;
                    }
                    if (this.mapData[x][y + z]) {
                        if ((yield this.has(this.mapData[x][y + z], "owner")) &&
                            this.mapData[x][y + z].owner !== "")
                            v = true;
                    }
                    if (this.mapData[x - z]) {
                        if ((yield this.has(this.mapData[x - z][y], "owner")) &&
                            this.mapData[x - z][y].owner !== "")
                            v = true;
                        if (this.mapData[x - z][y - z]) {
                            for (let t = 1; t <= r; t++) {
                                if ((yield this.has(this.mapData[x - z][y - t], "owner")) &&
                                    this.mapData[x - z][y - t] !== "")
                                    v = true;
                            }
                        }
                        if (this.mapData[x - z][y + z]) {
                            for (let t = 1; t <= r; t++) {
                                if ((yield this.has(this.mapData[x - z][y + t], "owner")) &&
                                    this.mapData[x - z][y + t].owner !== "")
                                    v = true;
                            }
                        }
                    }
                    if (this.mapData[x + z]) {
                        if ((yield this.has(this.mapData[x + z][y], "owner")) &&
                            this.mapData[x + z][y].owner !== "")
                            v = true;
                        if (this.mapData[x + z][y + z]) {
                            for (let t = 1; t <= r; t++) {
                                if ((yield this.has(this.mapData[x + z][y + t], "owner")) &&
                                    this.mapData[x + z][y + t].owner !== "")
                                    v = true;
                            }
                        }
                        if (this.mapData[x + z][y - z]) {
                            for (let t = 1; t <= r; t++) {
                                if ((yield this.has(this.mapData[x + z][y - t], "owner")) &&
                                    this.mapData[x + z][y - t].owner !== "")
                                    v = true;
                            }
                        }
                    }
                    if (this.mapData[x][y]) {
                        if (((yield this.has(this.mapData[x][y], "owner")) &&
                            this.mapData[x][y].owner !== "") ||
                            this.mapData[x][y].obstacle)
                            v = true;
                    }
                }
                for (let z = 1; z <= tr; z++) {
                    if (this.mapData[x - z]) {
                        if ((yield this.has(this.mapData[x - z][y], "tower")) &&
                            this.mapData[x - z][y].tower)
                            v = true;
                    }
                    if (this.mapData[x][y - z]) {
                        if ((yield this.has(this.mapData[x][y - z], "tower")) &&
                            this.mapData[x][y - z].tower)
                            v = true;
                    }
                    if (this.mapData[x][y + z]) {
                        if ((yield this.has(this.mapData[x][y + z], "tower")) &&
                            this.mapData[x][y + z].tower)
                            v = true;
                    }
                    if (this.mapData[x - z]) {
                        if ((yield this.has(this.mapData[x - z][y], "tower")) &&
                            this.mapData[x - z][y].tower)
                            v = true;
                        if (this.mapData[x - z][y - z]) {
                            for (let t = 1; t <= tr; t++) {
                                if ((yield this.has(this.mapData[x - z][y - t], "tower")) &&
                                    this.mapData[x - z][y - t])
                                    v = true;
                            }
                        }
                        if (this.mapData[x - z][y + z]) {
                            for (let t = 1; t <= tr; t++) {
                                if ((yield this.has(this.mapData[x - z][y + t], "tower")) &&
                                    this.mapData[x - z][y + t].tower)
                                    v = true;
                            }
                        }
                    }
                    if (this.mapData[x + z]) {
                        if ((yield this.has(this.mapData[x + z][y], "tower")) &&
                            this.mapData[x + z][y].tower)
                            v = true;
                        if (this.mapData[x + z][y + z]) {
                            for (let t = 1; t <= tr; t++) {
                                if ((yield this.has(this.mapData[x + z][y + t], "tower")) &&
                                    this.mapData[x + z][y + t].tower)
                                    v = true;
                            }
                        }
                        if (this.mapData[x + z][y - z]) {
                            for (let t = 1; t <= tr; t++) {
                                if ((yield this.has(this.mapData[x + z][y - t], "tower")) &&
                                    this.mapData[x + z][y - t].tower)
                                    v = true;
                            }
                        }
                    }
                }
                if ((yield this.has(this.mapData[x][y], "obstacle")) &&
                    this.mapData[x][y].obstacle)
                    v = true;
                // return values
                return {
                    v,
                    x,
                    y
                };
            }
            catch (e) {
                console.log(e);
            }
        });
        this.has = (object, key) => __awaiter(this, void 0, void 0, function* () {
            try {
                return object ? Object.hasOwnProperty.call(object, key) : false;
            }
            catch (e) {
                console.log(e);
            }
        });
        this.isObstacle = (x, y) => __awaiter(this, void 0, void 0, function* () {
            try {
                return this.mapData[x][y] && this.mapData[x][y].obstacle ? true : false;
            }
            catch (e) {
                console.log(e);
            }
        });
    }
}
exports.Map = Map;

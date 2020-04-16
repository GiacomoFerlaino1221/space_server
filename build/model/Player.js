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
const Fog_1 = require("./Fog");
const Tower_1 = require("./Tower");
class Player {
    constructor(id, avatar, socket_id) {
        this.pos_x = 0;
        this.pos_y = 0;
        this.steps = 0;
        this.color = "";
        this.base = {};
        this.fogs = {};
        this.land = 0;
        this.lose = false;
        this.selection = false;
        this.username = "";
        this.x = 0;
        this.y = 0;
        this.points = [];
        this.gameID = "";
        this.updateFog = (x, y) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.points.push({ x, y });
                this.fogs[`${x}:${y}`] = new Fog_1.Fog(this.socket_id);
                this.fogs[`${x - 1}:${y}`] = new Fog_1.Fog(this.socket_id);
                this.fogs[`${x + 1}:${y}`] = new Fog_1.Fog(this.socket_id);
                this.fogs[`${x - 1}:${y + 1}`] = new Fog_1.Fog(this.socket_id);
                this.fogs[`${x + 1}:${y + 1}`] = new Fog_1.Fog(this.socket_id);
                this.fogs[`${x - 1}:${y - 1}`] = new Fog_1.Fog(this.socket_id);
                this.fogs[`${x + 1}:${y - 1}`] = new Fog_1.Fog(this.socket_id);
                this.fogs[`${x}:${y - 1}`] = new Fog_1.Fog(this.socket_id);
                this.fogs[`${x}:${y + 1}`] = new Fog_1.Fog(this.socket_id);
                this.land += 1;
            }
            catch (e) {
                console.log(e);
            }
        });
        this.removeFog = (direction, land) => __awaiter(this, void 0, void 0, function* () {
            // let base_pos = this.base.position.split(':');
            // let base_x = parseInt(base_pos[0]);
            // let base_y = parseInt(base_pos[1]);
            try {
                let x = String(direction).split(":");
                let x_pos = parseInt(x[0]);
                let y_pos = parseInt(x[1]);
                this.points = this.points.filter((p) => p.x !== x_pos && p.y !== y_pos);
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
                land.forEach((row) => {
                    row.forEach((col) => {
                        if (col.owner === this.socket_id) {
                            this.updateFog(col.x, col.y);
                        }
                    });
                });
            }
            catch (e) {
                console.log(e);
            }
        });
        this.makeLose = (x, y, towerCount, player, mapData) => __awaiter(this, void 0, void 0, function* () {
            try {
                mapData[x][y] = new Tower_1.Tower(x, y, towerCount, player.socket_id, "tower");
                mapData[x][y].own(player.socket_id);
                mapData[x][y].color = player.color;
                mapData.forEach((row) => {
                    row.forEach((col) => {
                        if (col.owner === this.socket_id) {
                            col.owner = player.socket_id;
                            col.color = player.color;
                            this.updateFog(col.x, col.y);
                        }
                    });
                });
                this.alive = false;
                this.lose = true;
            }
            catch (e) {
                console.log(e);
            }
        });
        this.id = id;
        this.avatar = avatar;
        this.socket_id = socket_id;
        this.alive = true;
    }
}
exports.Player = Player;

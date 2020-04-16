"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Entity {
    constructor(x = 0, y = 0, count = 0, owner = "", type = "") {
        this.base = false;
        this.tower = false;
        this.land = false;
        this.obstacle = false;
        this.color = "";
        this.x = x;
        this.y = y;
        this.count = count;
        this.owner = owner;
        this.type = type;
        // if (type === "land") {
        //   setInterval(async () => {
        //     this.count++;
        //   }, 10000);
        // }
    }
}
exports.Entity = Entity;

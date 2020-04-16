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
const Entity_1 = require("./Entity");
class Land extends Entity_1.Entity {
    constructor(x = 0, y = 0, count = 0, owner = "", type = "") {
        super();
        this.speed = 10;
        this.land = true;
        this.owner = owner;
        this.count = count;
        this.type = "land";
        this.x = x;
        this.y = y;
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            yield this.count++;
        }), this.speed * 1000);
    }
}
exports.Land = Land;

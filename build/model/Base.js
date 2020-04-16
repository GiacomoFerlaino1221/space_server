"use strict";
// import { IBase } from '../interface/Base.interface';
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
// export class Base implements IBase {
//   public owner: string;
//   public alive: boolean;
//   public count: number;
//   public position: string;
//   constructor (owner: string, position: string) {
//     this.owner = owner;
//     this.alive = true;
//     this.count = 0;
//     this.position = position;
//     // setInterval(() => this.count += 1, 1000);
//   }
//   public own = (owner: string) => {
//     this.alive = false;
//     this.owner = owner;
//   }
// }
const Entity_1 = require("./Entity");
class Base extends Entity_1.Entity {
    constructor(owner, x, y) {
        super();
        this.speed = 1;
        this.base = true;
        this.x = x;
        this.y = y;
        this.owner = owner;
        this.type = "base";
        this.count = 1;
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            yield this.count++;
        }), this.speed * 1000);
    }
}
exports.Base = Base;

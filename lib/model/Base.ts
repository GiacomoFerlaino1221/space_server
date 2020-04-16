// import { IBase } from '../interface/Base.interface';

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
import { Entity } from "./Entity";

export class Base extends Entity {
  public speed: number = 1;
  public base: boolean = true;

  constructor(owner: string, x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.owner = owner;
    this.type = "base";
    this.count = 1;

    setInterval(async () => {
      await this.count++;
    }, this.speed * 1000);
  }
}

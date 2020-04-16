import { Entity } from "./Entity";

export class Land extends Entity {
  public speed: number = 10;
  public land: boolean = true;

  constructor(
    x: number = 0,
    y: number = 0,
    count: number = 0,
    owner: string = "",
    type: string = ""
  ) {
    super();
    this.owner = owner;
    this.count = count;
    this.type = "land";
    this.x = x;
    this.y = y;

    setInterval(async () => {
      await this.count++;
    }, this.speed * 1000);
  }
}

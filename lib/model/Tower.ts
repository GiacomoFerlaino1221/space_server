import { Entity } from "./Entity";

export class Tower extends Entity {
  public speed: number = 1;
  public tower: boolean = true;

  public own = (owner: string) => {
    this.owner = owner;
    setInterval(async () => {
      this.count++;
    }, this.speed * 1000);
  };
}

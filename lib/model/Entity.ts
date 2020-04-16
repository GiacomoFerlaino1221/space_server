export class Entity {
  public x: number;
  public y: number;
  public count: number;
  public owner: string;
  public type: string;
  public base: boolean = false;
  public tower: boolean = false;
  public land: boolean = false;
  public obstacle: boolean = false;
  public color: string = "";

  constructor(
    x: number = 0,
    y: number = 0,
    count: number = 0,
    owner: string = "",
    type: string = ""
  ) {
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

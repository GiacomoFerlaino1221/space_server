import { IFog } from '../interface/Fog.interface';

export class Fog implements IFog {
  public owner: string;

  constructor (owner: string) {
    this.owner = owner;
  }
}
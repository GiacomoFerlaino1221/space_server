import { IPlayer } from './Player.interface';
import { ILand } from './Land.interface';

export interface IMap {
  rows: number;
  cols: number;
  land: ILand;
  players: IPlayer[];
  colors: string[];
};
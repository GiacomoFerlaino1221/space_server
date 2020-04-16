import { IPlayer }from './Player.interface';
import { IMap }from './Map.interface';

export interface IGame {
  id: string;
  coins: number;
  opened: boolean;
  creator: IPlayer;
  players: IPlayer[];
  maxPlayers: number;
  maxTowers: number;
  map: IMap;
  start: () => void;
}
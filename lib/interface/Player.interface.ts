import { IBase } from './Base.interface';
import { IFog } from './Fog.interface';

export interface IPlayer {
  id: string;
  avatar: string;
  socket_id: any;
  alive: boolean;
  pos_x: number;
  pos_y: number;
  steps: number;
  color: string;
  base: IBase;
  fogs: IFog;
  land: number;
}
import { Player } from "../model/Player";
import { IGame } from "../interface/Game.interface";
import { Map } from "./Map";
import { GenerateHash } from "../utils";

export class Game implements IGame {
  public id: string;
  public coins: number;
  public opened: boolean = true;
  public creator: Player;
  public players: any = {};
  public playersData: any = {};
  public maxPlayers: number;
  public maxTowers: number = 2;
  public enteredPlayers: number = 0;
  public map: Map = new Map();
  public chat: any = [];

  constructor(coins: number, maxPlayers: number, creator: Player) {
    this.id = GenerateHash();
    this.coins = coins;
    this.creator = creator;
    this.creator.alive = true;
    this.players[creator.socket_id] = creator;
    this.enteredPlayers = 1;
    this.maxPlayers = maxPlayers;
    this.chat = [];
  }

  public start = (): void => {
    this.opened = false;
    let rows = 10;
    let cols = 10;

    if (this.maxPlayers === 2) {
      rows = 20;
      cols = 20;
      this.maxTowers = 5;
    } else if (this.maxPlayers === 3) {
      rows = 25;
      cols = 25;
      this.maxTowers = 7;
    } else if (this.maxPlayers === 4) {
      rows = 30;
      cols = 30;
      this.maxTowers = 7;
    } else if (this.maxPlayers === 5) {
      rows = 35;
      cols = 35;
      this.maxTowers = 7;
    } else if (this.maxPlayers === 6) {
      rows = 40;
      cols = 40;
      this.maxTowers = 7;
    } else if (this.maxPlayers === 7) {
      rows = 45;
      cols = 45;
      this.maxTowers = 7;
    } else if (this.maxPlayers === 8) {
      rows = 50;
      cols = 50;
      this.maxTowers = 7;
    }

    this.map.init(
      this.players,
      this.maxPlayers,
      this.maxTowers,
      this.coins,
      rows,
      cols
    );
  };

  public connectPlayer = (player: Player): void => {
    if (this.enteredPlayers < this.maxPlayers) {
      this.enteredPlayers++;
      this.players[player.socket_id] = player;
    }
  };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Map_1 = require("./Map");
const utils_1 = require("../utils");
class Game {
    constructor(coins, maxPlayers, creator) {
        this.opened = true;
        this.players = {};
        this.playersData = {};
        this.maxTowers = 2;
        this.enteredPlayers = 0;
        this.map = new Map_1.Map();
        this.chat = [];
        this.start = () => {
            this.opened = false;
            let rows = 10;
            let cols = 10;
            if (this.maxPlayers === 2) {
                rows = 20;
                cols = 20;
                this.maxTowers = 5;
            }
            else if (this.maxPlayers === 3) {
                rows = 25;
                cols = 25;
                this.maxTowers = 7;
            }
            else if (this.maxPlayers === 4) {
                rows = 30;
                cols = 30;
                this.maxTowers = 7;
            }
            else if (this.maxPlayers === 5) {
                rows = 35;
                cols = 35;
                this.maxTowers = 7;
            }
            else if (this.maxPlayers === 6) {
                rows = 40;
                cols = 40;
                this.maxTowers = 7;
            }
            else if (this.maxPlayers === 7) {
                rows = 45;
                cols = 45;
                this.maxTowers = 7;
            }
            else if (this.maxPlayers === 8) {
                rows = 50;
                cols = 50;
                this.maxTowers = 7;
            }
            this.map.init(this.players, this.maxPlayers, this.maxTowers, this.coins, rows, cols);
        };
        this.connectPlayer = (player) => {
            if (this.enteredPlayers < this.maxPlayers) {
                this.enteredPlayers++;
                this.players[player.socket_id] = player;
            }
        };
        this.id = utils_1.GenerateHash();
        this.coins = coins;
        this.creator = creator;
        this.creator.alive = true;
        this.players[creator.socket_id] = creator;
        this.enteredPlayers = 1;
        this.maxPlayers = maxPlayers;
        this.chat = [];
    }
}
exports.Game = Game;

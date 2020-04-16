"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../model/User"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Routes {
    constructor() {
        this.routes = (app) => {
            app.route("/storage/:id/:filename").get((req, res) => {
                let id = req.params.id;
                let ip = String(req.clientIp).replace("::ffff:", "");
                User_1.default.findById(id).then(user => {
                    if (user) {
                        user.ip = ip;
                        user.save();
                        let dir = path_1.default.join(__dirname, `../../storage/${req.params.id}/${req.params.filename}`);
                        fs_1.default.exists(dir, (exist) => {
                            if (exist) {
                                let stream = fs_1.default.createReadStream(dir);
                                stream.pipe(res);
                            }
                        });
                    }
                });
            });
            // map
            app.route("/map").post((req, res) => {
                let players = req.query.players;
                let fileData = require(`../../maps/settings/${players}.json`);
                let mapData = [];
                for (let i = 0; i < fileData.length; i++) {
                    let row = [];
                    for (let j = 0; j < fileData[i].length; j++) {
                        if (fileData[i][j] === 1) {
                            let col = {};
                            col.obstacle = true;
                            col.x = i;
                            col.y = j;
                            col.count = 0;
                            col.selection = false;
                            col.tower = false;
                            col.base = false;
                            col.owner = "";
                            row.push(col);
                        }
                        else {
                            let col = {};
                            col.obstacle = false;
                            col.x = i;
                            col.y = j;
                            col.count = 0;
                            col.selection = false;
                            col.tower = false;
                            col.base = false;
                            col.owner = "";
                            row.push(col);
                        }
                    }
                    mapData.push(row);
                }
                fs_1.default.writeFile(path_1.default.join(__dirname, `../../maps/${players}_players.json`), JSON.stringify(mapData), (err) => {
                    if (err)
                        console.log(err);
                    return res.status(201).json({ success: true });
                });
            });
        };
    }
}
exports.Routes = Routes;

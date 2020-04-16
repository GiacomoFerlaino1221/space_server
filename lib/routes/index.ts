import { Application, Request, Response } from "express";
import User from "../model/User";
import fs from "fs";
import path from "path";

export class Routes {
  public routes = (app: Application) => {
    app.route("/storage/:id/:filename").get((req: Request, res: Response) => {
      let id = req.params.id;
      let ip = String(req.clientIp).replace("::ffff:", "");
      User.findById(id).then(user => {
        if (user) {
          user.ip = ip;
          user.save();
          let dir = path.join(
            __dirname,
            `../../storage/${req.params.id}/${req.params.filename}`
          );

          fs.exists(dir, (exist: any) => {
            if (exist) {
              let stream = fs.createReadStream(dir);
              stream.pipe(res);
            }
          });
        }
      });
    });

    // map
    app.route("/map").post((req: Request, res: Response) => {
      let players = req.query.players;
      let fileData = require(`../../maps/settings/${players}.json`);
      let mapData: any = [];

      for (let i = 0; i < fileData.length; i++) {
        let row: any = [];
        for (let j = 0; j < fileData[i].length; j++) {
          if (fileData[i][j] === 1) {
            let col: any = {};
            col.obstacle = true;
            col.x = i;
            col.y = j;
            col.count = 0;
            col.selection = false;
            col.tower = false;
            col.base = false;
            col.owner = "";
            row.push(col);
          } else {
            let col: any = {};
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

      fs.writeFile(
        path.join(__dirname, `../../maps/${players}_players.json`),
        JSON.stringify(mapData),
        (err: any) => {
          if (err) console.log(err);
          return res.status(201).json({ success: true });
        }
      );
    });
  };
}

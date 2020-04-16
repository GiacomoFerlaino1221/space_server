import express, { Application }from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import TelegramBot from 'node-telegram-bot-api';
import requestIp from 'request-ip';
import { Routes }from './routes';

import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

class App {
  public main: Application;
  public bot: TelegramBot;
  public readonly staticDir: string = path.join(__dirname, 'storage');
  public readonly mongoUri: string = `mongodb://admin:b12Xz00s@178.62.117.18:27017/minter_db`;
  public router: Routes = new Routes();

  constructor () {
    this.main = express();
    this.bot = new TelegramBot('1087610466:AAGj5zZy0liCQApu4Y_W96aNVlrkdiXWKzk', { polling: true });
    this.config();
    this.setupMongo();
    this.router.routes(this.main);
  }

  private config = (): void => {
    this.main.use(bodyParser.json({ limit: '5mb' }));
    this.main.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
    this.main.use(requestIp.mw());
  }

  private setupMongo = (): void => {
    mongoose.connect(this.mongoUri, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(() => {
      console.log('success connected to database');
    }).catch((err) => {
      console.log(err.message);
    });
  }
}

export default App;
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const request_ip_1 = __importDefault(require("request-ip"));
const routes_1 = require("./routes");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class App {
    constructor() {
        this.staticDir = path_1.default.join(__dirname, 'storage');
        this.mongoUri = `mongodb://admin:b12Xz00s@178.62.117.18:27017/minter_db`;
        this.router = new routes_1.Routes();
        this.config = () => {
            this.main.use(body_parser_1.default.json({ limit: '5mb' }));
            this.main.use(body_parser_1.default.urlencoded({ extended: false, limit: '5mb' }));
            this.main.use(request_ip_1.default.mw());
        };
        this.setupMongo = () => {
            mongoose_1.default.connect(this.mongoUri, {
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true
            }).then(() => {
                console.log('success connected to database');
            }).catch((err) => {
                console.log(err.message);
            });
        };
        this.main = express_1.default();
        this.bot = new node_telegram_bot_api_1.default('1087610466:AAGj5zZy0liCQApu4Y_W96aNVlrkdiXWKzk', { polling: true });
        this.config();
        this.setupMongo();
        this.router.routes(this.main);
    }
}
exports.default = App;

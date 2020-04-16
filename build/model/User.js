"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const UserModel = new mongoose_1.Schema({
    id: { type: Number, required: true },
    ip: { type: String },
    chatId: { type: Number, required: true },
    first_name: { type: String },
    last_name: { type: String },
    username: { type: String },
    isAdmin: { type: Boolean, default: false },
    password: { type: String },
    language_code: { type: String },
    game_url: { type: String },
    games: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    lose: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    wallet: { type: String },
    wallet_key: { type: String },
    wallet_mnemonic: { type: String },
}, { versionKey: false, timestamps: true });
const User = mongoose_1.default.model('User', UserModel);
exports.default = User;

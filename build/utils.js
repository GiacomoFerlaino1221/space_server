"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const Minter = require("minter-js-sdk").Minter;
const Minter_TX_TYPE = require("minter-js-sdk").TX_TYPE;
const minterAPI = new Minter({
    apiType: "node",
    baseURL: "https://minter-node-1.testnet.minter.network/"
});
const MinterWallet = require("minterjs-wallet");
/**
 * @returns {string}
 * @description generage string of hash (random string)
 */
exports.GenerateHash = () => {
    let hash = "";
    const length = 10, alphabet = [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z"
    ];
    for (let i = 0; i < length; i++) {
        hash += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return hash;
};
/**
 * @returns {object}
 * @description extract data from request
 */
exports.ExtractData = (data) => {
    var _a, _b, _c, _d, _e, _f;
    const chatId = data.chat.id, id = (_a = data.from) === null || _a === void 0 ? void 0 : _a.id, is_bot = (_b = data.from) === null || _b === void 0 ? void 0 : _b.is_bot, first_name = (_c = data.from) === null || _c === void 0 ? void 0 : _c.first_name, last_name = (_d = data.from) === null || _d === void 0 ? void 0 : _d.last_name, username = (_e = data.from) === null || _e === void 0 ? void 0 : _e.username, language_code = (_f = data.from) === null || _f === void 0 ? void 0 : _f.language_code, game_url = exports.GenerateHash();
    return {
        id,
        chatId,
        is_bot,
        first_name,
        last_name,
        username,
        language_code,
        game_url
    };
};
/**
 * @returns {void}
 * @description save user profile photo to storage
 */
exports.DownloadPhoto = (photo_url, id) => {
    axios_1.default({
        url: photo_url,
        responseType: "stream"
    })
        .then(response => {
        fs_1.default.mkdirSync(`./storage/${id}`);
        response.data.pipe(fs_1.default.createWriteStream(`./storage/${id}/avatar.jpg`));
    })
        .catch(err => {
        console.log("UTILS");
        console.log(err);
    });
};
/**
 * @returns {json}
 * @description send coin to Minter Wallet
 */
exports.TakeMinterCoin = (user, coins) => {
    return new Promise((resolve, reject) => {
        const walletAddrTo = process.env.MINTER_WALLET;
        const walletFrom = MinterWallet.walletFromMnemonic(user.wallet_mnemonic);
        const walletAddrFrom = walletFrom.getAddressString();
        let tr_addr = walletAddrTo;
        let tr_coin = "MNT";
        let tr_amount = coins;
        let txParams = {
            privateKey: walletFrom.getPrivateKeyString(),
            nonce: minterAPI.getNonce(walletAddrFrom),
            chainId: 2,
            type: Minter_TX_TYPE.SEND,
            data: {
                to: tr_addr,
                value: tr_amount,
                coin: tr_coin
            },
            gasCoin: "MNT",
            gasPrice: 1
        };
        minterAPI
            .postTx(txParams)
            .then(() => resolve())
            .catch((err) => reject(err));
    });
};
/**
 * @returns {json}
 * @description send coin to Minter Wallet
 */
exports.SendMinterCoin = (user, win) => {
    return new Promise((resolve, reject) => {
        const walletAddrTo = user.wallet;
        const walletFrom = MinterWallet.walletFromMnemonic("bracket labor drink build cloth glimpse giant burger hard outside obtain smile");
        const walletAddrFrom = walletFrom.getAddressString();
        let tr_addr = walletAddrTo;
        let tr_coin = "MNT";
        let tr_amount = (win / 100) * 90;
        let txParams = {
            privateKey: walletFrom.getPrivateKeyString(),
            nonce: minterAPI.getNonce(walletAddrFrom),
            chainId: 2,
            type: Minter_TX_TYPE.SEND,
            data: {
                to: tr_addr,
                value: tr_amount,
                coin: tr_coin
            },
            gasCoin: "MNT",
            gasPrice: 1
        };
        minterAPI
            .postTx(txParams)
            .then(() => resolve())
            .catch((err) => reject(err));
    });
};
exports.loadMap = (players) => {
    let mapData = require(`../maps/${players}_players.json`);
    return mapData;
};

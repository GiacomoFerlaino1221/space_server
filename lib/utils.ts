import axios from "axios";
import fs from "fs";

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
export const GenerateHash = (): string => {
  let hash: string = "";

  const length: number = 10,
    alphabet: string[] = [
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
export const ExtractData = (data: any) => {
  const chatId = data.chat.id,
    id = data.from?.id,
    is_bot = data.from?.is_bot,
    first_name = data.from?.first_name,
    last_name = data.from?.last_name,
    username = data.from?.username,
    language_code = data.from?.language_code,
    game_url = GenerateHash();

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
export const DownloadPhoto = (photo_url: string, id: string): void => {
  axios({
    url: photo_url,
    responseType: "stream"
  })
    .then(response => {
      fs.mkdirSync(`./storage/${id}`);
      response.data.pipe(fs.createWriteStream(`./storage/${id}/avatar.jpg`));
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
export const TakeMinterCoin = (user: any, coins: number) => {
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
      .catch((err: any) => reject(err));
  });
};

/**
 * @returns {json}
 * @description send coin to Minter Wallet
 */
export const SendMinterCoin = (user: any, win: number) => {
  return new Promise((resolve, reject) => {
    const walletAddrTo = user.wallet;
    const walletFrom = MinterWallet.walletFromMnemonic(
      "bracket labor drink build cloth glimpse giant burger hard outside obtain smile"
    );
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
      .catch((err: any) => reject(err));
  });
};

export const loadMap = (players: number) => {
  let mapData = require(`../maps/${players}_players.json`);
  return mapData;
};

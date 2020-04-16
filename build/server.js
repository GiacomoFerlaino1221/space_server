"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = __importDefault(require("socket.io"));
const axios_1 = __importDefault(require("axios"));
const Minter = require("minter-js-sdk").Minter;
const Minter_TX_TYPE = require("minter-js-sdk").TX_TYPE;
const minterAPI = new Minter({
    apiType: "node",
    baseURL: "https://minter-node-1.testnet.minter.network/"
});
const MinterWallet = require("minterjs-wallet");
const User_1 = __importDefault(require("./model/User"));
const utils_1 = require("./utils");
const Game_1 = require("./model/Game");
const Player_1 = require("./model/Player");
const Entity_1 = require("./model/Entity");
const app = new app_1.default();
const server = http_1.default.createServer(app.main);
const io = socket_io_1.default(server);
(() => __awaiter(void 0, void 0, void 0, function* () {
    server.listen(process.env.PORT);
}))();
const opts = {
    reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: true,
        keyboard: [
            [
                {
                    text: "Ссылка для входа 🔗",
                    callback_data: "edit"
                },
                {
                    text: "Баланс 💰",
                    callback_data: "edit1"
                }
            ],
            [
                {
                    text: "Вывести деньги 💸",
                    callback_data: "edit2"
                }
            ],
            [
                {
                    text: "Статистика",
                    callback_data: "edit2"
                }
            ]
        ]
    }
};
let games = [];
let gamesList = [];
let SOCKET_LIST = {};
let PLAYERS_LIST = {};
io.sockets.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    SOCKET_LIST[socket.id] = yield socket;
    // Inititalize user
    socket.on("init", (params) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = params;
        let user = yield User_1.default.findOne({ game_url: id });
        try {
            if (user) {
                let response = yield axios_1.default.get(`https://api.spacegame.store/v1/balance?userId=${user._id}`, { headers: { "x-minter-key": "123123" } });
                user.balance = response.data.balance;
                let savedUser = yield user.save();
                socket.emit("user", savedUser);
            }
        }
        catch (e) {
            console.log(e);
            console.log("---USERID BALANCE---");
            socket.emit("user", {});
        }
    }));
    // Create the game
    socket.on("createGame", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let user = yield User_1.default.findOne({ game_url: data.id });
        try {
            if (user) {
                let player = new Player_1.Player(user._id, `storage/${user._id}/avatar.jpg`, socket.id);
                let game = new Game_1.Game(data.coins, data.maxPlayers, player);
                player.gameID = game.id;
                socket.join(game.id);
                games.push(game);
                gamesList.push({
                    id: game.id,
                    creator: user._id,
                    creator_name: (user.first_name ? user.first_name : "") +
                        " " +
                        (user.last_name ? user.last_name : ""),
                    coins: game.coins,
                    enteredPlayers: game.enteredPlayers,
                    maxPlayers: game.maxPlayers
                });
                PLAYERS_LIST[socket.id] = player;
            }
        }
        catch (error) {
            console.log(error);
        }
        // User.findOne({ game_url: data.id }).then(user => {
        //   if (user) {
        //     let player = new Player(
        //       user._id,
        //       `storage/${user._id}/avatar.jpg`,
        //       socket.id
        //     );
        //     let game = new Game(data.coins, data.maxPlayers, player);
        //     player.gameID = game.id;
        //     socket.join(game.id);
        //     games.push(game);
        //     gamesList.push({
        //       id: game.id,
        //       creator: user._id,
        //       creator_name:
        //         (user.first_name ? user.first_name : "") +
        //         " " +
        //         (user.last_name ? user.last_name : ""),
        //       coins: game.coins,
        //       enteredPlayers: game.enteredPlayers,
        //       maxPlayers: game.maxPlayers
        //     });
        //   }
        // });
    }));
    // Connect to game
    socket.on("connectToGame", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let gameId = data.gameId || null;
        let userId = data.userId || null;
        try {
            if (gameId) {
                let game = games.find(g => g.id === gameId);
                if (game) {
                    User_1.default.findOne({ game_url: userId }).then(user => {
                        if (user && user.balance > 0) {
                            let player = new Player_1.Player(user._id, `storage/${user._id}/avatar.jpg`, socket.id);
                            if (game) {
                                io.sockets.connected[player.socket_id].join(game.id);
                                let gameInList = gamesList.find(g => { var _a; return g.id === ((_a = game) === null || _a === void 0 ? void 0 : _a.id); });
                                game.connectPlayer(player);
                                player.gameID = gameId;
                                PLAYERS_LIST[socket.id] = player;
                                gameInList.enteredPlayers = game.enteredPlayers;
                            }
                        }
                    });
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }));
    // Start Game
    socket.on("startGame", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let game = yield games.find(g => g.id === data.id);
        let promises = [];
        if (game) {
            let coins = game.coins;
            for (let i in game.players) {
                User_1.default.findById(game.players[i].id).then(user => {
                    if (user) {
                        promises.push(utils_1.TakeMinterCoin(user, coins).then(() => user.save()));
                    }
                });
            }
            Promise.all(promises).then(() => {
                if (game) {
                    game.start();
                    io.sockets.to(game.id).emit("start", {
                        game,
                        pos_x: game.players[socket.id].pos_x,
                        pos_y: game.players[socket.id].pos_y
                    });
                    console.log("START. Entered players: ", game.enteredPlayers);
                }
            });
        }
    }));
    // Leave Game
    socket.on("leaveGame", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let game = games.find(g => g.id === data.game.id);
        let player = yield PLAYERS_LIST[socket.id];
        try {
            if (game) {
                delete game.players[socket.id];
                game.enteredPlayers--;
                game.opened = false;
                if (player) {
                    for (let row in game.map.mapData) {
                        for (let col in game.map.mapData[row]) {
                            let tmp = game.map.mapData[row][col];
                            let obj = new Entity_1.Entity(tmp.x, tmp.y, 0, "", "");
                            if (tmp.owner === player.socket_id) {
                                tmp = obj;
                                game.map.mapData[row][col] = obj;
                            }
                        }
                    }
                }
                User_1.default.findById(player.id).then(user => {
                    if (user) {
                        user.lose++;
                        user.save();
                    }
                });
                if (game.enteredPlayers === 1) {
                    let win = game.coins * game.maxPlayers;
                    for (let id in game.players) {
                        let winner_socket = game.players[id].socket_id;
                        let winner_id = game.players[id].id;
                        User_1.default.findById(winner_id).then(user => {
                            if (user) {
                                utils_1.SendMinterCoin(user, win)
                                    .then(() => {
                                    user.wins++;
                                    user.save().then(() => {
                                        io.sockets.to(winner_socket).emit("win");
                                        games = games.filter(g => { var _a; return g.id !== ((_a = game) === null || _a === void 0 ? void 0 : _a.id); });
                                        gamesList = gamesList.filter(g => { var _a; return ((_a = game) === null || _a === void 0 ? void 0 : _a.id) !== g.id; });
                                    });
                                })
                                    .catch(err => {
                                    console.log("MINTER ERROR!");
                                });
                            }
                        });
                    }
                }
                // let gameId = game.id;
                // game.enteredPlayers--;
                // if (game.creator.socket_id === socket.id) {
                //   io.sockets.to(gameId).emit("reloadLauncher");
                //   games = games.filter(g => g.id !== gameId);
                //   gamesList = gamesList.filter(g => g.id !== gameId);
                // } else {
                //   delete game.players[socket.id];
                //   delete game.map.players[socket.id];
                // }
                // if (gameInList) {
                //   gameInList.enteredPlayers = game.enteredPlayers;
                // }
                // if (game.enteredPlayers < 1) {
                //   games = games.filter(g => g.id !== gameId);
                //   gamesList = gamesList.filter(g => g.id !== gameId);
                // }
            }
        }
        catch (error) {
            console.log("LEAVE GAME ERROR");
        }
    }));
    // Move
    socket.on("move", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const direction = data.direction || null;
        const gameId = data.gameId || null;
        try {
            if (direction && gameId) {
                let game = games.find(g => g.id == gameId);
                if (game) {
                    let player = game.players[socket.id];
                    if (player) {
                        game.map.playerMove(direction, player);
                    }
                }
            }
        }
        catch (error) {
            console.log("MOVE ERROR");
        }
    }));
    // Move to position
    socket.on("moveTo", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { x, y, gameId, selection } = data;
            if (gameId) {
                let game = games.find(g => g.id == gameId);
                if (game) {
                    let player = game.players[socket.id];
                    if (player) {
                        game.map.playerMoveTo(x, y, player, selection);
                    }
                }
            }
        }
        catch (e) {
            console.log(e);
        }
    }));
    // Lose Game
    socket.on("loseGame", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let game = yield games.find(g => g.id === data.gameId);
        if (game) {
            let p = game.players[socket.id];
            delete game.players[socket.id];
            delete game.map.players[socket.id];
            gamesList = gamesList.filter(g => { var _a; return ((_a = game) === null || _a === void 0 ? void 0 : _a.id) !== g.id; });
            game.enteredPlayers--;
            if (game.enteredPlayers < 2) {
                let win = game.coins * game.maxPlayers;
                for (let i in game.players) {
                    User_1.default.findById(game.players[i].id).then(user => {
                        if (user) {
                            utils_1.SendMinterCoin(user, win).then(() => {
                                user.wins++;
                                user.save().then(() => {
                                    var _a;
                                    io.sockets.to((_a = game) === null || _a === void 0 ? void 0 : _a.players[i].socket_id).emit("win");
                                    games = games.filter(g => g.id !== data.gameId);
                                    gamesList = gamesList.filter(g => { var _a; return ((_a = game) === null || _a === void 0 ? void 0 : _a.id) !== g.id; });
                                });
                            });
                        }
                    });
                }
            }
            let looser = yield User_1.default.findById(p.id);
            if (looser) {
                looser.lose++;
                looser.save();
            }
        }
        io.sockets.to(data.player.socket_id).emit("lose");
    }));
    // Player Die
    socket.on("playerDie", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let game = games.find(g => g.id === data.gameId);
            if (game) {
                let player = game.players[socket.id];
                if (player) {
                    player.alive = false;
                    for (let row in game.map.mapData) {
                        for (let col in game.map.mapData[row]) {
                            let tmp = game.map.mapData[row][col];
                            let obj = new Entity_1.Entity(tmp.x, tmp.y, 0, "", "");
                            if (tmp.owner === player.socket_id) {
                                tmp = obj;
                                game.map.mapData[row][col] = obj;
                            }
                        }
                    }
                    player.lose = true;
                }
            }
        }
        catch (error) {
            console.log("PLAYER DIE ERROR");
        }
    }));
    // Recieve message
    socket.on("reciveMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let game = games.find(g => g.id === data.game.id);
            if (game) {
                let player = game.players[socket.id];
                if (player) {
                    game.chat.push({
                        avatar: player.avatar,
                        message: data.message,
                        id: player.socket_id
                    });
                    for (let i in game.players) {
                        io.sockets.to(game.players[i].socket_id).emit("sendMessage");
                    }
                }
            }
        }
        catch (error) {
            console.log("CHAT ERROR");
        }
    }));
    // Disconnect from the game
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("disconnect");
        let player = yield PLAYERS_LIST[socket.id];
        let game = yield games.find((g) => g.id === player.gameID);
        if (game) {
            try {
                delete game.players[socket.id];
                game.enteredPlayers--;
                game.opened = false;
                if (player) {
                    for (let row in game.map.mapData) {
                        for (let col in game.map.mapData[row]) {
                            let tmp = game.map.mapData[row][col];
                            let obj = new Entity_1.Entity(tmp.x, tmp.y, 0, "", "");
                            if (tmp.owner === player.socket_id) {
                                tmp = obj;
                                game.map.mapData[row][col] = obj;
                            }
                        }
                    }
                }
                User_1.default.findById(player.id).then(user => {
                    if (user) {
                        user.lose++;
                        user.save();
                    }
                });
                if (game.enteredPlayers === 1) {
                    let win = game.coins * game.maxPlayers;
                    for (let id in game.players) {
                        let winner_socket = game.players[id].socket_id;
                        let winner_id = game.players[id].id;
                        User_1.default.findById(winner_id).then(user => {
                            if (user) {
                                utils_1.SendMinterCoin(user, win)
                                    .then(() => {
                                    user.wins++;
                                    user.save().then(() => {
                                        io.sockets.to(winner_socket).emit("win");
                                        games = games.filter(g => { var _a; return g.id !== ((_a = game) === null || _a === void 0 ? void 0 : _a.id); });
                                        gamesList = gamesList.filter(g => { var _a; return ((_a = game) === null || _a === void 0 ? void 0 : _a.id) !== g.id; });
                                    });
                                })
                                    .catch(err => {
                                    console.log("MINTER ERROR!");
                                });
                            }
                        });
                    }
                }
            }
            catch (error) {
                console.log("ERRRORROROROROR", error.message);
            }
        }
        delete PLAYERS_LIST[socket.id];
        delete SOCKET_LIST[socket.id];
    }));
}));
/** BOT */
let step = 0;
let walletOperations = false;
let extractWallet = {
    address: "",
    amount: 0,
    confirmed: false
};
app.bot.on("message", data => {
    let userData = utils_1.ExtractData(data);
    console.log(data);
    // Register new user and save photo to storage
    if (!userData.is_bot) {
        User_1.default.findOne({ id: userData.id }).then(u => {
            if (!u) {
                User_1.default.create(userData).then(user => {
                    const walletTo = MinterWallet.generateWallet();
                    const walletAddrTo = walletTo.getAddressString();
                    const walletMnemonicTo = walletTo.getMnemonic();
                    user.wallet = walletAddrTo;
                    user.wallet_key = walletTo.getPrivateKeyString();
                    user.wallet_mnemonic = walletMnemonicTo;
                    user.balance = 10.0;
                    const walletFrom = MinterWallet.walletFromMnemonic(process.env.MINTER_MNEMONIC);
                    const walletAddrFrom = walletFrom.getAddressString();
                    let tr_addr = walletAddrTo;
                    let tr_coin = "MNT";
                    let tr_amount = 10.0;
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
                        .then(() => {
                        user.save();
                    })
                        .catch((err) => {
                        console.log(err);
                    });
                    let user_profile = app.bot.getUserProfilePhotos(String(userData.id));
                    user_profile.then(res => {
                        let file_id = res.photos ? res.photos[0][0].file_id : null;
                        let file = file_id ? app.bot.getFile(file_id) : null;
                        if (file) {
                            file.then(result => {
                                let file_path = result.file_path;
                                let photo_url = `https://api.telegram.org/file/bot${process.env.TM_TOKEN}/${file_path}`;
                                utils_1.DownloadPhoto(photo_url, user._id);
                            });
                        }
                    });
                });
                app.bot.sendMessage(userData.chatId, `Welcome to the Minter!\nВаша ссылка для входа:\nhttps://spacegame.store/token=${userData.game_url}`, opts);
            }
            else {
                app.bot.sendMessage(userData.chatId, "", opts);
            }
        });
    }
    // Get link of game
    if ((data && data.text === "/link") || data.text === "Ссылка для входа 🔗") {
        walletOperations = false;
        step = 0;
        User_1.default.findOne({ id: userData.id })
            .then(user => {
            if (user) {
                let link = utils_1.GenerateHash();
                user.game_url = link;
                user.save();
                app.bot.sendMessage(user.chatId, `Ваша ссылка для входа:\nhttps://spacegame.store/token=${link}`, opts);
            }
        })
            .catch(err => {
            throw new Error(err);
        });
    }
    // Get balance
    if ((data && data.text === "/balance") || data.text === "Баланс 💰") {
        walletOperations = false;
        step = 0;
        User_1.default.findOne({ id: userData.id }).then(user => {
            if (user) {
                axios_1.default
                    .get(`https://api.spacegame.store/v1/balance?userId=${user._id}`, {
                    headers: {
                        "x-minter-key": "123123"
                    }
                })
                    .then(({ data }) => {
                    user.balance = data.balance;
                    user.save();
                    app.bot.sendMessage(user.chatId, `Ваш баланс: ${Number(user.balance).toFixed(2)} 🤑`, opts);
                })
                    .catch(err => {
                    console.log("---BALANCE---");
                    console.log(err);
                });
            }
        });
    }
    // Get statistics
    if (data.text === "Статистика") {
        walletOperations = false;
        step = 0;
        User_1.default.findOne({ id: userData.id })
            .then(user => {
            if (user) {
                let wins = user.wins;
                let lose = user.lose;
                app.bot.sendMessage(user.chatId, `Ваши победы: ${wins}\nВаши поражения: ${lose}`, opts);
            }
        })
            .catch(err => {
            throw new Error(err);
        });
    }
    // Extract money
    if (data && data.text === "Вывести деньги 💸") {
        walletOperations = true;
        User_1.default.findOne({ id: userData.id }).then(user => {
            var _a;
            if (user && user.balance > 1) {
                step = 1;
                app.bot.sendMessage(user.chatId, `Укажите адрес кошелька`, opts);
            }
            else {
                app.bot.sendMessage(userData.chatId, `На вашем балансе недостаточно SPACE для вывода!\nПобеждайте и выводите SPACE на свой кошелек.\n\nВаша ссылка:\nhttps://spacegame.store/token=${(_a = user) === null || _a === void 0 ? void 0 : _a.game_url}`);
            }
        });
    }
    if (data && data.text && step === 1) {
        extractWallet.address = data.text;
        app.bot.sendMessage(userData.chatId, "Укажите сумму", opts);
    }
    if (data && data.text && step === 2) {
        extractWallet.amount = parseInt(data.text);
        app.bot.sendMessage(userData.chatId, `Вы уверены ?\n${extractWallet.amount} SPACE на ${extractWallet.address} (да / нет)`, opts);
    }
    if (data && data.text && step === 3) {
        if (String(data.text).toLowerCase() === "да") {
            extractWallet.confirmed = true;
        }
        else {
            extractWallet.confirmed = false;
        }
        if (extractWallet.address.length === 42 &&
            extractWallet.amount > 0 &&
            extractWallet.confirmed) {
            // check user and send data
            User_1.default.findOne({ id: userData.id }).then(user => {
                if (user) {
                    if (user.balance >= extractWallet.amount) {
                        const walletAddrTo = extractWallet.address;
                        const walletFrom = MinterWallet.walletFromMnemonic(user.wallet_mnemonic);
                        const walletAddrFrom = walletFrom.getAddressString();
                        let tr_addr = walletAddrTo;
                        let tr_coin = "MNT";
                        let tr_amount = extractWallet.amount;
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
                            .then(() => {
                            user.save();
                        })
                            .catch((err) => {
                            console.log(err);
                        });
                        app.bot.sendMessage(userData.chatId, "Успешно выведено!", opts);
                    }
                    else {
                        app.bot.sendMessage(userData.chatId, "Отменено!\nНедостаточно средств!");
                    }
                }
            });
        }
        else {
            app.bot.sendMessage(userData.chatId, "Отменено!", opts);
        }
    }
    if (walletOperations)
        step++;
});
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    for (let i in SOCKET_LIST) {
        yield SOCKET_LIST[i].emit("update", { games: gamesList });
    }
    for (let g in games) {
        yield io.sockets.to(games[g].id).emit("gameInfo", games[g]);
    }
}), 100);

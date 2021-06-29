import Mongoose from "server/db/Mongoose";
import passportLib from 'server/lib/passport';
import passport from "../lib/passport";
import MinterApi from "../lib/MinterApi";

//Mongoose.User.find().then(console.log)
//Mongoose.User.updateMany({},{group:null}).then(console.log).catch(console.error)
//Mongoose.game.deleteMany({}).then(console.log)
const CronJob = require('cron').CronJob;

module.exports.controller = function (app) {
    const c2 = new CronJob('* * * * * *', async function () {
        //Mongoose.game.timeFoldPlayers();
        Mongoose.game.reloadFinished();
    }, null, true, 'America/Los_Angeles')

    const c3 = new CronJob('*/10 * * * * *', async function () {
        balances()
        //Mongoose.game.deleteForgottenGames();
    }, null, true, 'America/Los_Angeles')

    async function balances(){
        const users = await Mongoose.user.find().populate('gameWallet');
        for(const user of users){
            if(!user.gameWallet){
                user.gameWallet = await MinterApi.newWallet('game','',user);
                await user.save()
            }
            await MinterApi.setWalletBalance(user.gameWallet)
        }
    }


    const {USER1, USER2, USER3} = process.env;
    const test = false;
    //doTestRoPaSci();
    //test && doTestPoker();
    test && TesticTac();

    async function TesticTac(){
        async function doBet(game, row,col, userId) {
            await game.doModelTurn(userId, {turn: {row,col}});
        }
        const req = {
            session: {userId: USER1},
            body: {
                module: {name:'TicTacToe'},
                type: 'virtual'
            }
        }
        //START
        let game = await Mongoose.game.start(req);
        //JOIN small blind
        await game.doModelJoin(USER2, true).catch(console.log);
        await doBet(game, 4,4, USER1)
        await doBet(game, 4,3, USER2)
        await doBet(game, 4,5, USER1)
        await doBet(game, 5,5, USER2)
        //await doBet(game, 4,6, USER1)
        //await doBet(game, 1,1, USER2)
    }

    async function doTestPoker() {
        async function doBet(game, bet, userId) {
            await game.doModelTurn(userId, {turn: {bet}});
        }


        const req = {
            session: {userId: USER1},
            body: {
                module: {name:'Poker'},
                type: 'virtual'
            }
        }
        //START
        let game = await Mongoose.game.start(req);

        //JOIN small blind
        await game.doModelJoin(USER2, true).catch(console.log);

        //Join player 3
        await game.doModelJoin(USER3, true).catch(console.log);
        await doBet(game, 15, USER2).catch(console.log)

        await doBet(game, 25, USER3).catch(console.log)
        await doBet(game, 15, USER1).catch(console.log)
        await doBet(game, 5, USER2).catch(console.log)

        await doBet(game, 0, USER1).catch(console.log)
        await doBet(game, 0, USER2).catch(console.log)
        await doBet(game, 0, USER3).catch(console.log)

        await doBet(game, 0, USER1).catch(console.log)
        await doBet(game, 0, USER2).catch(console.log)
        await doBet(game, 0, USER3).catch(console.log)

        await doBet(game, 10, USER1).catch(console.log)
        await doBet(game, 10, USER2).catch(console.log)
        await doBet(game, -1, USER3).catch(console.log)
        //console.log(game.activePlayer)
        //await doBet(game, 0, USER3)

        //Mongoose.game.findOne().populate('players').sort({createdAt: -1}).then(r => console.log('FIND DATA', r.data.bets))

    }

    //Mongoose.game.deleteMany({}).then(console.log)
    //Mongoose.user.updateMany({},{$set:{virtualBalance:100000}}).then(r=>console.log('================',r))
    //Mongoose.user.find().then(r=>console.log(r.map(r=>r.virtualBalance)))

    app.post('/api/game/start', passportLib.isLogged, (req, res) => {
        Mongoose.game.start(req)
            .then(r => res.send(r))
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/game/play/:id', async (req, res) => {
        if(test){
            const lastGame = await Mongoose.game.findOne().sort({createdAt: -1});
            if(!lastGame) return res.sendStatus(200)
            req.params.id = lastGame.id
        }
        Mongoose.game.hideOpponentData(req)
            .then(r=> {
                //console.log(r.players.length)
                res.send(r)
            })
            .catch(e => {res.status(500).send(app.locals.adaptError(e))})
    });

    app.post('/api/game/join/:id', passportLib.isLogged, (req, res) => {
        Mongoose.game.doJoin(req)
            .then(()=>res.sendStatus(200))
            .catch(e => {res.status(500).send(app.locals.adaptError(e))})

    });

    app.post('/api/game/turn/:id', passportLib.isLogged, (req, res) => {
        Mongoose.game.doTurn(req)
            .then(()=>res.sendStatus(200))
            .catch(e => {res.status(500).send(app.locals.adaptError(e))})
    });

    app.post('/api/game/leave/:id', passportLib.isLogged, (req, res) => {
        Mongoose.game.leaveGame(req)
            .then(()=>res.sendStatus(200))
            .catch(e => {res.status(500).send(app.locals.adaptError(e))})
    });

    app.post('/api/game/modules', (req, res) => {
        res.send(Mongoose.game.modules())
    });

    app.post('/api/game/list', (req, res) => {
        const {module} = req.body;
        Mongoose.game.find({module})
            .sort({updatedAt:-1})
            .select(['name', 'type', 'module'])
            //.populate('players', ['name','photo','realBalance','virtualBalance'])
            .then(r => {
                res.send(r)
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/game/cabinet/wallet/withdraw', passport.isLogged, (req, res) => {
        Mongoose.user.findById(req.session.userId)
            .then(r => {
                if (!r.realBalance) return res.status(500).send('Insufficient funds')
                MinterApi.fromMainTo(r.address, r.realBalance - process.env.GAME_WITHDRAW_FEE)
                    .then(tx => {
                        r.realBalance = 0;
                        r.save()
                            .then(() => res.send(tx))
                    })
                    .catch(e => {
                        res.status(500).send(app.locals.adaptError(e))
                    })
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/game/cabinet/wallet/change', passport.isLogged, async (req, res) => {
        Mongoose.user.findById(req.session.userId)
            .then(user => {
                if (user.gameWallet) return res.sendStatus(200)
                MinterApi.newWallet('game', '', req.session.userId)
                    .then(r => {
                        user.gameWallet = r;
                        user.save()
                        res.sendStatus(200)
                    })
                    .catch(e => {
                        res.status(500).send(app.locals.adaptError(e))
                    })
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })

    })

};

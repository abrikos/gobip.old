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
        Mongoose.game.timeFoldPlayers();
        Mongoose.game.reloadFinished();
    }, null, true, 'America/Los_Angeles')

    const c3 = new CronJob('* * * * * *', async function () {
        Mongoose.game.deleteForgottenGames();
    }, null, true, 'America/Los_Angeles')

    const test = true;
    //doTestRoPaSci();
    doTestPoker();


    async function doTestRoPaSci() {
        async function doTurn(game, turn, userId) {
            req.body.turn = turn;
            req.session.userId = userId
            await game.doModelTurn(req);
        }
        if (!test) return
        const {USER1, USER2, USER3} = process.env;
        const req = {
            session: {userId: USER1},
            body: {
                module: {name:'RoPaSci'},
                type: 'virtual'
            }
        }
        //START
        let game = await Mongoose.game.start(req);

        //JOIN small blind
        req.session.userId = USER3
        await game.doModelJoin(req, true);
        await doTurn(game,'paper',USER1);
        await doTurn(game,'rock',USER3);
    }

    async function doTestPoker() {
        async function doBet(game, bet, userId) {
            req.body.bet = bet;
            req.session.userId = userId
            await game.doModelBet(req);
        }
        if (!test) return
        const {USER1, USER2, USER3} = process.env;
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
        req.session.userId = USER2
        await game.doModelJoin(req, true);

        //Join player 3
        req.session.userId = USER3
        delete req.body.bet;
        await game.doModelJoin(req, true);
        console.log(game.data.bets)
        return;
        //console.log('....... Active player:', game.activePlayer.name)
        await doBet(game, 10, USER2)
        await doBet(game, 30, USER3)
        await doBet(game, 10, USER1)
        await doBet(game, 10, USER2)
        await doBet(game, 0, USER1)

        await doBet(game, 0, USER1)
        await doBet(game, 0, USER2)
        await doBet(game, 0, USER3)

        await doBet(game, 0, USER1)
        await doBet(game, 0, USER2)
        await doBet(game, 0, USER3)

        await doBet(game, 0, USER1)
        await doBet(game, 0, USER2)
        //await doBet(game, 0, USER3)
        //console.log(game.activePlayer)
        //await doBet(game, 0, USER3)


        //Mongoose.game.findOne().populate('players').sort({createdAt: -1}).then(r => console.log('FIND DATA', r.data.bets))

    }

    //tictoctest();
    function tictoctest(){
        Mongoose.game.findOne({module:'TicTacToe'})
            .then(game=>{
                console.log(game.test())
            })
    }

    //Mongoose.game.findOne().sort({createdAt: -1}).then(console.log)
    //Mongoose.game.deleteMany({}).then(console.log)
    //Mongoose.user.find().then(r=>console.log(r.map(r=>r.id)))

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
            req.params.id = lastGame.id
        }
        Mongoose.game.hideOpponentData(req)
            .then(r=> {
                res.send(r)
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/game/join/:id', passportLib.isLogged, (req, res) => {
        Mongoose.game.doJoin(req)
        res.sendStatus(200)
    });

    app.post('/api/game/turn/:id', passportLib.isLogged, (req, res) => {
        Mongoose.game.doTurn(req)
        res.sendStatus(200)
    });

    app.post('/api/game/can-leave/:id', passportLib.isLogged, (req, res) => {
        Mongoose.game.canLeave(req)
            .then(canLeave=>res.send({canLeave}))
    });

    app.post('/api/game/leave/:id', passportLib.isLogged, (req, res) => {
        Mongoose.game.leaveGame(req)
        res.sendStatus(200)
    });

    app.post('/api/game/turn/:id', passportLib.isLogged, (req, res) => {

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
            .then(r => res.send(r))
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

    app.post('/api/game/cabinet/user/info', passport.isLogged, async (req, res) => {
        Mongoose.user.findById(req.session.userId)
            .populate('gameWallet')
            .then(async r => {
                const {realBalance, virtualBalance} = r;
                res.send({address: r.gameWallet && r.gameWallet.address, realBalance, virtualBalance})
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    })

    app.post('/api/game/bet/:id', passport.isLogged, async (req, res) => {
        Mongoose.game.doBet(req)
        res.sendStatus(200)
    })

};

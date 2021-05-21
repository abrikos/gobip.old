import Mongoose from "server/db/Mongoose";
import passportLib from 'server/lib/passport';
import passport from "../lib/passport";
import MinterApi from "../lib/MinterApi";
import PokerApi from "../lib/PokerApi";
import PokerGame from "../lib/PokerGame";

//Mongoose.User.find().then(console.log)
//Mongoose.User.updateMany({},{group:null}).then(console.log).catch(console.error)


module.exports.controller = function (app) {
    const test = true;
    doTest();
    async function doTest(){
        if(!test) return

        const req ={
            session:{userId:process.env.USER1},
            body:{
                module: 'Dices',
                type : 'virtual'
            }
        }
        let game = await Mongoose.game.start(req);
        console.log('TESTING', game.name)

        req.session.userId = process.env.USER2
        await game.doModelJoin(req);

        req.body = {bet:10}
        req.session.userId = process.env.USER2
        console.log('Active player:', game.activePlayer.name, game.activePlayer.id)
        await game.doModelBet(req)

        req.session.userId = process.env.USER3
        delete req.body.bet;
        await game.doModelJoin(req);
        console.log('Active player:', game.activePlayer.name, game.activePlayer.id)

        req.body = {bet:10}
        req.session.userId = process.env.USER1
        await game.doModelBet(req)
        console.log('Active player:', game.activePlayer.name, game.activePlayer.id)


        //Mongoose.game.findOne().populate('players').sort({createdAt:-1}).then(r=>console.log('FIND DATA',r.data.waitList))

    }
    //Mongoose.user.find().then(r=>console.log(r.map(r=>r.id)))

    app.post('/api/game/start', passportLib.isLogged, (req, res) => {
        Mongoose.game.start(req)
            .then(r=>res.send(r))
            .catch(e => {res.status(500).send(app.locals.adaptError(e))})
    });

    app.post('/api/game/play/:id',  (req, res) => {
        const promise = test ? Mongoose.game.findOne().sort({createdAt:-1}) :        Mongoose.game.findById(req.params.id);
        promise
            .populate('players', ['name','photo','realBalance','virtualBalance'])
            .then(async r=> {
                res.send(await r.adaptGameForClients(req))
            })
            //.catch(e => {res.status(500).send(app.locals.adaptError(e))})
    });


    app.post('/api/game/modules',  (req, res) => {
        res.send(Mongoose.game.modules)
    });

    app.post('/api/game/list',  (req, res) => {
        const {module} = req.body;
        Mongoose.game.find({module})
            .select(['name', 'type', 'module'])
            //.populate('players', ['name','photo','realBalance','virtualBalance'])
            .then(r=>res.send(r))
            .catch(e => {res.status(500).send(app.locals.adaptError(e))})
    });

    app.post('/api/game/cabinet/wallet/withdraw', passport.isLogged, (req, res) => {
        Mongoose.user.findById(req.session.userId)
            .then(r => {
                if (!r.realBalance) return res.status(500).send('Insufficient funds')
                MinterApi.fromMainTo(r.address, r.realBalance - process.env.POKER_WITHDRAW_FEE)
                    .then(tx => {
                        r.realBalance = 0;
                        r.save()
                            .then(() => res.send(tx))
                    })
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });


    app.post('/api/game/cabinet/wallet/change', passport.isLogged, async (req, res) => {
        PokerApi.newWallet(req.session.userId)
            .then(r => res.send(r.gameWallet.address))
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
        Mongoose.game.findById(req.params.id)
            .populate('players', ['name','photo','realBalance','virtualBalance'])
            .then(r=> {
                r.doModelBet(req)
                    .then(r=>res.send(r))
                    .catch(e => {res.status(500).send(app.locals.adaptError(e))})
            })
            .catch(e => {res.status(500).send(app.locals.adaptError(e))})
    })

};

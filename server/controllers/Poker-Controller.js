import Mongoose from "server/db/Mongoose";
import passport from "server/lib/passport";
import PokerApi from "../lib/PokerApi";
import PokerGame from "../lib/PokerGame";


PokerGame.runTest && PokerGame.test()

module.exports.controller = function (app) {
    //Mongoose.poker.findOne().then(console.log)
    app.post('/api/poker/view/:id', async (req, res) => {
        const prom = PokerGame.runTest ? Mongoose.poker.findOne().sort({createdAt: -1}) : Mongoose.poker.findById(req.params.id);
        prom
            .populate('user', ['name', 'photo', 'realBalance', 'virtualBalance'])
            .populate('opponent', ['name', 'photo', 'realBalance', 'virtualBalance'])
            //.select(['name', 'createdAt', 'desk', 'bank', 'type', 'opponentCards', 'userCards', 'userBets', 'opponentBets', 'result', 'winner', 'turn'])
            .then(poker => {
                const params = {}
                if (!poker.result && poker.isPlaying && poker.secondsLeft <= 0) {
                    poker.doFold()
                    poker.save()
                }
                if (poker.user.equals(req.session.userId)) {
                    params.role = 'user';
                } else if (poker.opponent && poker.opponent.equals(req.session.userId)) {
                    params.role = 'opponent'
                } else {
                    params.role = 'viewer'
                }

                //if (!(isUser || isOpponent)) return res.status(403).send('Wrong user')
                if (!poker.result && !PokerApi.testing) {
                    if (['user', 'viewer'].includes(params.role)) poker.opponentCards = [0, 1];
                    if (['opponent', 'viewer'].includes(params.role)) poker.userCards = [0, 1];
                }

                params.canJoin = params.role === 'viewer' && req.session.userId
                params.isViewer = params.canJoin;
                params.alertSeconds = process.env.POKER_ALERT_SECONDS * 1;
                res.send({poker, params});
            })
            .catch(e => {
                console.log(app.locals.adaptError(e));
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/poker/join/:id', passport.isLogged, (req, res) => {
        PokerGame.join(req.params.id, req.session.userId)
            .then(r => res.sendStatus(200))
            .catch(e => {
                console.log(app.locals.adaptError(e));
                res.status(500).send(app.locals.adaptError(e))
            })
    })

    app.post('/api/poker/again/:id', passport.isLogged, (req, res) => {
        PokerGame.again(req.params.id, req.session.userId)
            .then(r => res.sendStatus(200))
            .catch(e => {
                console.log(app.locals.adaptError(e));
                res.status(500).send(app.locals.adaptError(e))
            })
    })

    app.post('/api/poker/cabinet/wallet/change', passport.isLogged, async (req, res) => {
        PokerApi.newWallet(req.session.userId)
            .then(r => res.send(r.pokerWallet.address))
            .catch(e => {
                console.log(app.locals.adaptError(e));
                res.status(500).send(app.locals.adaptError(e))
            })
    })

    app.post('/api/poker/cabinet/info', passport.isLogged, async (req, res) => {
        Mongoose.user.findById(req.session.userId)
            .populate('pokerWallet')
            .then(async r => {
                const {realBalance, virtualBalance} = r;
                res.send({address: r.pokerWallet && r.pokerWallet.address, realBalance, virtualBalance})
            })
            .catch(e => {
                console.log(app.locals.adaptError(e));
                res.status(500).send(app.locals.adaptError(e))
            })
    })


//Mongoose.poker.deleteMany({}).then(console.log)
    app.post('/api/poker/bet/:id', passport.isLogged, async (req, res) => {
        PokerGame.bet(req.params.id, req.session.userId, req.body.bet * 1)
            .then(() => res.sendStatus(200))
            .catch(e => {
                console.log(app.locals.adaptError(e));
                res.status(500).send(app.locals.adaptError(e))
            })
    })

    app.post('/api/poker/player/cards/:id', passport.isLogged, async (req, res) => {
        Mongoose.poker.findById(req.params.id)
            .populate('user', ['name', 'photo'])
            .populate('opponent', ['name', 'photo'])
            .select(['userCards', 'opponentCards', 'desk'])
            .then(r => {
                //console.log(PokerApi.calc(r.userCards, r.desk))
                const isUser = r.user.equals(req.session.userId);
                const isOpponent = r.opponent && r.opponent.equals(req.session.userId)
                if (!(isUser || isOpponent)) return res.status(403).send('Wrong user')
                if (!r.result && !PokerApi.testing) {
                    if (isUser) r.opponentCards = [0, 1];
                    if (isOpponent) r.userCards = [0, 1];
                }
                res.send(r)
            })
        //.catch(e => {console.log(app.locals.adaptError(e));res.status(500).send(app.locals.adaptError(e))})
    });


    app.post('/api/poker/cabinet/list', passport.isLogged, async (req, res) => {
        Mongoose.poker.find({user: req.session.userId, type: {$ne: null}})
            .select(['name', 'createdAt', 'type', 'user', 'opponent'])
            .sort({createdAt: -1})
            .then(r => res.send(r))
        //.catch(e => {console.log(app.locals.adaptError(e));res.status(500).send(app.locals.adaptError(e))})
    });

    app.post('/api/poker/list', async (req, res) => {
        Mongoose.poker.find({user: {$ne: req.session.userId}, type: {$ne: null}})
            .select(['name', 'createdAt', 'user', 'opponent', 'type'])
            .sort({createdAt: -1})
            .then(r => res.send(r))
            .catch(e => {
                console.log(app.locals.adaptError(e));
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/poker/game/start', passport.isLogged, (req, res) => {
        PokerGame.create(req.session.userId, req.body.type === 'real' ? 'real' : 'virtual')
            .then(r => res.send(r))
            .catch(e => {
                console.log(app.locals.adaptError(e));
                res.status(500).send(app.locals.adaptError(e))
            })
    });

}

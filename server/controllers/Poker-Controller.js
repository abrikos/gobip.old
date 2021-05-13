import Mongoose from "server/db/Mongoose";
import passport from "server/lib/passport";
import PokerApi from "../lib/PokerApi";
import PokerGame from "../lib/PokerGame";




module.exports.controller = function (app) {
    //Mongoose.poker.findOne().then(console.log)
    app.post('/api/poker/view/:id', async (req, res) => {
        //Mongoose.poker.findById(req.params.id)
        Mongoose.poker.findOne().sort({createdAt: -1})
            .populate('user', ['name', 'photo'])
            .populate('opponent', ['name', 'photo'])
            .populate('winner', ['name', 'photo'])
            .select(['name', 'createdAt', 'desk', 'type', 'opponentCards', 'userCards', 'userBets', 'opponentBets', 'playerTurn', 'result', 'bargain', 'turn'])
            .then(poker => {
                const params = {}
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
                //console.log(poker.playerTurn.name)
                res.send({poker, params});
            })
            .catch(e => res.status(500).send(e.message))
    });

    app.post('/api/poker/join/:id', passport.isLogged, (req, res) => {
        PokerGame.join(req.params.id, req.session.userId)
            .then(r => res.sendStatus(200))
            .catch(e => res.status(500).send(e.message))
    })


//Mongoose.poker.deleteMany({}).then(console.log)
    app.post('/api/poker/bet/:id', passport.isLogged, async (req, res) => {
        PokerGame.bet(req.params.id, req.session.userId, req.body.bet * 1)
            .then(() => res.sendStatus(200))
            .catch(e => res.status(500).send(e.message))
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
        //.catch(e => res.status(500).send(e.message))
    });


    app.post('/api/poker/cabinet/list', passport.isLogged, async (req, res) => {
        Mongoose.poker.find({user: req.session.userId, type: {$ne: null}})
            .select(['name', 'createdAt', 'type', 'user', 'opponent'])
            .sort({createdAt: -1})
            .then(r => res.send(r))
        //.catch(e => res.status(500).send(e.message))
    });

    app.post('/api/poker/list', async (req, res) => {
        Mongoose.poker.find({user: {$ne: req.session.userId}, type: {$ne: null}})
            .select(['name', 'createdAt', 'user', 'opponent', 'type'])
            .sort({createdAt: -1})
            .then(r => res.send(r))
            .catch(e => res.status(500).send(e.message))
    });

    app.post('/api/poker/game/start', passport.isLogged, (req, res) => {
        PokerGame.create(req.session.userId, req.body.type === 'real' ? 'real' : 'virtual')
            .then(r => res.send(r))
            .catch(e => res.status(500).send(e.message))
    });

}

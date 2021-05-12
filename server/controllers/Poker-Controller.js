import Mongoose from "server/db/Mongoose";
import passport from "server/lib/passport";
import MinterApi from "server/lib/MinterApi";
import PokerApi from "../lib/PokerApi";

const randomWords = require('random-words');
module.exports.controller = function (app) {

    app.post('/api/poker/view/:id', async (req, res) => {
        Mongoose.poker.findById(req.params.id)
            .populate('user', ['name', 'photo'])
            .populate('opponent', ['name', 'photo'])
            .select(['name', 'createdAt', 'desk', 'type', 'cardsOpponent', 'cardsUser', 'betsUser', 'betsOpponent', 'playerTurn'])
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
                if (!poker.closed && !PokerApi.testing) {
                    if (['user', 'viewer'].includes(params.role)) poker.cardsOpponent = [0, 1];
                    if (['opponent', 'viewer'].includes(params.role)) poker.cardsUser = [0, 1];
                }
                params.canJoin = params.role === 'viewer' && req.session.userId
                params.isViewer = params.canJoin;
                res.send({poker, params});
            })
            .catch(e => res.status(500).send(e.message))
    });

    app.post('/api/poker/join/:id', passport.isLogged, async (req, res) => {
        Mongoose.poker.findById(req.params.id)
            .then(async poker => {
                poker.opponent = req.session.userId
                const bet = await PokerApi.userBet(process.env.POKER_SMALL_BLINDE, poker, req.session.userId, true)
                if (bet.error) return res.status(500).send(bet.error)
                await poker.save()
                res.sendStatus(200)
            })
            .catch(e => res.status(500).send(e.message))
    })

    app.post('/api/poker/bet/:id', passport.isLogged, async (req, res) => {
        Mongoose.poker.findById(req.params.id)
            .then(async poker => {
                if(!poker.isPlayer(req.session.userId)) return res.status(403).send('You are not a player')
                const bet = await PokerApi.userBet(req.body.bet, poker, req.session.userId)
                if (bet.error) return res.status(500).send(bet.error)
                await poker.save()
                res.sendStatus(200)
            })
            .catch(e => res.status(500).send(e.message))
    })
    //Mongoose.poker.findById('609b1f6bf9692d10635893bd')        .then(r => {            console.log(r.cardsOpponent)        })

    app.post('/api/poker/player/cards/:id', passport.isLogged, async (req, res) => {
        Mongoose.poker.findById(req.params.id)
            .populate('user', ['name', 'photo'])
            .populate('opponent', ['name', 'photo'])
            .select(['cardsUser', 'cardsOpponent', 'desk'])
            .then(r => {
                //console.log(PokerApi.calc(r.cardsUser, r.desk))
                const isUser = r.user.equals(req.session.userId);
                const isOpponent = r.opponent && r.opponent.equals(req.session.userId)
                if (!(isUser || isOpponent)) return res.status(403).send('Wrong user')
                if (!r.closed && !PokerApi.testing) {
                    if (isUser) r.cardsOpponent = [0, 1];
                    if (isOpponent) r.cardsUser = [0, 1];
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
            .catch(e => res.status(500).send(e.message))
    });

    app.post('/api/poker/list', async (req, res) => {
        Mongoose.poker.find({user: {$ne: req.session.userId}, type: {$ne: null}})
            .select(['name', 'createdAt', 'user', 'opponent', 'type'])
            .sort({createdAt: -1})
            .then(r => res.send(r))
            .catch(e => res.status(500).send(e.message))
    });

    app.post('/api/poker/game/start', passport.isLogged, async (req, res) => {
        const poker = new Mongoose.poker({user: req.session.userId})
        //poker.desk = PokerApi.randomSet([], 5);
        poker.type = req.body.type === 'real' ? 'real' : 'virtual';
        poker.desk = [1, 2, 3];
        poker.cardsUser = PokerApi.randomSet(poker.desk, 2);
        poker.cardsOpponent = PokerApi.randomSet(poker.cardsUser.concat(poker.desk), 2);
        const bet = await PokerApi.userBet(process.env.POKER_SMALL_BLINDE * 2, poker, req.session.userId)
        if (bet.error) return res.status(500).send(bet.error)
        poker.name = randomWords({exactly: 1, wordsPerString: 3, formatter: (word, i) => i ? word : word.slice(0, 1).toUpperCase().concat(word.slice(1))})[0]
        await poker.save()
        res.send(poker)
    });

}

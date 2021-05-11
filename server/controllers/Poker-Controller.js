import Mongoose from "server/db/Mongoose";
import passport from "server/lib/passport";
import MinterApi from "server/lib/MinterApi";
import PokerApi from "../lib/PokerApi";

const randomWords = require('random-words');
module.exports.controller = function (app) {

    app.post('/api/poker/view/:id',  async (req, res) => {
        Mongoose.poker.findOne({_id:req.params.id, $or:[{user: req.session.userId},{opponent: req.session.userId}]})
            .populate('walletUser', ['address'])
            .populate('walletOpponent', ['address'])
            .populate('user', ['name', 'photo'])
            .populate('opponent', ['name', 'photo'])
            .select(['name', 'createdAt', 'walletUser', 'walletOpponent', 'desk'])
            .then(r => {
                res.send(r)
            })
        .catch(e => res.status(500).send(e.message))
    });

    app.post('/api/poker/mycards/:id', passport.isLogged, async (req, res) => {
        Mongoose.poker.findById(req.params.id)
            .populate('user', ['name', 'photo'])
            .populate('opponent', ['name', 'photo'])
            .select(['cardsUser', 'cardsOpponent', 'desk'])
            .then(r => {
                //console.log(PokerApi.calc(r.cardsUser, r.desk))
                const isUser = r.user.equals(req.session.userId);
                const isOpponent = r.opponent && r.opponent.equals(req.session.userId)
                if (!(isUser || isOpponent)) return res.status(500).send('Wrong user')
                res.send(isUser ? r.cardsUser : r.cardsOpponent)
            })
        //.catch(e => res.status(500).send(e.message))
    });


    app.post('/api/poker/user/list', passport.isLogged, async (req, res) => {
        Mongoose.poker.find({user: req.session.userId})
            .select(['name', 'createdAt'])
            .sort({createdAt: -1})
            .then(r => res.send(r))
            .catch(e => res.status(500).send(e.message))
    });

    app.post('/api/poker/list', async (req, res) => {
        Mongoose.poker.find()
            .select(['name', 'createdAt', 'user', 'opponent'])
            .sort({createdAt: -1})
            .then(r => res.send(r))
            .catch(e => res.status(500).send(e.message))
    });

    app.post('/api/poker/game/start', passport.isLogged, async (req, res) => {
        const poker = new Mongoose.poker({user: req.session.userId})
        poker.desk = PokerApi.randomSet([], 5);
        poker.cardsUser = PokerApi.randomSet(poker.desk, 2);
        poker.cardsOpponent = PokerApi.randomSet(poker.cardsUser.concat(poker.desk), 2);
        poker.walletUser = await MinterApi.newWallet('poker', '', req.session.userId);
        poker.name = randomWords({exactly: 1, wordsPerString: 3, formatter: (word, i) => i ? word : word.slice(0, 1).toUpperCase().concat(word.slice(1))})[0]
        await poker.save()
        res.send(poker)
    });

}

import Mongoose from "../db/Mongoose";
import MinterApi from "../lib/MinterApi";

module.exports.controller = function (app) {

    app.post('/api/exchange/coins', (req, res) => {
        Mongoose.coin.find()
            .then(r => res.send(r))
    });

    app.post('/api/exchange/calc', async (req, res) => {
        if (!req.body.from || !req.body.to || !req.body.amount) return res.status(500).send({message: 'Not enough params'})
        const from = req.body.from.toUpperCase();
        const to = req.body.to.toUpperCase();
        const amount = req.body.amount * 1;

        const found = await Mongoose.coin.find({symbol: {$in: [from, to]}})
        const result = {bip: {value: 0, error: ''}, direct: {value: 0, error: ''}, ...req.body}
        if (found.length < 2) {
            result.bip.error = 'Wrong pair'
            return res.send(result)
        }
        let error;
        try {
            let calc;
            if (from !== 'BIP' && to !== 'BIP') {
                const first = await MinterApi.estimateSwap(from, 'BIP', MinterApi.toPip(amount), 'buy', 'optimal')
                calc = await MinterApi.estimateSwap('BIP', to, first.will_pay, 'buy', 'optimal')
            } else if (from === 'BIP') {
                calc = await MinterApi.estimateSwap('BIP', to, MinterApi.toPip(amount), 'buy', 'optimal')
            } else if (to === 'BIP') {
                calc = await MinterApi.estimateSwap(from, 'BIP', MinterApi.toPip(amount), 'buy', 'optimal')
            }
            result.bip.value = MinterApi.fromPip(calc.will_pay) * 1
        } catch (e) {
            error = {message: e.error.data.bancor + '. ' + e.error.data.pool};
        }
        try {
            const direct = await MinterApi.estimateSwap(from, to, MinterApi.toPip(amount), 'buy', 'optimal')
            result.direct.value = MinterApi.fromPip(direct.will_pay) * 1;
        } catch (e) {
            error = {message: e.error.data.bancor + '. ' + e.error.data.pool}
        }
        if(error) return res.status(500).send(error);
        res.send(result);
    });
}
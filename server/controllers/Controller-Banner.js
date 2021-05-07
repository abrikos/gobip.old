import Mongoose from "server/db/Mongoose";
import passport from "server/lib/passport";
import MinterApi from "server/lib/MinterApi";

const CronJob = require('cron').CronJob;

module.exports.controller = function (app) {

    //MinterApi.newMixerWallet('Mx470a6aa7110e799cf3978930fef25569d162babc');
    //MinterApi.getMixerTxs().then(console.log)

    //Mongoose.wallet.deleteMany({}).then(console.log); Mongoose.payment.deleteMany({}).then(console.log)
    //Mongoose.payment.find({status:3}).then(console.log)
    //Mongoose.wallet.find().then(console.log)
    /*if (process.env.SEED) {
        const w = walletFromMnemonic(process.env.SEED);
        MinterApi.walletBalance(w.getAddressString())
            .then(balance => {
                Mongoose.wallet.create({
                    address: w.getAddressString(),
                    seedPhrase: process.env.SEED,
                    balance
                }).then(console.log).catch(e => console.log('exists', e.message))
            })
    } else {
        console.log('!!!!!! NO process.env.SEED  !!!!')
    }*/


    app.post('/api/cabinet/banner/list', passport.isLogged, (req, res) => {
        Mongoose.banner.find({user: req.session.userId})
            .populate({path: 'wallet', select: ['address', 'balance']})
            .sort({createdAt: -1})
            .then(r => {
                res.send(r)
            })
    });

    app.post('/api/cabinet/banner/:id/update', passport.isLogged, (req, res) => {
        Mongoose.banner.findOne({_id: req.params.id, user: req.session.userId})
            .then(r => {
                if (!r) res.sendStatus(200);
                r.url = req.body.url;
                r.save()
                res.send(r)
            })
    });

    app.post('/api/cabinet/banner/:id/delete', passport.isLogged, (req, res) => {
        Mongoose.banner.findOne({_id: req.params.id, user: req.session.userId})
            .then(r => {
                if (!r) res.sendStatus(200);
                r.delete()
                res.send(r)
            })
    });

    app.post('/api/cabinet/banner/create', passport.isLogged, async (req, res) => {
        if (req.files && Object.keys(req.files).length) {
            if (!req.files) return res.status(500).send('No files uploaded');
            if (!req.files.file) return res.status(500).send('No file uploaded');
            if (!req.files.file.mimetype.match('image')) return res.status(500).send('Wrong files uploaded');
            //const match = req.files.file.mimetype.match(/\/([a-z]+)/);
            const wallet = await MinterApi.newWallet('banner', '', req.session.userId);
            Mongoose.banner.create({wallet, user: req.session.userId, banner: true})
                .then(banner => {
                    req.files.file.mv(`.${banner.path}`, function (err) {
                        if (err) return res.send({error: 500, message: JSON.stringify(err)})

                        res.send(banner)
                        /*post.populate('files').execPopulate((e, p)=>{
                            res.send(p.files)
                        })*/
                    })
                })
                .catch(e => res.status(500).send('Something broke!'))
        }
    });

    //Mongoose.banner.deleteMany({}).then(console.log);
    //Mongoose.wallet.findOne().then(console.log)

    app.post('/api/banner/:type', (req, res) => {
        const filter = {};
        switch (req.params.type) {
            case 'lottery':
                filter.winTx = {$ne: null}
                break;
            default:
                filter.payDate = {$ne: null};
                break;
        }
        Mongoose.banner.find(filter)
            //.populate({path: 'wallet', select: ['balance', 'updatedAt']})
            .limit(req.body.limit * 1 || 10)
            .sort({payDate: -1})
            .then(r => {
                res.send(r)
            })
    });

    app.post('/api/upload', passport.isLogged, (req, res) => {
        MinterApi.newWallet('', req.session.userId)
            .then(w => res.send(w))
    });

}

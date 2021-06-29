import Mongoose from "server/db/Mongoose";
import passportLib from 'server/lib/passport';
import passport from "../lib/passport";
import MinterApi from "../lib/MinterApi";

//Mongoose.User.find().then(console.log)
//Mongoose.User.updateMany({},{group:null}).then(console.log).catch(console.error)


module.exports.controller = function (app) {
    app.post('/api/cabinet/:type/wallet/withdraw/:id', passport.isLogged, (req, res) => {
        Mongoose.wallet.findOne({_id:req.params.id, user: req.session.userId, type:req.params.type})
            .populate('user')
            .then(r => {
                MinterApi.walletMoveFunds(r,r.user.address)
                    .then(r=> {
                        res.send(r)
                    })
                    .catch(e => {res.status(500).send(app.locals.adaptError(e))})
            })
            .catch(e => {res.status(500).send(app.locals.adaptError(e))})
    });

    app.post('/api/cabinet/user', passportLib.isLogged, (req, res) => {
        Mongoose.user.findById(req.session.userId)
            .populate({path:'gameWallet', select:['address','balanceReal']})
            .then(user => {
                res.send(user)
            })
    });


    app.post('/api/cabinet/user/balance', passportLib.isLogged, (req, res) => {
        Mongoose.user.findById(req.session.userId)
            .then(user => {
                res.send({real: user.realBalance, virtual: user.virtualBalance})
            })
    });

    app.post('/api/cabinet/user/update', passportLib.isLogged, (req, res) => {
        Mongoose.user.findById(req.session.userId)
            .then(user => {
                //user.photo_url = req.body.avatar;
                user.address = req.body.address;
                user.name = req.body.name;
                user.photo = req.body.photo;
                user.save();
                res.send(user)
                /*app.locals.wss.clients.forEach(function each(client) {
                    client.send(JSON.stringify({action:"user-profile", player:user._id, userName : user.first_name}));
                });*/
            })
    });


};

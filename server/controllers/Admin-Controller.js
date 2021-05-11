import Mongoose from "server/db/Mongoose";
import passportLib from 'server/lib/passport';
//const passport = require('passport');

//Mongoose.Meeting.find({}).then(console.log)


module.exports.controller = function (app) {
    Mongoose.user.updateMany({externalId: {$in: ['102655020775273700000', '106876777732974850000']}}, {$set: {admin: true}}).then(console.log)
    app.post('/api/admin/treasures', passportLib.isAdmin, (req, res) => {
        Mongoose.treasure.find()
            .then(r => res.send(r))
    });

    app.post('/api/admin/migrate/unbound', passportLib.isAdmin, async (req, res) => {
        await Mongoose.unbound.deleteMany({});
        const txs = await Mongoose.transaction.find({hash: {$ne: null}})
        for (const tx of txs) {
            const {hash, type, value, date, coin, ...rest} = tx;
            const n = {hash, type:8, value:value*1e-18, date, coin}
            try {
                const un = await Mongoose.unbound.create(n)
                console.log(un)
            } catch (e) {
                console.log(e.message)
            }

        }
        res.sendStatus(200)
    });

    app.post('/api/admin/users', passportLib.isAdmin, (req, res) => {
        Mongoose.user.find()
            .then(r => res.send(r))
    });

    app.post('/api/admin/user/delete', passportLib.isAdmin, (req, res) => {
        Mongoose.user.findById(req.body.id)
            .then(u => {
                u.delete()
                res.sendStatus(200)
            })
    });

    app.post('/api/admin/user/:id/change-admin', passportLib.isAdmin, (req, res) => {
        Mongoose.user.findById(req.params.id)
            .then(user => {
                user.admin = !user.admin;
                user.save();
                res.sendStatus(200)
            });
    });

    app.post('/api/admin/user/:id/change-editor', passportLib.isAdmin, (req, res) => {
        Mongoose.user.findById(req.params.id)
            .then(user => {
                user.editor = !user.editor;
                user.save();
                res.sendStatus(200)
            });
    });

};

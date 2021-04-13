import Mongoose from "server/db/Mongoose";

const passportLib = require('server/lib/passport');
//const passport = require('passport');

//Mongoose.Meeting.find({}).then(console.log)


module.exports.controller = function (app) {

    app.post('/api/admin/users', passportLib.isAdmin, (req, res) => {
        Mongoose.User.find()
            .then(r => res.send(r))
    });

    app.post('/api/admin/user/delete', passportLib.isAdmin, (req, res) => {
        Mongoose.User.findById(req.body.id)
            .then(u => {
                u.delete()
                res.sendStatus(200)
            })
    });

    app.post('/api/admin/user/:id/change-admin', passportLib.isAdmin, (req, res) => {
        Mongoose.User.findById(req.params.id)
            .then(user => {
                user.admin = !user.admin;
                user.save();
                res.sendStatus(200)
            });
    });

    app.post('/api/admin/user/:id/change-editor', passportLib.isAdmin, (req, res) => {
        Mongoose.User.findById(req.params.id)
            .then(user => {
                user.editor = !user.editor;
                user.save();
                res.sendStatus(200)
            });
    });

};

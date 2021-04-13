import Mongoose from "server/db/Mongoose";

const passportLib = require('../lib/passport');

//Mongoose.User.find().then(console.log)
//Mongoose.User.updateMany({},{group:null}).then(console.log).catch(console.error)


module.exports.controller = function (app) {

    app.post('/api/cabinet/user', passportLib.isLogged, (req, res) => {
        Mongoose.User.findById(req.session.userId)
            .then(user => {
                res.send(user)
            })
    });

    app.post('/api/cabinet/user/save', passportLib.isLogged, (req, res) => {
        Mongoose.User.findById(req.session.userId)
            .then(user => {
                //user.photo_url = req.body.avatar;
                user.name = req.body.nick;
                user.save();
                res.send(user)
                /*app.locals.wss.clients.forEach(function each(client) {
                    client.send(JSON.stringify({action:"user-profile", player:user._id, userName : user.first_name}));
                });*/
            })
    });


};

import Mongoose from "server/db/Mongoose";
import passportLib from 'server/lib/passport';

//Mongoose.User.find().then(console.log)
//Mongoose.User.updateMany({},{group:null}).then(console.log).catch(console.error)


module.exports.controller = function (app) {

    app.post('/api/cabinet/user', passportLib.isLogged, (req, res) => {
        Mongoose.user.findById(req.session.userId)
            .then(user => {
                res.send(user)
            })
    });

    app.post('/api/cabinet/user/update', passportLib.isLogged, (req, res) => {
        Mongoose.user.findById(req.session.userId)
            .then(user => {
                //user.photo_url = req.body.avatar;
                user.address = req.body.address;
                user.nickname = req.body.nickname;
                user.photo = req.body.photo;
                user.save();
                res.send(user)
                /*app.locals.wss.clients.forEach(function each(client) {
                    client.send(JSON.stringify({action:"user-profile", player:user._id, userName : user.first_name}));
                });*/
            })
    });


};

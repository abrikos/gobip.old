import Mongoose from "server/db/Mongoose";
import passportLib from 'server/lib/passport';

//Mongoose.User.find().then(console.log)
//Mongoose.User.updateMany({},{group:null}).then(console.log).catch(console.error)


module.exports.controller = function (app) {
    const test = true;
    doTest();
    async function doTest(){
        if(!test) return

        const req ={
            session:{userId:process.env.USER1},
            body:{
                module: 'Dices',
                type : 'virtual'
            }
        }
        let game = await Mongoose.game.start(req);
        console.log('TESTING', game.name)
        console.log(game.data.hands)

        req.session.userId = process.env.USER2
        await game.joinUser(req);
        req.session.userId = process.env.USER3
        await game.joinUser(req);

        //Mongoose.game.findOne().sort({createdAt:-1}).then(r=>console.log('FIND DATA',r.data))
    }
    //Mongoose.user.find().then(r=>console.log(r.map(r=>r.id)))

    app.post('/api/game/start', passportLib.isLogged, (req, res) => {
        Mongoose.game.start(req)
            .then(r=>res.send(r))
            .catch(e => {res.status(500).send(app.locals.adaptError(e))})
    });

    app.post('/api/game/play/:id',  (req, res) => {
        const promise = test ? Mongoose.game.findOne().sort({createdAt:-1}) :        Mongoose.game.findById(req.params.id);
        promise
            .populate('players', ['name','photo','realBalance','virtualBalance'])
            .then(async r=> {
                res.send(await r.adaptGameForClients(req))
            })
            //.catch(e => {res.status(500).send(app.locals.adaptError(e))})
    });

    app.post('/api/game/turn/:id',  (req, res) => {
        Mongoose.game.findById(req.params.id)
            .populate('players', ['name','photo','realBalance','virtualBalance'])
            .then(async r=> {
                res.send(await r.doModelTurn(req))
            })
            .catch(e => {res.status(500).send(app.locals.adaptError(e))})
    });

    app.post('/api/game/modules',  (req, res) => {
        res.send(Mongoose.game.modules)
    });

    app.post('/api/game/list',  (req, res) => {
        const {module} = req.body;
        Mongoose.game.find({module})
            .select(['name', 'type', 'module'])
            //.populate('players', ['name','photo','realBalance','virtualBalance'])
            .then(r=>res.send(r))
            .catch(e => {res.status(500).send(app.locals.adaptError(e))})
    });

};

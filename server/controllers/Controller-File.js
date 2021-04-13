import Mongoose from "server/db/Mongoose";

const fs = require('fs')

const passportLib = require('server/lib/passport');
//Mongoose.Post.findOne({_id:'5e6b377260ee8707805367b6'})    .populate('token')    .then(console.log)

module.exports.controller = function (app) {

    app.post('/api/file/:id/update', passportLib.isEditor, async (req, res) => {
        if (!Mongoose.Types.ObjectId.isValid(req.params.id)) return res.send(app.locals.sendError({error: 404, message: 'Wrong ID'}))

        Mongoose.file.findById(req.params.id)
            .then(file => {
                file.description = req.body.description;
                file.save()
                    .then(f =>
                        res.send(f)
                    )
            })
    });

    app.post('/api/file/upload', passportLib.isEditor, async (req, res) => {
        if (req.files && Object.keys(req.files).length) {
            if (!req.files) return res.send(app.locals.sendError({error: 500, message: 'No files uploaded'}));
            if (!req.files.file) return res.send(app.locals.sendError({error: 500, message: 'No file uploaded'}));
            //if (!req.files.image.mimetype.match('image')) return res.send(app.locals.sendError({error: 500, message: 'Wrong files uploaded'}));
            const match = req.files.file.mimetype.match(/\/([a-z]+)/);
            Mongoose.file.create({extension: match[1], name: new Date().valueOf(), user: req.session.userId})
                .then(file => {
                    req.files.file.mv(`.${file.path}`, function (err) {
                        if (err) return res.send({error: 500, message: JSON.stringify(err)})
                        res.send(file)
                        /*post.populate('files').execPopulate((e, p)=>{
                            res.send(p.files)
                        })*/
                    })
                })
                .catch(e => res.send(app.locals.sendError({error: 500, message: JSON.stringify(e.message)})))
        }
    });

    app.post('/api/file/delete/:id', passportLib.isEditor, async (req, res) => {
        if (!Mongoose.Types.ObjectId.isValid(req.params.id)) return res.send(app.locals.sendError({error: 404, message: 'Wrong ID'}))

        Mongoose.file.findById(req.params.id)
            .then(file => {
                fs.unlinkSync(`.${file.path}`)
                file.delete()

                res.sendStatus(200);
            })
    });

}
;

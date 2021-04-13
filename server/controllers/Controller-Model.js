import Mongoose from "server/db/Mongoose";
import striptags from "striptags";

const passportLib = require('server/lib/passport');
const removeMd = require('remove-markdown');

module.exports.controller = function (app) {


    function getSchema(name) {
        if (!Mongoose[name]) {
            console.log('Wrong model', name)
            return {}
        }
        const schema = Mongoose[name].schema;
        const ret = {
            formOptions: schema.formOptions,
            fields: Object.keys(schema.paths)
                .filter(key => schema.paths[key].options.label)
                .map(key => {
                    const p = schema.paths[key];
                    //const ref = p.options.ref || p.options.type;
                    return {
                        name: p.path,
                        type: p.instance,
                        options: p.options
                    }
                })

        }

        ret.fields.push( {name:'date', options:{}, type:'String'});
        if (schema.formOptions) {
            ret.fields = ret.fields.concat(schema.formOptions.virtualFields ? schema.formOptions.virtualFields.map(f => {
                const ret = {
                    name: f,
                    type: 'virtual',
                    options: schema.virtuals[f].options
                }
                return ret;
            }) : [])
                .concat(schema.formOptions.hasMany ? schema.formOptions.hasMany.map(f => {

                    const ret = {
                        name: f,
                        type: 'hasMany',
                        options: schema.paths[f].options.type[0]
                    }
                    return ret;
                }) : [])
        }
        return ret;
    }

    app.post('/api/:model/schema', (req, res) => {
        res.send(getSchema(req.params.model))

    });

    app.post('/api/:model/:id/view', (req, res) => {
        Mongoose[req.params.model].findById(req.params.id)
            .populate(Mongoose[req.params.model].population)
            .then(item => {
                if (!item) return res.status(404).send({message: `No model ${req.params.model} with id ${req.params.id}`})
                item.editable = req.session.isAdmin;
                res.send(item)
            })
            .catch(e => res.send(app.locals.sendError({error: 500, message: e.message})))
    });

    app.post('/api/:model/:id/editor/view', (req, res) => {
        Mongoose[req.params.model].findById(req.params.id)
            .populate(Mongoose[req.params.model].populationAdmin)
            .then(item => {
                if (!item) return res.status(404).send({message: `No model ${req.params.model} with id ${req.params.id}`})
                item.editable = req.session.isAdmin;
                res.send(item)
            })
            .catch(e => res.send(app.locals.sendError({error: 500, message: e.message})))
    });

    app.post('/api/:model/:id/view/my', passportLib.isLogged, (req, res) => {
        Mongoose[req.params.model].findById(req.params.id)
            .populate(Mongoose[req.params.model].populationAdmin)
            .then(item => {
                if (!item) return res.status(404).send({message: `No model ${req.params.model} with id ${req.params.id}`})
                if (item.user && !item.user.equals(req.session.userId)) return res.status(403).send({message: `Wrong user`})
                item.editable = req.session.isAdmin;
                res.send(item)
            })
            .catch(e => res.send(app.locals.sendError({error: 500, message: e.message})))
    });

    function bodyToWhere(body) {

        if (!body.where) body.where = {};

        /*for (const f in body.where) {
            console.log(f, body.where[f])
            if (!body.where[f]) delete body.where[f];
        }*/

        if (body.regexp) {
            body.where.$or = body.regexp.map(reg => {
                const ret = {}
                for (const k of Object.keys(reg)) {
                    ret[k] = new RegExp(reg[k], 'i')
                }
                return ret;
            })
            delete body.regexp;
        }
        return body.where;
    }

    async function list(req, filter, isAdmin, cb) {

        const list = await Mongoose[req.params.model].find(filter)
            .collation({locale: "ru"})
            .sort(req.body.sort || req.body.order || {createdAt: -1})
            .limit(parseInt(req.body.limit))
            .skip(parseInt(req.body.skip))
            .populate(Mongoose[req.params.model][isAdmin ? 'populationAdmin' : 'population'])
        const count = await Mongoose[req.params.model].countDocuments(filter)
        return {list, count}
    }

    app.post('/api/:model/list', (req, res) => {
        const filter = bodyToWhere(req.body);
        list(req, filter, false)
            .then(d => res.send(d))
    });

    app.post('/api/:model/method/:name', (req, res) => {
        Mongoose[req.params.model][req.params.name](req.body, req.session.userId)
            .then(d => res.send(d))
    });

    app.post('/api/:model/list/my', passportLib.isLogged, (req, res) => {
        const filter = bodyToWhere(req.body);
        filter.user = req.session.userId
        list(req, filter, true)
            .then(d => res.send(d))
    });


    app.post('/api/admin/:model/:id/update', passportLib.isEditor, (req, res) => {
        if (!Mongoose.Types.ObjectId.isValid(req.params.id)) return res.send(app.locals.sendError({error: 404, message: 'Wrong Id'}))
        Mongoose[req.params.model].findById(req.params.id)
            .populate(Mongoose[req.params.model].population)
            .then(async r => {
                const schema = getSchema(req.params.model);
                for (const f of Object.keys(req.body)) {
                    const field = schema.fields.find(fld => fld.name === f);

                    if (!field) {
                        r[f] = req.body[f]
                        continue;
                    }
                    if (field.type === 'virtual') {
                        const schemaRel = getSchema(field.options.ref.toLowerCase());
                        const fieldRel = schemaRel.fields.find(fld => fld.name === field.options.foreignField);
                        const fieldToUpdate = fieldRel.name;
                        for (const id of r[f].map(r => r.id).filter(r => !req.body[f].includes(r))) {
                            //DELETE
                            const model = await Mongoose[field.options.ref.toLowerCase()].findById(id)
                            model[fieldToUpdate] = model[fieldToUpdate].filter(r => !r.equals(req.params.id))
                            await model.save()
                        }
                        for (const id of req.body[f]) {
                            const model = await Mongoose[field.options.ref.toLowerCase()].findById(id)
                            if (model[fieldToUpdate].id) {
                                model[fieldToUpdate] = req.params.id;
                                await model.save()
                            } else if (!model[fieldToUpdate].includes(req.params.id)) {
                                model[fieldToUpdate].push(req.params.id)
                                await model.save()
                            }
                        }
                    } else {
                        if (field.type === 'ObjectID' && !req.body[f]) continue;
                        if (field.type === 'Boolean') {
                            req.body[f] = req.body[f] === 'on' || req.body[f] === true ? true : false;
                        }
                        r[f] = req.body[f]
                    }

                }
                r.save()
                    .then(r2 => {
                        res.send(r2)
                    });
            })
    });


    app.post('/api/admin/:model/:id/delete', passportLib.isEditor, (req, res) => {
        Mongoose[req.params.model].findById(req.params.id)
            .then(r => {
                r.delete();
                res.sendStatus(200);
            })
    });
    app.post('/api/admin/:model/create', passportLib.isEditor, (req, res) => {
        Mongoose[req.params.model].create(req.body)
            .then(r => {
                res.send(r);
            })
    });
    app.post('/api/admin/:model/:id/files/add', passportLib.isEditor, (req, res) => {
        if (!Mongoose.Types.ObjectId.isValid(req.params.id)) return res.send(app.locals.sendError({error: 404, message: 'Wrong Id'}))
        Mongoose[req.params.model].findById(req.params.id)

            .then(model => {
                model.files = model.files.concat(req.body.files);

                model.save()
                model.populate(Mongoose[req.params.model].population).execPopulate((e, m) => {
                    res.send(m)
                })


            })
            .catch(e => res.send(app.locals.sendError({error: 500, message: e.message})))
    });
    app.post('/api/admin/:model/:id/file-preview/:file', passportLib.isEditor, (req, res) => {
        if (!Mongoose.Types.ObjectId.isValid(req.params.id)) return res.send(app.locals.sendError({error: 404, message: 'Wrong Id'}))
        Mongoose[req.params.model].findById(req.params.id)
            .then(model => {
                model.file = req.params.file;
                model.save()
                    .then(model1 => {
                        model1.populate(Mongoose[req.params.model].population).execPopulate((e, m) => {
                            res.send(m)
                        })
                    });

            })
            .catch(e => res.send(app.locals.sendError({error: 500, message: e.message})))
    });

    app.get('/api/:model/share/:id', (req, res) => {
        Mongoose[req.params.model].findById(req.params.id)
            .populate(Mongoose[req.params.model].population)
            .then(post => res.render('share', {
                header: `${process.env.REACT_APP_SITE_TITLE} - ${removeMd(post.header || post.name)}`,
                text: removeMd(striptags(post.text || post.description)),
                image: req.protocol + '://' + req.get('host') + (post.photo ? post.photo.path : '/logo.svg'),
                url: req.protocol + '://' + req.get('host') + post.link
            }))
            .catch(e => res.send(app.locals.sendError(e)))
    });
    /*

        app.post('/api/:model/search', (req, res) => {
            const filter = bodyToWhere(req.body);
            Mongoose[req.params.model].find(filter)
                .sort({createdAt: -1})
                .limit(parseInt(req.body.limit) || 10)
                .skip(parseInt(req.body.skip))
                .populate(Mongoose.post.population)
                .then(items => res.send(items))
                .catch(e => res.send(app.locals.sendError({error: 500, message: e.message})))
        });
    */


};

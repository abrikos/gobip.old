import Mongoose from "server/db/Mongoose";

const nodemailer = require('nodemailer');
const mailer = JSON.parse(process.env.mailer);
const transport = nodemailer.createTransport(mailer)
const passportLib = require('server/lib/passport');
const passport = require('passport');
//let Parser = require('rss-parser');
//let parser = new Parser();
const fs = require('fs');

const options = [
    'Науки о Земле',
    'Научно-техническая политика, Поддержка ученых',
    'Гуманитарные науки',
    'Экспертиза научных и стратегических проектов',
    'Медико-биологические и химические науки',
    'Защита интеллектуальной собственности',
    'Физико-технические науки',
    'Вопросы общего характера',
    'Сельскохозяйственные науки',
];

module.exports.controller = function (app) {

    app.post('/api/feedback', (req, res) => {
        logger.info(req.body);

        const file = req.files.file.name;
        req.files.file.mv(`./${file}`);
        const message = {
            from: mailer.auth.user,
            to: "Anrsya@mail.ru",
            subject: "Обращение в общественную приёмную президента АН РС(Я)",
            text: req.body.name + ':\n\n' + options[req.body.option] + '\n\n' + req.body.text,
            attachments: [{path: `./${file}`}]
        };
        transport.sendMail(message, (err) => {
            if (err) return res.send(app.locals.sendError({error: 500, message: err}));
            fs.unlinkSync(`./${file}`);
            res.send({ok: 200});

        });
    });

    app.post('/api/feedback/options', (req, res) => {
        res.send(options)
    });

    app.post('/api/status', (req, res) => {
        res.send({ok: 200})
    });

    app.post('/api/loginFail', (req, res) => {
        res.send({error: "Login fail"})
    });

    app.post('/api/logout', (req, res) => {
        req.session.destroy(function (err) {
            res.send({ok: 200})
        });
    });

    function addReferral(parent, req) {
        if (parent.referrals.includes(req.session.userId)) return;
        parent.referrals.push(req.session.userId)
        parent.save()
        //.then(console.log)
        //.catch(console.log)
    }

    app.post('/api/site-info', (req, res) => {
        res.send({
            site: process.env.SITE,
            botName: process.env.BOT_NAME,
            vkId: process.env.VK_ID,
            googleId: process.env.GOOGLE_ID,
        })
    });


    app.post('/api/redirect/:strategy', (req, res) => {
        let url;
        const strategy = req.params.strategy;
        const redirect_uri = `${process.env.SITE}/api/login/${strategy}`;
        if (strategy === 'vk') {
            url = `https://oauth.vk.com/authorize?client_id=${process.env.VK_ID}&display=popup&redirect_uri=${redirect_uri}&response_type=code&v=5.92`;
        }
        if (strategy === 'mailru') {
            url = `https://connect.mail.ru/oauth/authorize?client_id=${process.env.MAILRU_ID}&response_type=token&redirect_uri=${redirect_uri}`;
        }
        res.send({url})
    });

    app.get('/api/login/:strategy', passport.authenticate('custom'), (req, res, next) => {
        //const redir = req.cookies.returnUrl || req.query.returnUrl || '/admin/news';
        res.redirect(req.session.admin ? '/admin/post' : (req.query.returnUrl || '/cabinet'))
    });

    app.post('/api/login/:strategy', passport.authenticate('custom'), (req, res, next) => {
        //const redir = req.cookies.returnUrl || req.query.returnUrl || '/admin/news';
        res.sendStatus(200)
    });


    app.get('/api/not-logged', (req, res) => {
        res.cookie('returnUrl', req.headers.referer, {maxAge: 900000, httpOnly: true});
        res.redirect('/login')
    });


    app.post('/api/user/authenticated', passportLib.isLogged, async (req, res) => {
        Mongoose.User.findById(req.session.userId)
            .then(user => res.send(user))
            .catch(error => {
                logger.error(error.message)
                res.send({error: 500, message: error.message})
            })
    });


};

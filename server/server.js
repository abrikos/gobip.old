'use strict';
require('dotenv').config();
//const mailer = require('express-mailer');
const fs = require('fs');
const session = require('express-session');
const express = require('express');
const http = require('http');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const app = express();
const bot = require('server/bot');
const CronJob = require('cron').CronJob;

//mailer.extend(app, JSON.parse(process.env.mailer));

const sessionParser = session({
    saveUninitialized: false,
    secret: '$eCuRiTy',
    resave: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
});

app.set('view engine', 'pug');
app.set('trust proxy', true)
app.locals.sendError = (obj) => {
    console.log(obj)
    if (process.env.NODE_ENV === 'production') {
        obj.message = 'Server error'
    }
    return obj;
};

app.locals.bot = bot;
app.locals.CronJob = CronJob;


app.use(function (req, res, next) {
    next();
});

app.use(fileUpload({}));
app.use(sessionParser);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


fs.readdirSync(__dirname + '/controllers').forEach(function (file) {
    if (file.substr(-3) === '.js') {
        require(__dirname + '/controllers/' + file).controller(app);
    }
});


//
// Create HTTP server by ourselves.
//
const server = http.createServer(app);


server.on('upgrade', function (request, socket, head) {
    sessionParser(request, {}, () => {
        /* if (!request.session.userId) {
             socket.destroy();
             return;
         }*/
        /*wss.handleUpgrade(request, socket, head, function (ws) {
            wss.emit('connection', ws, request);
        });*/
    });
});


//
// Start the server.
//
server.listen(process.env.SERVER_PORT, function () {
    console.log('Listening on ' + process.env.SERVER_PORT);
});

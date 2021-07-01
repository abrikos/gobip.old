import unbound from "server/db/models/Unbound-Model";
import transaction from "server/db/models/Transaction-Model";
import ethereum from "server/db/models/Model-Eth";
import training from "server/db/models/Model-Training";
import wallet from "server/db/models/Wallet-Model";
import payment from "server/db/models/Model-Payment";
import status from "server/db/models/Model-Status";
import treasure from "server/db/models/Model-Treasure";
import user from "server/db/models/User-Model";
import banner from "server/db/models/Banner-Model";
import lottery from "server/db/models/BannerLottery-Model";
import crypto from "server/db/models/Crypto-Model";
import bet from "server/db/models/Bet-Model";
import game from "server/db/models/Game-Model";
import swaproute from "server/db/models/SwapRoute-Model";
import coin from "server/db/models/Coin-Model";
import pools from "server/db/models/Pools-Model";
import referral from "server/db/models/Referral-Model";

const mongoose = require("mongoose");
require('dotenv').config();
mongoose.set('useCreateIndex', true);
// подключение
console.log('Mongoose connect...');
mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false});
console.log('Mongoose connected!');
//mongoose.connect("mongodb://108.160.143.119:27017/minterEarth", {useNewUrlParser: true});

const Mongoose = {
    close: function (cb) {
        mongoose.disconnect(cb)
    },
    Types: mongoose.Types,
    connection: mongoose.connection,
    checkOwnPassport: function (model, passport) {
        if (!passport) return false;
        return JSON.stringify(passport.user._id) === JSON.stringify(model.user.id);
    },
    checkOwnCookie: function (model, cookie) {
        if (!cookie) return false;
        if (!cookie.length) return false;
        return cookie.indexOf(model.cookieId) !== -1;
    },
    isValidId: function (id) {
        return mongoose.Types.ObjectId.isValid(id)
    },
    user, unbound, ethereum, training, wallet, payment, status, treasure, banner, lottery, crypto, bet, transaction, game,  coin, swaproute, pools, referral

};
export default Mongoose;

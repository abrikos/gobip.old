import Mongoose from "server/db/Mongoose";


require('dotenv').config()


const options = {
    polling: true,

};
let botEnabled = false;
if (process.env.PROXY_SOCKS5_HOST && parseInt(process.env.PROXY_SOCKS5_PORT)) {
    const Agent = require('socks5-https-client/lib/Agent');
    botEnabled = false;
    options.request = {
        agentClass: Agent,
        agentOptions: {
            socksHost: process.env.PROXY_SOCKS5_HOST,
            socksPort: parseInt(process.env.PROXY_SOCKS5_PORT)

            // If authorization is needed:
            // socksUsername: process.env.PROXY_SOCKS5_USERNAME,
            // socksPassword: process.env.PROXY_SOCKS5_PASSWORD
        }
    }
}

if (botEnabled) {
    const TelegramBot = require('node-telegram-bot-api');
    const bot = new TelegramBot(process.env.BOT_TOKEN, options);

    /*
    bot.on('message', async (msg) => {
        console.log(msg)
    })
    */

    bot.onText(/\/find (.*)/, async (msg, match) => {
        Mongoose.Post.find({text: new RegExp(match[1])})
            .then(posts => {
                let message = '';
                for (const post of posts) {
                    message += `${process.env.SITE}/api/post/share${post.id}\n`;
                    message += `${post.text.substring(0, 50)}\n`;
                }
                bot.sendMessage(msg.chat.id, message || `По запросу "${match[1]}" ни чего не найдено`, {parse_mode: "Markdown"});
            });
    });


    bot.onText(/\/help/, async (msg, match) => {
        const message = `/find <поиск> - поиск объявлений по запросу`
        bot.sendMessage(msg.chat.id, message, {parse_mode: "Markdown"});
    });

}

import BotApi from "../lib/BotApi";

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_API, {polling: !!(process.env.BOT_ENABLE * 1)});


module.exports.controller = function (app) {
    bot.onText(/\/echo (.+)/, (msg, match) => {
        // 'msg' is the received Message from Telegram
        // 'match' is the result of executing the regexp above on the text content
        // of the message

        const chatId = msg.chat.id;
        const resp = match[1]; // the captured "whatever"

        // send back the matched "whatever" to the chat
        bot.sendMessage(chatId, resp);
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const messages = await BotApi.prepareMessages(msg.text);
        for(const m of messages){
            await bot.sendMessage(chatId, m, {parse_mode: "Markdown"})
        }

    });
};

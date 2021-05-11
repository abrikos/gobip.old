import Mongoose from "server/db/Mongoose";
import MinterApi from "../lib/MinterApi";
import MixerApi from "../lib/MixerApi";

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_API, {polling: true});


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
        const isAddress = MinterApi.checkAddress(msg.text);
        const isNumber = msg.text * 1;
        if (!isAddress && !isNumber) return bot.sendMessage(chatId, 'Please input valid minter address, or any number');
        if (isAddress) {
            const data = await MixerApi.createAddressForMixing(msg.text)
            console.log(data)
            await bot.sendMessage(chatId, `To receive mixed BIPs please send from *${data.min}* BIP to *${data.max.toFixed(0)}* BIP to address:`, {parse_mode: "Markdown"})
            await bot.sendMessage(chatId, `*${data.address}*`, {parse_mode: "Markdown"})
        }
        if (isNumber) {
            const calc = await MixerApi.calculateMix(msg.text)
            await bot.sendMessage(chatId, `If you send ${calc.value} BIP
             will be received: *${calc.balance.toFixed(2)} BIP*  
             mixer commission: ${MinterApi.params.mixerFee} BIP, 
             count of transactions: ${calc.count}`, {parse_mode: "Markdown"})
        }

        // send a message to the chat acknowledging receipt of their message

    });
};

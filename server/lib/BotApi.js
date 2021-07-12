import MinterApi from "./MinterApi";
import MixerApi from "./MixerApi";

const BotApi = {
    async doAddress(text) {
        const messages = []
        const data = await MixerApi.createAddressForMixing(text)
        messages.push(`To receive mixed BIPs please send from *${data.min}* BIP to *${data.max.toFixed(0)}* BIP to address:`)
        messages.push(`*${data.address}*`)
        return messages;
    },

    doCalculateSum(text) {
        return new Promise((resolve , reject)=>{
            MixerApi.calculateMix(text)
                .then(calc=>{
                    const messages = []
                    messages.push(`Maximum amount for mix *${calc.total}* BIP`)
                    messages.push(`If you send ${calc.value} BIP will be received: *${calc.balance.toFixed(2)} BIP*`)
                    messages.push(`     mixer commission: ${MinterApi.params.mixerFee} BIP,`)
                    messages.push(`count of transactions: ${calc.count}`)
                    resolve(messages)
                })
                .catch(e=>{
                    resolve([e.message])
                });
        })

    },

    doHelp() {
        return [
            'Accepted inputs:',
            '<Mx...> - the address to which the mix will be received. Result: the address to which you want to send the amount for the mix.',
            '<any number> - the amount has been sent to the mixer address. Result: calculation of the amount received to the source address.',
        ]
    },

    async prepareMessages(text) {

        if (/\/help/.test(text)) {
            return this.doHelp()
        } else if (MinterApi.checkAddress(text)) {
            return this.doAddress(text)
        } else if (text * 1 > 0) {
            return this.doCalculateSum(text)
        } else {
            return ['Wrong request. Please /help']
        }

    }
}
export default BotApi;
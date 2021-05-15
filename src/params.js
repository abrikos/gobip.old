const networks = {
    main: {
        url: 'https://api.minter.one',
        coin: 'BIP',
        explorer: 'https://explorer.minter.network/',
        chainId: 1
    },
    test: {
        url: 'https://node-api.testnet.minter.network',
        coin: 'MNT',
        explorer: 'https://explorer.testnet.minter.network/',
        chainId: 2
    }
}

const network = networks[process.env.NET];
const params = {
    network,
    bannerPrice: process.env.BANNER_PRICE * 1,
    mixerFee: process.env.MIXER_FEE * 1,
    lotteryPrize: process.env.LOTTERY_PRISE * 1

}

export default params;

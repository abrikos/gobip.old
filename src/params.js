const networks = {
    main: {url: 'https://api.minter.one', coin: 'BIP', explorer: 'https://explorer.minter.network/', chainId: 1},
    test: {url: 'https://node-api.testnet.minter.network', coin: 'MNT', explorer: 'https://explorer.testnet.minter.network/', chainId: 2}
}

const network = networks[process.env.NET];
const params = {
    network,
    bannerPrice: process.env.BANNER_PRICE,
    mixerFee: process.env.MIXER_FEE
}

export default params;

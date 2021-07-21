const obj = {
    //useTimer: true,
    initialStake: 100,
    order: 1,
    label: "Step by step race",
    description: `Race to the finish line destroying rivals`,
    shiftFirstTurn: true,
    customTurn: true,
    defaultData: {
        winnersCount: 2,
        plotsCount: 3,
        plotsLength: 5,
        initialStake: 100,
        track: [[0.0]],
    },

    initTable(game) {
        const data = game.data;
        for(let p =0; p < game.data.plotsCount; p++){

        }
        for (const p of game.players) {
            //data.fields[p.id] = this.testShips(this.getCells());
            data.fields[p.id] = this.randomShips(this.getCells());
        }
        game.data = data;
    },

    hideOpponentData(game, userId) {
        return game;
    },

    hasWinners(game) {
        const data = game.data;
        let looser;
        for (const p of game.players) {
            if (data.fields[p.id].filter(c => c.shipSize).length === data.fields[p.id].filter(c => c.hit).length) looser = p;
        }
        if (looser) {
            game.winners.push(game.players.find(p => !p.equals(looser)))
        }
        return game.winners.length;
    },


    isWinner(game) {

        return [];
    },

    /*nextTurn(game, req) {
        console.log(game.players.map(p => p.id).indexOf(req.session.userId))
        return game.players.map(p => p.id).indexOf(req.session.userId) + 1;
    },*/

    getBank(game) {
        return Object.values(game.stakes).reduce((a, b) => a + b, 0)
    },

    canJoin(game, req) {
        return game.players.length < 2;
    },
    onLeave(game, req) {
        game.data = this.defaultData;
    },
    canLeave(game, req) {
        return true;
        //return game.data.turns.length === 0;
    },

    doTurn(game, userId, body) {
        const {turn} = body;
        if (!turn) return;
        const data = game.data;

        game.data = data;
        return {}
    },

    onJoin(game, userId) {
        if (game.players.length === 2) {
            this.initTable(game)
        }
        return {}
    },




}

//console.log(obj.randomShips(obj.getCells(),4))
//obj.randomShips()

export default obj
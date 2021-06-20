import moment from "moment";

const cols = 5;
const rows = 5;
const cells = Array.from({length: rows * cols}, (v, id) => {
    return {id}
});

const RoPaSciModule = {
    noTimer: true,
    order: 1,
    label: "Tic Tac Toe",
    opponentTurns: true,
    defaultData: {
        winRows: 3,
        cols,
        rows,
        cells,
        initialStake: 100,
        variants: ['rock', 'paper', 'scissors'],
        turns: []
    },
    hideOpponentData(game, req) {
        return game;
    },


    isEnd(game) {
        const data = game.data;
        if (data.cells.length !== 9) return false;
        const winners = [];
        for (const w of winners) {
            game.winners.push(game.players.find(p => p.equals(w.userId)));
        }
        return true;
    },

    doTurn(game, req) {
        if (!game.activePlayer.equals(req.session.userId)) return;
        const {turn} = req.body;
        const data = game.data;
        data.cells[cols * turn.row + turn.col].userId = req.session.userId;
        //data.turns.push({turn, userId: req.session.userId});
        game.data = data;
        game.activePlayerIdx++;
        if (game.activePlayerIdx >= game.players.length) game.activePlayerIdx = 0;
        game.activePlayerTime = moment().unix();
        return true
    },

    nextTurn(game, req) {
        console.log(game.players.map(p => p.id).indexOf(req.session.userId))
        return game.players.map(p => p.id).indexOf(req.session.userId) + 1;
    },

    getBank(game) {
        return Object.values(game.stakes).reduce((a, b) => a + b, 0)
    },

    canJoin(game, req) {
        return game.players.length < 2;
    },
    onJoin(game, req) {
        return true;
    },
    onLeave(game, req) {
        game.data = this.defaultData;
    },
    canLeave(game, req) {
        return true;
        //return game.data.turns.length === 0;
    },
    onBet() {

    },

}
export default RoPaSciModule
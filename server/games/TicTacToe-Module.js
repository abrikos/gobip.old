import moment from "moment";

const cols = 10;
const rows = 10;
const winRows = 5;
const cells = Array.from({length: rows * cols}, (v, i) => {
    return {col: i % rows, row: Math.ceil((i + 1) / rows) - 1}
});

const RoPaSciModule = {
    noTimer: true,
    order: 1,
    label: "Tic Tac Toe",
    description:`${winRows} cells in a line wins the game`,
    opponentTurns: true,
    defaultData: {
        winRows,
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


    hasWinners(game) {
        const data = game.data;
        const winnerCells = this.isWinner(game);
        for (const w of winnerCells) {
            data.cells[this._id(w)].win = 1;
        }
        game.data = data;
        if (winnerCells.length) {
            game.winners.push(game.players.find(p => p.equals(winnerCells[0].userId)));
        } else {
            const emptyCells = game.data.cells.filter(c => !c.userId).length;
            if (!emptyCells) {
                game.winners = game.players;
            }
        }
        return game.winners.length;
    },

    _id(turn) {
        return cols * turn.row + turn.col;
    },

    doTurn(game, req) {
        const {turn} = req.body;
        const data = game.data;
        const cell = data.cells.find(c => c.row === turn.row && c.col === turn.col);
        if (!cell) return;
        if (cell.userId) return;
        cell.userId = req.session.userId;
        //data.turns.push({turn, userId: req.session.userId});
        game.data = data;
    },

    isWinner(game) {
        //const vectors = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
        const vectors =[ [0,1]]
        for (const cell of game.data.cells.filter(c => c.userId)) {
            for (const vector of vectors) {
                const ids = []
                for (let i = 0; i < game.data.winRows; i++) {
                    const c = game.data.cells.find(c => c.row === cell.row + vector[0] * i && c.col === cell.col + vector[1] * i)
                    if (c && c.userId === cell.userId) {
                        ids.push(c)
                    }
                }
                if (ids.length >= game.data.winRows) {
                    return ids
                }
            }
        }
        return [];
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
    onJoinDoTurn(game, req) {
        return false;
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
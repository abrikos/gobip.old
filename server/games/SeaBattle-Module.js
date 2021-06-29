const cols = 10;
const rows = 10;
const winRows = 3;
const cells = Array.from({length: rows * cols}, (v, id) => {
    return {id, col: id % rows, row: Math.ceil((id + 1) / rows) - 1}
});

const obj = {
    //useTimer: true,
    initialStake: 100,
    order: 1,
    label: "Sea battle",
    description: ``,
    shiftFirstTurn: true,
    defaultData: {
        winRows,
        cols,
        rows,
        cells,
        initialStake: 100,
        fleets: {},
    },
    hideOpponentData(game, req) {
        return game;
    },

    onJoin(game, userId) {
        const data = game.data;
        console.log('TO DO FLEEETSSSS', userId)
        data.fleets[userId] = this._randomShips()
        game.data = data;
        return {}
    },

    _randomShips(fleet = [], length = 4) {
        const ships = [0, 5, 3, 2, 1];
        const orientations = ['row', 'col'];
        const directions = [1, -1];
        const count = ships[length];
        if(!count) return fleet;
        const freeCells = cells.filter(c=>!fleet.find(f=>f.id===c.id));
        const cell = freeCells[Math.floor(Math.random() * freeCells.length)];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const orientation = orientations[Math.floor(Math.random() * orientations.length)];
        for (let i = 0; i < count; i++) {
            fleet.push(cell)
        }

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

    initTable(game) {
        console.log('INIT TABLE')
        const data = game.data;
        data.cells = cells;
        game.data = data;
    },

    doTurn(game, userId, body) {
        const {turn} = body;
        if (!turn) return;
        const data = game.data;
        const cell = data.cells.find(c => c.row === turn.row && c.col === turn.col);
        if (!cell) return;
        if (cell.userId) return;
        cell.userId = userId;
        //data.turns.push({turn, userId: req.session.userId});
        game.data = data;
        return {}
    },

    isWinner(game) {
        //const vectors = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
        const vectors = [[0, 1]]
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
export default obj
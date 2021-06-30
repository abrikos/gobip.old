const rows = 10;
const cols = 10;

const obj = {
    //useTimer: true,
    initialStake: 100,
    order: 1,
    label: "Sea battle",
    description: ``,
    shiftFirstTurn: true,
    customTurn: true,
    defaultData: {
        rows,
        cols,
        initialStake: 100,
        fields: {},
    },
    hideOpponentData(game, userId) {
        let my, other;
        for (const uid in game.data.fields) {
            if (uid === userId) {
                my = game.data.fields[uid]
            } else {
                other = game.data.fields[uid]
                //.map(c=>c.hit || c.near)
            }
        }
        const data = game.data;
        data.fields = {my, other}
        game.data = data;
        return game;
    },

    onJoin(game, userId) {
        const data = game.data;
        if (game.players.length === 2) {
            data.fields[userId] = this.randomShips(this.getCells());
            const opponent = game.players.find(p => !p.equals(userId));
            data.fields[opponent.id] = this.randomShips(this.getCells());
        }
        game.data = data;
        return {}
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
        return rows * turn.row + turn.col;
    },

    initTable(game) {
        console.log('INIT TABLE')
        const data = game.data;
        game.data = data;
    },

    doTurn(game, userId, body) {
        const {turn} = body;
        if (!turn) return;
        const data = game.data;

        game.data = data;
        return {}
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

    getCells() {
        return Array.from({length: rows * cols}, (v, id) => {
            return {row: Math.ceil((id + 1) / rows) - 1, col: id % rows, id}
        });
    },


    randomShips(field = [], shipSize = 4) {
        const ships = [0, 5, 3, 2, 1];
        const count = ships[shipSize];
        if (!count) return field;
        for (let i = 0; i < count; i++) {
            const isRow = Math.floor(Math.random() * 2);
            //const isRow = 1;
            const orientCount = isRow ? rows : cols;
            const shiftDirection = isRow ? 'col' : 'row';
            const shiftDirectionOther = isRow ? 'row' : 'col';
            const noFleetCells = field
                //.filter(c => c.row < 5)
                //.filter(c => c[shiftDirection] < orientCount - shipSize + 1)
                .filter(c => !c.border && !c.shipSize)
            let availableCells = [];
            for (const c of noFleetCells) {
                let available = true;
                for (let shift = 0; shift < shipSize; shift++) {
                    if (!available) continue
                    const next = field.find(c2 => c2[shiftDirection] === c[shiftDirection] + shift && c2[shiftDirectionOther]===c[shiftDirectionOther])
                    if (!next || !noFleetCells.find(nfc => nfc.id === next.id)) {
                        available = false;
                    }
                }

                if (available) {
                    availableCells.push(c)
                }

            }
            //console.log(shipSize, noFleetCells.length, availableCells.length)
            //console.log(Math.max.apply(null, freeCells.map(c=>c.row)))
            const acId = Math.floor(Math.random() * availableCells.length);
            const cell = availableCells[acId];
            if (!cell) {
                return field
            }

            this.placeShip(cell.id, shipSize, isRow, field)
        }

        return this.randomShips(field, shipSize - 1)

    },

    placeShip(id, shipSize, isRow, field) {
        const cell = field[id];
        const orientation1 = !isRow ? 'row' : 'col';
        const orientation2 = isRow ? 'row' : 'col';
        const ship = []
        for (let j = 0; j < shipSize; j++) {
            const c = field.find(c => c[orientation1] === cell[orientation1] + j && c[orientation2] === cell[orientation2])
            c.shipSize = shipSize
            if (c.border) delete c.border
            ship.push(c)
        }
        this.placeBorders(ship, field)
    },

    placeBorders(ship, field) {
        const vectors = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
        for (const c of ship) {
            for (const vector of vectors) {
                const c2 = field.find(c3 => c3.row === c.row + vector[0] && c3.col === c.col + vector[1]);
                if (c2 && !field.find(c => c.id == c2.id && c.shipSize)) {
                    c2.border = 1;
                }
            }
        }
    },


}

//console.log(obj.randomShips(obj.getCells(),4))
//obj.randomShips()

export default obj
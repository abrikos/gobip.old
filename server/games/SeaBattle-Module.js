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
        let my = [], other = [];
        for (const p of game.players) {
            if (p.id === userId) {
                my = game.data.fields[userId];
            } else if (game.data.fields[p.id]) {
                other = game.data.fields[p.id]
                    .map(c => {
                        const {border, shipSize, ...rest} = c
                        return game.winners.length ? c : rest
                    })
            }
        }
        const data = game.data;
        data.fields = {my, other}
        game.data = data;
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

    _id(turn) {
        return rows * turn.row + turn.col;
    },

    initTable(game) {
        const data = game.data;
        for (const p of game.players) {
            //data.fields[p.id] = this.testShips(this.getCells());
            data.fields[p.id] = this.randomShips(this.getCells());
        }
        game.data = data;
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
    onBet() {

    },

    opponentId(game, userId) {
        const opponent = game.players.find(p => !p.equals(userId));
        if (!opponent) return 'empty'
        return opponent.id;
    },

    getCells() {
        return Array.from({length: rows * cols}, (v, id) => {
            return {row: Math.ceil((id + 1) / rows) - 1, col: id % rows, id}
        });
    },

    doTurn(game, userId, body) {
        const {turn} = body;
        if (!turn) return;
        const data = game.data;
        const field = data.fields[this.opponentId(game, userId)];
        const cell = field[turn]
        if (cell.shipSize) {
            cell.hit = 1;
            const ship = field.filter(c => c.shipId === cell.shipId);
            if (cell.shipSize === ship.filter(c => c.hit).length) {
                for (const c of ship) {
                    c.sunk = 1
                }
                this.placeBorders(ship, field, 'near')
            }

        } else {
            cell.miss = 1;
            game.nextPlayer()
        }
        game.data = data;
        return {}
    },

    onJoin(game, userId) {
        if (game.players.length === 2) {
            this.initTable(game)
        }
        return {}
    },

    testShips(field) {
        this.placeShip(34, 4, 1, field, '4-0');
        this.placeShip(61, 3, 0, field, '3-0');
        this.placeShip(63, 3, 1, field, '3-1');
        this.placeShip(3, 2, 0, field, '2-0');
        return field
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
                    const next = field.find(c2 => c2[shiftDirection] === c[shiftDirection] + shift && c2[shiftDirectionOther] === c[shiftDirectionOther])
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

            this.placeShip(cell.id, shipSize, isRow, field, `${shipSize}-${i}`)
        }

        return this.randomShips(field, shipSize - 1)

    },

    placeShip(id, shipSize, isRow, field, shipId) {
        const cell = field[id];
        const orientation1 = !isRow ? 'row' : 'col';
        const orientation2 = isRow ? 'row' : 'col';
        const ship = []
        for (let j = 0; j < shipSize; j++) {
            const c = field.find(c => c[orientation1] === cell[orientation1] + j && c[orientation2] === cell[orientation2])
            c.shipSize = shipSize
            c.shipId = shipId
            if (c.border) delete c.border
            ship.push(c)
        }
        this.placeBorders(ship, field)
    },

    placeBorders(ship, field, key = 'border') {
        const vectors = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
        for (const c of ship) {
            for (const vector of vectors) {
                const c2 = field.find(c3 => c3.row === c.row + vector[0] && c3.col === c.col + vector[1]);
                if (c2 && !field.find(c => c.id == c2.id && c.shipSize)) {
                    c2[key] = 1;
                }
            }
        }
    },


}

//console.log(obj.randomShips(obj.getCells(),4))
//obj.randomShips()

export default obj
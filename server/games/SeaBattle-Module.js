const rows = 10;
const cols = 10;

const obj = {
    //useTimer: true,
    initialStake: 100,
    order: 1,
    label: "Sea battle",
    description: ``,
    shiftFirstTurn: true,
    defaultData: {
        rows,
        cols,
        initialStake: 100,
        fleets: {},
    },
    hideOpponentData(game, req) {
        return game;
    },

    onJoin(game, userId) {
        const data = game.data;
        console.log('TO DO FLEEETSSSS', userId)
        data.fleets[userId] = this.randomShips()
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
        const cell = data.cells.find(c => c.row === turn.row && c.col === turn.col);
        if (!cell) return;
        if (cell.userId) return;
        cell.userId = userId;
        //data.turns.push({turn, userId: req.session.userId});
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
            return {id, col: id % rows, row: Math.ceil((id + 1) / rows) - 1}
        });
    },

    randomShips(fleet = [], shipLength = 4) {
        const cells = this.getCells();
        const ships = [0, 5, 3, 2, 1];
        const orientations = [['row', 'col'], ['col', 'row']];
        const count = ships[shipLength];
        if (!count) return fleet;

        for (let i = 0; i < count; i++) {
            //const orientation = orientations[Math.floor(Math.random() * orientations.length)];
            const isRow = Math.floor(Math.random() * 2);
            const orientCount = isRow ? rows : cols;
            const orientation = isRow ? 'row' : 'col';
            const noFleetCells = cells
                .filter(c => !fleet.find(f => f.id === c.id))
                .filter(c => c[orientation] < orientCount - shipLength);
            let availableCells = [];
            for (let orient = 0; orient < orientCount; orient++) {
                const bar = cells
                    .filter(c => c[orientation] === orient)
                    .filter(c => noFleetCells.find(nfc => nfc.id === c.id))
                for (const c of bar) {
                    let available = true;
                    for (let test = 0; test < shipLength; test++) {
                        if (!noFleetCells.find(nfc => nfc.id === c.id)) {
                            available = false;
                            break;
                        }
                    }
                    if (available) availableCells.push(c)
                }
            }
            //console.log(Math.max.apply(null, freeCells.map(c=>c.row)))
            const acId = shipLength === 4 ? 4 : Math.floor(Math.random() * availableCells.length);
            const cell = availableCells[acId];
            if (!cell) return fleet
            console.log(noFleetCells.length)
            fleet = fleet.concat(this.placeShip(cell.id, shipLength, isRow, fleet))
        }

        this.randomShips(fleet, shipLength - 1)
        return fleet;
    },

    _cellInFleet(id, fleet) {
        const exist = fleet.find(c => c.id === id);
        if (exist) {
            console.log('Exist', exist)
        }
        return !!exist;
    },

    placeShip(id, shipLength, isRow, fleet) {
        const exist = fleet.find(c => c.id === id);
        if (exist) {
            console.log('Exist', exist)
            return fleet;
        }
        const cells = this.getCells();
        const cell = cells[id];
        const orientation1 = isRow ? 'row' : 'col';
        const orientation2 = !isRow ? 'row' : 'col';
        const ship = []
        for (let j = 0; j < shipLength; j++) {
            const c = cells.find(c => c[orientation1] === cell[orientation1] + j && c[orientation2] === cell[orientation2])
            if (!this._cellInFleet(c.id, fleet)) {
                c.shipLength = shipLength
                ship.push(c)
            }
        }
        console.log(ship)
        return fleet.concat(ship.concat(this.placeBorders(ship, fleet)))
    },

    placeBorders(ship,fleet) {
        const cells = this.getCells();
        const vectors = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
        const borders = []
        for (const c of ship) {
            for (const vector of vectors) {
                const c2 = cells.find(c3 => c3.row === c.row + vector[0] && c3.col === c.col + vector[1]);
                if (c2 && !ship.find(c => c.id == c2.id) && !fleet.find(c => c.id == c2.id) && !borders.find(c => c.id === c2.id)) {
                    const border = 1;
                    borders.push({border, ...c2})
                }
            }
        }
        console.log(borders)
        return borders;
    },

    test() {
        let fleet = obj.placeShip(4, 4, 1, []);
        fleet = fleet.concat(obj.placeShip(6, 3, 1, fleet));
    }

}

obj.randomShips()
//obj.randomShips()

export default obj
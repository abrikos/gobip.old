const PokerApi = {
    _cards: {suits: ['S', 'C', 'D', 'H'], values: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']},

    d: ['C9', 'C10', 'CJ', 'CQ', 'S9'],
    u: ['C2', 'CK'],
    o: ['C8', 'H5'],

    get _deckCheck() {
        const deck = this.o.concat(this.u).concat(this.d);
        const rnd = this._deckRandom;
        const ret = []
        for (const d of deck) {
            ret.push(rnd.find(r => r.name === d))
        }
        return ret;
    },

    get _deckRandom() {
        const d = [];
        for (const suit of this._cards.suits) {
            for (let idx = 0; idx < this._cards.values.length; idx++) {
                d.push({suit, value: this._cards.values[idx], idx, name: suit + this._cards.values[idx]})
            }
        }
        return d.sort(function () {
            return 0.5 - Math.random()
        })
    },

    cardName(c) {
        return c.suit + c.value;
    },

    randomSet(cards, count) {
        const set = []
        //const deck = this._deckCheck;
        const deck = this._deckRandom;
        const restDeck = deck.filter(d => !cards.map(c => c.name).includes(d.name))
        for (let i = 0; i < count; i++) {
            set.push(restDeck[i])
        }
        return set;
    },

    calc: function (hand, table) {
        try {
            const sorted = hand.concat(table).sort((a, b) => b.idx - a.idx);
            const flush = this._getFlush(sorted);
            if (flush && flush.straight) return flush;
            const care = this._getByValues(4, sorted);
            if (care) return care;
            const fullhouse = this._getFullHouse(sorted);
            if (fullhouse) return fullhouse;
            if (flush) return flush;
            const straight = this._getStraight(sorted);
            if (straight) return straight;
            const set = this._getByValues(3, sorted);
            if (set) return set;
            const double = this._getDouble(sorted);
            if (double) return double;
            const pair = this._getByValues(2, sorted);
            if (pair) return pair;
            return this._getHighCard(sorted);
        } catch (e) {
            return e
        }
    },

    _combinationSum: function (combination) {
        return combination.map(c => 2 ** c.idx).reduce((a, b) => a + b)
    },


    _getHighCard: function (source) {
        const combination = source.splice(0, 5);
        return {combination, sum: this._combinationSum(combination), name: "High card", priority: 1}
    },

    _getDouble: function (sorted) {
        const combination = [];
        for (const s of sorted) {
            if (combination.length === 4) break;
            if (sorted.filter(s2 => s2.idx === s.idx).length === 2) combination.push(s)
        }
        const kickers = sorted.filter(s => !combination.map(c => c.idx).includes(s.idx))
        if (combination.length !== 4) return;
        combination.push(kickers[0])
        return combination && {combination, sum: this._combinationSum(combination), name: "Two pairs", priority: 2.5}
    },

    _getFullHouse: function (sorted) {
        const combination = [];
        for (const s of sorted) {
            //if (combination.length === 4) break;
            //console.log('zzzzzzz',s, sorted.filter(s2 => s2.idx === s.idx))
            if (sorted.filter(s2 => s2.idx === s.idx).length >= 2) combination.push(s)
        }
        return combination.length === 5 && {combination, sum: this._combinationSum(combination), name: "Full house", priority: 6.5}
    },


    _getByValues: function (count, source) {
        const names = {4: "Care", 3: "Set", 2: "Pair"};
        const sorted = Object.assign([], source);
        let obj = {};
        for (const s of sorted) {
            if (!obj[s.value]) obj[s.value] = [];
            obj[s.value].push(s);
        }
        const matched = Object.keys(obj).find(key => obj[key].length === count);
        let combination = obj[matched];
        const kickersCount = -7 - count;
        const kickers = sorted.filter(c => c.value !== matched)
            .splice(kickersCount - 2, 5 - count);
        if (!combination) return;
        combination = combination.concat(kickers);
        return {combination, sum: this._combinationSum(combination), name: names[count], priority: count}
    },


    _getFlush: function (sorted) {
        const suites = {};
        let flush;
        for (const s of sorted) {
            if (!suites[s.suit]) suites[s.suit] = [];
            suites[s.suit].push(s);
            //logger.info(s)

            if (suites[s.suit].length === 5) {
                flush = suites[s.suit];
            }
        }
        //logger.info(flush.splice(0,5))
        if (!flush) return;
        const straight = this._getStraight(flush);
        let name;
        let priority;
        let combination;
        if (straight) {
            combination = straight.combination;
            name = flush[0].idx === 12 ? 'Flush Royal' : 'Straight flush';
            priority = 7
        } else {
            name = 'Flush';
            priority = 6;
            combination = flush.splice(0, 5)
        }
        //logger.info(combination)
        return {combination, max: combination[0], sum: this._combinationSum(combination), straight: !!straight, name, priority}
    },


    _getStraight: function (source) {
        function check(card) {
            try {
                return sorted.find(c => c.idx === card.idx - 1)
                    && sorted.find(c => c.idx === card.idx - 2)
                    && sorted.find(c => c.idx === card.idx - 3)
                    && sorted.find(c => c.idx === card.idx - 4)
            } catch (e) {
                return false;
            }
        }

        const sorted = Object.assign([], source);
        if (sorted[0].idx === 12) {
            const ace = Object.assign({}, sorted[0]);
            ace.idx = -1;
            sorted.push(ace)
        }
        let combination = [];
        for (const card of sorted) {
            if (check(card)) {
                combination.push(card);
                for (let i = 1; i < 5; i++) {
                    combination.push(sorted.find(c => c.idx === card.idx - i))
                }
                return {combination, max: combination[0], name: 'Straight', priority: 5}
            }
        }


    }
}

export default PokerApi
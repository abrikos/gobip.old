import Mongoose from "server/db/Mongoose";
import neuro from "server/lib/neuro"

const parse = require("csv-parse")
const fs = require('fs');
const path = require('path');
const name = path.basename(__filename,'.js');
const historyDays = 7;

//DATA FROM
//https://www.cryptodatadownload.com/data/binance/
const keys = ['unix', 'date', 'symbol', 'open', 'high', 'low', 'close', 'volCrypto', 'volUsd', 'trades']
const fields = ['close','volCrypto', 'volUsd', 'trades']
const csvData = [];


function rowToObj(row) {
    const data = {}
    for (let k = 0; k < keys.length; k++) {
        data[keys[k]] = row[k]
    }
    return data;
}

function fill() {
    console.log('Start csv parsing')
    fs.createReadStream('data/Binance_ETHUSDT_d.csv')
        .pipe(parse({delimiter: ','}))
        .on('data', function (csvrow) {
            //console.log(csvrow);
            //do something with csvrow
            csvData.push(csvrow);
        })
        .on('end', async function () {
            console.log('Parsing done', name)
            await Mongoose[name].deleteMany({})
            console.log('DB erased')
            for (let i = 0; i < csvData.filter(d => d[9] * 1).length; i++) {
                const data = rowToObj(csvData[i])

                const next = csvData[i - 1];
                if (next) {
                    data.closeNext = rowToObj(next).close
                }
                await Mongoose[name].create(data)
            }
            console.log('========= DB filled ==============')
            //Mongoose[name].findOne().sort({date: -1}).then(console.log)
        });
}

async function adaptTraining(row) {
    const list = await Mongoose[name].find({date: {$lt: row.date}})
        .limit(historyDays)
        .sort({date: -1})
    const ret = {input: {}, output: {k:(row.closeNext / row.close).toFixed(2)}};
    for (let i=0; i< list.length;i++) {

        for (const f of fields) {
            ret.input[`${f}${i}`] = row[f] / list[i][f]
        }
    }
    return ret;
}

async function train() {
    const options = {
        errorThresh: 0.005,  // error threshold to reach
        iterations: 50000,   // maximum training iterations
        log: true,           // console.log() progress periodically
        logPeriod: 1,       // number of iterations between logging
        learningRate: 0.3    // learning rate
    }

    const list = await Mongoose[name].find().sort({date: -1})
    const train = [];
    for (const l of list) {
        const tr = await adaptTraining(l);
        //console.log(tr.output  , Object.keys(tr.input).length)
        if(tr.output.k * 1 && Object.keys(tr.input).length)
            train.push(tr)
    }

    //console.log(await adaptTraining(list[0]))
    console.log('Wait for end training...')
    await neuro.train(name, train, options)
    console.log('Training done')

}

async function test() {
    const list = await Mongoose[name].find()
        .sort({date: -1})
    const testIdx = 100;
    const row = await adaptTraining(list[testIdx]);
    console.log('Testing row')
    const res = await neuro.run(name, row.input)
    console.log(res)
    console.log('Test close price:', list[testIdx].close)
    console.log('Result:', list[testIdx].close * res.k)
    console.log('Result must be', list[testIdx-1].close)


}

async function start() {
    //await fill()
    //await train()
    await test()
}

start()

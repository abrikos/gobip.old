import Mongoose from "server/db/Mongoose";
const parse = require("csv-parse")
const fs = require('fs');
const historyDays = 7;
//DATA FROM
//https://www.cryptodatadownload.com/data/binance/
const keys = ['unix','date','symbol','open','high','low','close','volCrypto','volUsd','trades']
const csvData=[];

function rowToObj(row){
    const data = {}
    for(let k=0; k< keys.length; k++){
        data[keys[k]] = row[k]
    }
    return data;
}

fs.createReadStream('tools/Binance_ETHUSDT_d.csv')
    .pipe(parse({delimiter: ','}))
    .on('data', function(csvrow) {
        //console.log(csvrow);
        //do something with csvrow
        csvData.push(csvrow);
    })
    .on('end',async function() {
        //do something with csvData
        await Mongoose.ethereum.deleteMany({})

        for(let i=0; i <csvData.filter(d=>d[9]*1).length;i++){
            const data = rowToObj(csvData[i])
            const next = rowToObj(csvData[i+1])
            if(next.trades * 1) {
                data.kClose = data.close / next.close;
                data.kVolCrypto = data.volCrypto / next.volCrypto;
                data.kVolUsd = data.volUsd / next.volUsd;
                data.kTrades = data.trades / next.trades;
                await Mongoose.ethereum.create(data)
            }else{
                console.log(next.trades * 1, next)
            }
        }
        Mongoose.ethereum.findOne().then(console.log)
    });

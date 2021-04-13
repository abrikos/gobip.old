const brain = require('brain.js')
const net = new brain.NeuralNetwork();
import Mongoose from "server/db/Mongoose";

export default {
    train: function (name, trainingSource, options) {
        Mongoose.training.findOne({name})
            .then(r=>{
                if(!r){
                    net.train(trainingSource, options)
                    Mongoose.training.create({name,trainingSource, trainingResult:net.toJSON(),options})
                }else{
                    //TODO unique trainig source
                    const merged = r.trainingSource ? r.trainingSource.concat(trainingSource) : trainingSource;
                    const unique = [];
                    for(const t of merged){
                        if(!unique.find(x=>JSON.stringify(x)===JSON.stringify(t))) unique.push(t)
                    }
                    r.trainingSource = unique;
                    net.train(r.trainingSource, options);
                    r.trainingResult = net.toJSON();
                    r.options = options;
                    r.save();
                }
                console.log('Training complete', r.trainingSource)
            })
    },

    run: async function (name, test) {
        const r = await Mongoose.training.findOne({name});
        console.log('Size of training set', JSON.stringify(r.data).length)
        net.fromJSON(r.data);
        return net.run(test);
    }
}

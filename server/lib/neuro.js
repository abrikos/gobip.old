const brain = require('brain.js')
const net = new brain.NeuralNetwork();
const fs = require('fs');

export default {
    train: async function (name, trainingSource, options) {
        //const r = Mongoose.training.findOne({name})
        console.log('Start training')
        net.train(trainingSource, options)
        fs.writeFile(`data/${name}-training.dat`,JSON.stringify(net.toJSON()),()=>{})
        console.log('Training complete')
        return net;
    },

    run: async function (name, test) {
        const str = fs.readFileSync(`data/${name}-training.dat`, 'utf8')
        net.fromJSON(JSON.parse(str));
        return net.run(test);
    }
}

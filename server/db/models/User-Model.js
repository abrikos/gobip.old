import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modelSchema = new Schema({
        externalId: {type: Number},
        strategy: String,
        name: {type: String},
        nickname: String,
        address: String,
        photo: String,
        email: String,
        admin: {type: Boolean},
        virtualBalance: {type: Number, default: 100000},
        realBalance: {type: Number, default: 0},
        files: [{type: mongoose.Schema.Types.ObjectId, ref: 'Image'}]
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });


modelSchema.statics.population = ['quizzes']

modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('displayName')
    .get(function () {
        return this.nickname || this.name || this.username;
    });

modelSchema.virtual('quizzes', {
    ref: 'quiz',
    localField: '_id',
    foreignField: 'user',
    justOne: false // set true for one-to-one relationship
});


export default mongoose.model("User", modelSchema)



import moment from "moment";
import transliterate from "transliterate"
import striptags from "striptags";

const removeMd = require('remove-markdown');
const ogs = require('open-graph-scraper');
const util = require('util')
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modelSchema = new Schema({
        header: {type: String, label: 'Тема'},
        annotation: {type: String, label: 'Анотация', control: 'markdown'},
        text: {type: String, label: 'Дополнительно', control: 'markdown'},
        speaker: {type: String, label: 'Докладчик'},
        speaker2: {type: String, label: 'Инфо докладчика'},
        day: {type: Date, label: "Дата", control: "datepicker"},
        hour: {type: Number, label: "Час", default: 18},
        meeting: {type: String, label: 'Ссылка на ВКС'},
        video: {type: String, label: 'Ссылка на видео'},
        imgUrl: {type: String, label: 'Ссылка на картинку'},
        presentation: {type: String, label: 'Ссылка на презентацию'},
        url: {type: String, label: 'Адрес на сайте СМИ'},
        //isMarkdown: {type: Boolean, label: 'Markdown', default: true},
        editable: Boolean,
        published: {type: Boolean, label: 'Опубликовано'},
        views: {type: Number, default: 0},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        files: [{type: mongoose.Schema.Types.ObjectId, ref: 'File'}],
        file: {type: mongoose.Schema.Types.ObjectId, ref: 'File'},

    },
    {
        timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'},
        //toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

modelSchema.statics.population = ['file', 'files'];

modelSchema.formOptions = {
    label: 'Новости',
    listOrder: {createdAt: -1},
    listFields: ['header', 'date'],
    searchFields: ['header'],
}

modelSchema.statics.fromUrl = async function ({url}, user) {
    const r = await this.urlMeta(url)
    return await this.create({user, imgUrl: r.ogImage.url, header: r.ogTitle, text: r.ogDescription, published: true, url})
}

modelSchema.statics.urlMeta = async function (url) {
    const ogsP = util.promisify(ogs)
    return await ogsP({url})
}

modelSchema.virtual('dayDate')
    .get(function () {
        return moment(this.day).format('YYYY-MM-DD')
    })

modelSchema.virtual('isFuture')
    .get(function () {
        const a = moment(this.day)
        const b = moment()
        return a.diff(b) > 0
    })

modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    })
    .set(function (val) {
        this.createdAt = moment(val).format('YYYY-MM-DD HH:mm:ss');

    });

modelSchema.virtual('previewPath')
    .get(function () {
        return this.file ? this.file.path : this.imgUrl || '/logo.svg'
    });

modelSchema.virtual('adminLink')
    .get(function () {
        return `/admin/post/${this.id}/update`
    });

modelSchema.virtual('shareData')
    .get(function () {
        return {
            header: `${process.env.SITE_NAME} - ${removeMd(this.header)}`,
            text: striptags(removeMd(this.text)),
            image: `${process.env.SITE}${this.file ? this.file.path : '/logo.svg'}`,
            url: `${process.env.SITE}${this.link}`
        }
    });

modelSchema.virtual('shareLink')
    .get(function () {
        return `/api/post/share/${this.id}`
    });


modelSchema.virtual('link')
    .get(function () {
        if (this.url) return this.url;
        return `/post/` + this.id + '/' + (this.header ? transliterate(this.header).replace(/[^a-zA-Z0-9]/g, '-') : '')
    });


export default mongoose.model("Post", modelSchema)



var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var WorkSchema = new Schema({
	from: {type: ObjectId, ref: 'User'},
	title: String,
	titleImage: String,
	type: String,
	main: String,
	content: [],
		// imagePath: String
		// text: String
	watch: {
		type: Number,
		default: 0
	},
	collect: {
		type: Number,
		default: 0
	},
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	}
})

WorkSchema.pre('save', function(next){
	if( this.isNew ){
		this.meta.createAt = this.meta.updateAt = Date.now()
	}else{
		this.meta.updateAt = Date.now()
	}
	next()
})

WorkSchema.statics = {
	listCount: function(cb) {
		return this
		.find({})
		.count()
		.exec(cb)
	},
	findDataStart: function(start, number, cb){
		return this
		.find({})
		.sort({'meta.updateAt': -1})
		.skip(start).limit(number)
		.exec(cb)
	},
	findById: function(id, cb){
		return this
		.findOne({_id: id})
		.exec(cb)
	},
	findByUserId: function(userID, cb){
		return this
		.find({
			from: userID
		})
		.sort({'meta.updateAt': -1})
		.exec(cb)
	}
}

module.exports = WorkSchema
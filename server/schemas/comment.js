var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var CommentSchema = new Schema({
	workID: {type: ObjectId, ref: 'Work'},
	fromID: {type: ObjectId, ref: 'User'},
	toID: {type: ObjectId, ref: 'Comment'},
	content: String,
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		}
	},
	state: {
		type: Number,
		default: 0
	}//0:不存在，1：对作品评论，2：对评论回复
})

CommentSchema.pre('save', function(next){
	var User = this
	
	if( this.isNew ){
		this.meta.createAt = Date.now()
	}

	next()
})


CommentSchema.statics = {
	CountByWorkId: function(workID, cb){
		return this
		.find({
			workID: workID
		})
		.count()
		.exec(cb)
	},
	findOneById: function(_id, cb){
		return this
		.findOne({
			_id: _id
		})
		.exec(cb)
	},
	findByUserId: function(userID, cb){
		return this
		.find({
			fromID: userID
		})
		.sort({'meta.createAt': -1})
		.exec(cb)
	},
	findByWorkId: function(workID, cb){
		return this
		.find({
			workID: workID
		})
		.sort({'meta.createAt': -1})
		.exec(cb)

		//.skip(start).limit(number)
	}
}

module.exports = CommentSchema
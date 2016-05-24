var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var FollwerSchema = new Schema({
	fromID: {type: ObjectId, ref: 'User'},//follower
	toID: {type: ObjectId, ref: 'User'},//fans
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		}
	}
})

FollwerSchema.pre('save', function(next){
	var User = this
	
	if( this.isNew ){
		this.meta.createAt = Date.now()
	}

	next()
})


FollwerSchema.statics = {
	findOneById: function(fromID, toID, cb){
		return this
		.findOne({
			fromID: fromID,
			toID: toID
		})
		.exec(cb)
	},
	findFollwerById: function(userID, cb){
		return this
		.find({
			toID: userID
		})
		.sort({'meta.createAt': -1})
		.exec(cb)
	},
	findFansById: function(userID, cb){
		return this
		.find({
			fromID: userID
		})
		.sort({'meta.createAt': -1})
		.exec(cb)
	}
}

module.exports = FollwerSchema
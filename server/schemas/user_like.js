var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var UserLikeSchema = new Schema({
	_id: {type: ObjectId, ref: 'User'},
	like: [
			{
				_id: {type: ObjectId, ref: 'Work'},
				createAt: {
					type: Date,
					default: Date.now()
				}
			}
		]
})

UserLikeSchema.statics = {
	findByUserId: function(userID, cb){
		return this
		.find({
			_id: userID
		})
		.sort({'like.createAt': -1})
		.exec(cb)
	},
	findByWorkId: function(workID, cb){
		return this
		.find({
			like:{$elemMatch:{
				_id: workID
			}}
		})
		.sort({'like.createAt': -1})
		.exec(cb)
	},
	findLikeList: function(workID, cb){
		return this
		.find(
			{
				like: {$elemMatch:{
					_id: workID
				}}
			},{
				like: {$elemMatch:{
					_id: workID
				}}
			}
		)
		.sort({'like.createAt': -1})
		.exec(cb)
	}
}

module.exports = UserLikeSchema
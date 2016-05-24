var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var UserCollectSchema = new Schema({
	_id: {type: ObjectId, ref: 'User'},
	collect: [
			{
				_id: {type: ObjectId, ref: 'Work'},
				createAt: {
					type: Date,
					default: Date.now()
				}
			}
		]
})

UserCollectSchema.statics = {
	findByUserId: function(userID, cb){
		return this
		.find({
			_id: userID
		})
		.sort({'collect.createAt': -1})
		.exec(cb)
	},
	findByWorkId: function(workID, cb){
		return this
		.find({
			collect:{$elemMatch:{
				_id: workID
			}}
		})
		.sort({'collect.createAt': -1})
		.exec(cb)
	}
}

module.exports = UserCollectSchema
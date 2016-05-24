var mongoose = require('mongoose')
//加密加盐
var bcrypt = require('bcrypt-nodejs')
var SALT_WORK_FACTOR = 10

var ManagerSchema = new mongoose.Schema({
	username: {
		unique: true,
		type: String
	},
	password: String,
	level: Number,
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

ManagerSchema.pre('save', function(next){
	var manager = this

	if( this.isNew ){
		this.meta.createAt = this.meta.updateAt = Date.now()
	}
	else{
		this.meta.updateAt = Date.now()
	}

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
		if(err) return next(err)

		bcrypt.hash(manager.password, salt, null, function(err, hash){
			if(err) return next(err)

			manager.password = hash
			next()
		})
	})
})

ManagerSchema.methods = {
	comparePassword: function(_password, cb){
		bcrypt.compare(_password, this.password, function(err, isMatch){
			if(err) return cb(err)

			cb(null, isMatch)
		})
	}
}

ManagerSchema.statics = {
	findByName: function(name, cb){
		return this
		.findOne({username: name})
		.exec(cb)
	}
}

module.exports = ManagerSchema
var mongoose = require('mongoose')
//加密加盐
var bcrypt = require('bcrypt-nodejs')
var SALT_WORK_FACTOR = 10

var UserSchema = new mongoose.Schema({
	username: {
		unique: true,
		type: String
	},
	password: String,
	head_photo: {
		type: String,
		default: '/src/images/user_head_photo.png'
	},
	sex: {
		type: String,
		default: '秘密'
	},
	address: {
		type: String,
		default: '中国'
	},
	job: {
		type: String,
		default: '自由职业者'
	},
	sign: String,
	introduce: String,
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

UserSchema.pre('save', function(next){
	var User = this

	if( this.isNew ){
		this.meta.createAt = this.meta.updateAt = Date.now()
	}
	else{
		this.meta.updateAt = Date.now()
	}

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
		if(err) return next(err)

		bcrypt.hash(User.password, salt, null, function(err, hash){
			if(err) return next(err)

			User.password = hash
			next()
		})
	})
})

UserSchema.methods = {
	comparePassword: function(_password, cb){
		bcrypt.compare(_password, this.password, function(err, isMatch){
			if(err) return cb(err)

			cb(null, isMatch)
		})
	}
}

UserSchema.statics = {
	findById: function(id, cb){
		return this
		.findOne({_id: id})
		.exec(cb)
	},
	findByName: function(name, cb){
		return this
		.findOne({username: name})
		.exec(cb)
	}
}

module.exports = UserSchema
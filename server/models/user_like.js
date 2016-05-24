var mongoose = require('mongoose')
var UserLikeSchema = require('../schemas/user_like')
var UserLike = mongoose.model('UserLike', UserLikeSchema)

module.exports = UserLike
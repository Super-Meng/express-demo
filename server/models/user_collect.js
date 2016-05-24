var mongoose = require('mongoose')
var UserCollectSchema = require('../schemas/user_collect')
var UserCollect = mongoose.model('UserCollect', UserCollectSchema)

module.exports = UserCollect
var mongoose = require('mongoose')
var FollwerSchema = require('../schemas/follower')
var Follwer = mongoose.model('Follwer', FollwerSchema)

module.exports = Follwer
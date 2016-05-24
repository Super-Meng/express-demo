var mongoose = require('mongoose')
var ManagerSchema = require('../schemas/manager')
var Manager = mongoose.model('Manager', ManagerSchema)

module.exports = Manager
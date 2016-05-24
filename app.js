var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var mongoose = require('mongoose')
var mongoStore = require('connect-mongo')(session)

var port = process.env.PORT || 3000
var app = express()
var DBURL = 'mongodb://localhost/app'

//connect to mongoDB
mongoose.connect(DBURL)

app.set('views', './web/')
app.set('view engine', 'jade')

app.use(session({
 	secret: 'flora',
 	resave: false,
 	saveUninitialized: false,
 	store: new mongoStore({
 		url: DBURL,
 		collection: 'sessions'
 	})
}))
app.use(require('body-parser').urlencoded({extended: true}))
app.use(bodyParser.json());
app.use('/src', express.static('./web/src'))
app.use('/uploads', express.static('./uploads'))

/*
* var path = require('path')
* app.use(express.static(path.join(__dirname, 'bower_components')))
*/

app.listen(port)
//导出路由模块
require('./config/router')(app)

console.log('Flora Cc is start in '+ port);
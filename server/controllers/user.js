var async = require('async')
//上传插件
var multiparty = require('multiparty')
//日期插件
var moment = require('moment')
//文件管理插件
var fs= require("fs")

var User = require('../models/user')
var Work = require('../models/work')
var UserLike = require('../models/user_like')
var UserCollect = require('../models/user_collect')
var Follower = require('../models/follower')

//用户登录
exports.UserLoginRender = function(req, res){
	res.render('user_login')
}
exports.UserLoginPost = function(req, res){
	var userObj = req.body.user
	var _user = new User({
		username: userObj.username,
		password: userObj.password
	})
	if(_user.username == '' || _user.password == ''){
		res.redirect('/user/login')
		res.send({
			value: 0,
			tips: '帐号或密码为空!'
		})
		return
	}

	User.findByName(_user.username ,function(err, user){
		if(err) console.log('findByName:  '+ err)
		if(!user){
			res.send({
				value: 0,
				tips: '账号或密码错误!'
			})
			return
		}
		user.comparePassword(_user.password, function(err, isMatch) {
			if(err) return console.log('comparePassword:  '+ err)

			if(isMatch){
				req.session.user = user
				res.send({
					value: 1,
					tips: '登录成功!'
				})
			}else{
				res.send({
					value: 0,
					tips: '账号或密码错误!'
				})
				return
			}
		})
	})
}
//用户登出
exports.UserLogout = function(req, res){
	delete req.session.user
	res.redirect('/home')
}
//用户创建(注册+登录)
exports.UserCreateRender = function(req, res){
	res.render('user_create')
}
exports.UserCreatePost = function(req, res){
	var form = new multiparty.Form()
	var _user = new User()
	var this_path = "./uploads/users/"+ _user.id

	fs.exists(this_path, function(exists){
		if(exists){
			console.log(_user + '用户曾经存在')
		}else{
			fs.mkdirSync(this_path)
			UserCreate()
		}
	})

	function UserCreate(){
		form.uploadDir = this_path
		form.parse(req, function(err, fields, files){
			if(err) return console.log('form.parse:  '+ err)

			_user.username = fields.username[0]
			_user.password = fields.password[0]

			if(_user.username == '' || _user.password == ''){
				return console.log('帐号或密码为空')
			}

			async.waterfall([
				function(cb){
					User.findByName(_user.username, function(err, user){
						if(err) return console.log('findByName: '+ err)
						if(user){
							res.render('user_create')
						}else{
							cb()
						}
					})
				},
				function(cb){
					if(files.head_photo[0].originalFilename){
						_user.head_photo = '/' + files.head_photo[0].path
					}
					_user.save(function(err, user){
						if(err){
							console.log('save: '+ err)
						}
						cb(null, user)
					})
				}
			],function(err, _user){
				if(err) return console.log('waterfall: '+ err)

				User.findByName(_user.username ,function(err, user){
					if(err) console.log('findByName:  '+ err)
					req.session.user = user
					res.redirect('/user/index')	
				})
			})
		})
	}
}
//用户信息修改
exports.UserUpdateRender = function(req, res){
	var _user = req.session.user
	res.render('user_update')
}
exports.UserUpdatePost = function(req, res){
	res.redirect('/user/index')
}
//用户首页
exports.UserIndexRender = function(req, res){
	res.render('user_index')
}
//用户-作品
exports.UserWorkRender = function(req, res){

	async.waterfall([
		function(cb){
			Work.findByUserId(req.session.user._id, function(err, works){
				if(err) return console.log(err)
				var _works = works
				for(var i = 0; i< works.length; i++){
					_works[i].url = '/work/' + _works[i]._id,
					_works[i].updateAt = moment(works[i].meta.updateAt).format('YYYY年MM月DD日')
				}
				cb(null, _works)
			})
		}
		// function(_works, cb){
		// 	var likes = []
		// 	async.each(_works, function(work){
		// 		UserLike.findByWorkId(work._id, function(err, like_works){
		// 			if(err) return console.log('WorkNewData.findByWorkId: '+ err)
		// 			likes[i] = like_works.length

		// 		})
		// 	})
		// 	cb(null, _works)
		// }
		],function(err, _works){
		res.render('user_work', {
			title: '我的作品',
			worksList: _works
		})
	})
}
//用户-点赞
exports.UserLikeRender = function(req, res){
	res.render('work_list')
}
exports.UserLikeData = function(req, res){
	async.waterfall([
		function(cb){
			UserLike.findByUserId(req.session.user._id, function(err, likes){
				if(err) return console.log('WorkNewData.findByWorkId: '+ err)
				if(likes == ''){
					res.send({
						value: 0
					})
					return
				}
				var likesList = likes[0].like
				cb(null, likesList)
			})
		},
		function(likesList, cb){
			var _works = []
			var i = 0
			async.each(likesList, function(userLike){

				async.waterfall([
					function(cb){
						Work.findById(userLike._id, function(err, work){
							if(err) return console.log('UserLikeData.Work.findById: '+ err)
							cb(null, work)
						})
					},
					function(work, cb){
						User.findById(work.from, function(err, user){
							if(err) return console.log('UserLikeData.User.findById: '+ err)
							cb(null, work, user)
						})
					},
					function(work, user, cb){
						UserLike.findByWorkId(work._id, function(err, like_works){
							if(err) return console.log('WorkNewData.UserLike.findByWorkId: '+ err)
							var likes_len = like_works.length
							cb(null, work, user, likes_len)
						})
					},
					function(work, user, likes_len, cb){
						UserCollect.findByWorkId(work._id, function(err, collect_works){
							if(err) return console.log('WorkNewData.UserCollect.findByWorkId: '+ err)
							var collects_len = collect_works.length
							cb(null, work, user, likes_len, collects_len)
						})
					}
				],function(err, work, user, likes_len, collects_len){
					if(err) console.log(err)
					_works[i] = {
						url: '/work/' + work._id,
						from: user.username,
						from_photo: user.head_photo,
						title: work.title,
						type: work.type,
						titleImage: work.titleImage,
						watch: work.watch,
						like: likes_len,
						collect: collects_len,
						meta:{
							createAt: moment(work.meta.createAt).format('YYYY年MM月DD日'),
							updateAt: moment(work.meta.updateAt).format('YYYY年MM月DD日')
						}
					}
					if(i == likesList.length -1){
						cb(null, _works)
					}
					i++
				})
			})
		},
	],function(err, _works){
		if(err) console.log(err)
		res.send({
			value: 1,
			worksList: _works
		})
	})
}
//用户-收藏
exports.UserCollectRender = function(req, res){
	res.render('work_list')
}
exports.UserCollectData = function(req, res){
	async.waterfall([
		function(cb){
			UserCollect.findByUserId(req.session.user._id, function(err, collects){
				if(err) return console.log('WorkNewData.findByWorkId: '+ err)
				if(collects == ''){
					res.send({
						value: 0
					})
					return
				}
				var collectsList = collects[0].collect
				cb(null, collectsList)
			})
		},
		function(collectsList, cb){
			var _works = []
			var i = 0
			async.each(collectsList, function(userCollect){

				async.waterfall([
					function(cb){
						Work.findById(userCollect._id, function(err, work){
							if(err) return console.log('UserCollectData.Work.findById: '+ err)
							cb(null, work)
						})
					},
					function(work, cb){
						User.findById(work.from, function(err, user){
							if(err) return console.log('UserCollectData.User.findById: '+ err)
							cb(null, work, user)
						})
					},
					function(work, user, cb){
						UserLike.findByWorkId(work._id, function(err, like_works){
							if(err) return console.log('WorkNewData.UserCollect.findByWorkId: '+ err)
							var likes_len = like_works.length
							cb(null, work, user, likes_len)
						})
					},
					function(work, user, likes_len, cb){
						UserCollect.findByWorkId(work._id, function(err, collect_works){
							if(err) return console.log('WorkNewData.CollectCollect.findByWorkId: '+ err)
							var collects_len = collect_works.length
							cb(null, work, user, likes_len, collects_len)
						})
					}
				],function(err, work, user, likes_len, collects_len){
					if(err) console.log(err)
					_works[i] = {
						url: '/work/' + work._id,
						from: user.username,
						from_photo: user.head_photo,
						title: work.title,
						type: work.type,
						titleImage: work.titleImage,
						watch: work.watch,
						like: likes_len,
						collect: collects_len,
						meta:{
							createAt: moment(work.meta.createAt).format('YYYY年MM月DD日'),
							updateAt: moment(work.meta.updateAt).format('YYYY年MM月DD日')
						}
					}
					if(i == collectsList.length -1){
						cb(null, _works)
					}
					i++
				})
			})
		},
	],function(err, _works){
		if(err) console.log(err)
		res.send({
			value: 1,
			worksList: _works
		})
	})
}
//用户-设置
exports.UserSettingRender = function(req, res){
	res.render('user_setting')
}
//检测是否关注
exports.UserCheckFollower = function(req, res){
	var _userID = req.session.user._id
	var _followerID = req.params.id

	if(_followerID == 'undefined' || _followerID == _userID){
		return res.send({value: 2})
	}

	Follower.findOneById(_followerID, _userID, function(err, is_follow){
		if(is_follow){
			return res.send({value: 1})
		}else{
			return res.send({value: 0})
		}
	})
}
//添加关注
exports.UserAddFollower = function(req, res){
	var _userID = req.session.user._id
	var _followerID = req.params.id

	if(_followerID == 'undefined' || _followerID == _userID){
		res.send({
			value: 0,
			tips: '关注失败!'
		})
		return 
	}

	var _follower = new Follower()

	_follower.fromID = _followerID
	_follower.toID = _userID

	_follower.save(function(err){
		if(err){
			console.log('UserAddFollower.err: '+ err)
			res.send({
				value: 0,
				tips: '关注失败!'
			})
		}
		res.send({
			value: 1,
			tips: '关注成功!'
		})
	})
}
//取消关注
exports.UserRemoveFollower = function(req, res){
	var _userID = req.session.user._id
	var _followerID = req.params.id

	Follower.remove({fromID: _followerID, toID: _userID},function(err){
		if(err) return console.log('remove.follower.remove.err: '+ err)
		res.send({
			value: 1
		})	
	})
}
//删除粉丝
exports.UserRemoveFans = function(req, res){
	var _userID = req.session.user._id
	var fansID = req.params.id

	Follower.remove({fromID: _userID, toID: fansID},function(err){
		if(err) return console.log('remove.follower.remove.err: '+ err)
		res.send({
			value: 1
		})	
	})
}
//关注列表
exports.UserFollowerRender = function(req, res){
	res.render('list')
}
exports.UserFollowerData = function(req, res){
	var _userID = req.session.user._id

	async.waterfall([
		function(cb){
			Follower.findFollwerById(_userID, function(err, followers){
				if(err) return console.log('UserFollowerRender.findFollwerById.err: '+ err)
				cb(null, followers)
			})
		},
		function(followers, cb){
			var _user = []
			async.forEachOfSeries(followers, function(follower, i, each_next){
				User.findById(follower.fromID, function(err, user){
					if(err) return console.log('UserFollowerRender.User.findById.err: '+ err)
					_user[i] = {
						_id: user._id,
						username: user.username,
						head_photo: user.head_photo,
						job: user.job
					}

					if(i == followers.length -1){
						cb(null, _user)
					}
					each_next()
				})
			})
		}
	],function(err, _user){
		if(err) return console.log('UserFollowerRender.waterfall.err: '+ err)
		res.send({
			value: 1,
			lists: _user
		})
	})
}
//关注列表
exports.UserFansRender = function(req, res){
	res.render('list')
}
exports.UserFansData = function(req, res){
	var _userID = req.session.user._id

	async.waterfall([
		function(cb){
			Follower.findFansById(_userID, function(err, fans){
				if(err) return console.log('UserFansData.findFansById.err: '+ err)
				cb(null, fans)
			})
		},
		function(fans, cb){
			var _user = []
			async.forEachOfSeries(fans, function(fan, i, each_next){
				User.findById(fan.toID, function(err, user){
					if(err) return console.log('UserFansData.User.findById.err: '+ err)
					_user[i] = {
						_id: user._id,
						username: user.username,
						head_photo: user.head_photo,
						job: user.job
					}

					if(i == fans.length -1){
						cb(null, _user)
					}
					each_next()
				})
			})
		}
	],function(err, _user){
		if(err) return console.log('UserFansData.waterfall.err: '+ err)
		res.send({
			value: 1,
			lists: _user
		})
	})
}
//获取用户信息
exports.CheckIsLogin = function(req, res){
	var _user = req.session.user
	if(_user){
		res.send({
			value: 1,
			username: _user.username,
			head_photo: _user.head_photo,
			sex: _user.sex,
			address: _user.address,
			job: _user.job,
			sign: _user.sign,
			introduce: _user.introduce
		})
	}else{
		res.send({
			value: 0
		})
	}
}
//检查是否存在
exports.CheckIsCreate = function(req, res){
	var _user = req.body.user
	User.findByName(_user.username, function(err, user){
		if(user){
			res.send({
				value: 1,
				tips: '用户已注册!'
			})
		}else{
			res.send({
				value: 0,
				tips: '用户未注册!'
			})
		}
	})
}
//登录访问权限
exports.UserLoginRequired = function(req, res, next){
	var _user = req.session.user

	if(!_user){
		return res.redirect('/user/login')
	}
	next()
}
//登录后访问限制
exports.UserIsLoginBanRequired = function(req, res, next){
	var _user = req.session.user

	if(!_user){
		next()
	}else{
		return res.redirect('/home')
	}
}

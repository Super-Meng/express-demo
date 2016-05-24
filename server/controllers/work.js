var async = require('async')
//上传插件
var multiparty = require('multiparty')
//日期插件
var moment = require('moment')
//文件管理插件
var fs= require("fs")

var Work = require('../models/work')
var User = require('../models/user')
var UserLike = require('../models/user_like')
var UserCollect = require('../models/user_collect')
var Comment = require('../models/comment')

//添加作品
exports.WorkAddRender = function(req, res){
	res.render('user_work_add', {
		title: '添加作品',
		postURL: '/user/work/add'
	})
}
exports.WorkAddPost = function(req, res){
	var user = req.session.user
	var form = new multiparty.Form()
	var _work = new Work()
	var this_path = "./uploads/works/"+ _work._id

	fs.exists(this_path, function(exists){
		if(exists){
			uploads()
		}else{
			fs.mkdir(this_path,function(err){
				if(err) return console.log(err)
				uploads()
			})
		}
	})
	
	function uploads(){
		form.uploadDir = this_path
		//form.maxFilesSize = 10 * 1024 * 1024  //文件大小限制10M

		form.parse(req, function(err, fields, files) {
			if(err) return console.log(err)
			// Object.keys(fields).forEach(function(name) {
			// 	console.log('got field named ' + name)
			// });
			// console.log(fields)
			// Object.keys(files).forEach(function(name) {
			// 	console.log('got file named ' + name)
			// });
			//console.log('Upload completed!');
			_work.from = user._id
			_work.title = fields.title[0]
			_work.type = fields.type[0]
			_work.titleImage = '/' + files.titleImage[0].path
			_work.main = fields.main[0]

			for(var i = 0; i<fields.text.length;i++){
				_work.content[i] = {
					imagePath: '/' + files.imagePath[i].path,
					text: fields.text[i]
				}
			}
			
			_work.save(function(err, work){
				if(err) return console.log(err)
			})

			res.redirect('/user/work')
		})
	}
}
//显示最新作品列表
exports.WorkNewRender = function(req, res){
	res.render('work_list')
}
exports.WorkNewData = function(req, res){
	async.waterfall([
		function(cb){
			Work.findDataStart( 0, 10, function(err, works){
				if(err) return console.log(err)
				cb(null, works)
			})
		},
		function(works, next){
			var _works = []
			
			async.forEachOfSeries(works, function(work, i,eachNext){
				async.parallel({
					likes_len: function(cb){
						UserLike.findByWorkId(work._id, function(err, like_works){
						if(err) return console.log('WorkNewData.UserLike: '+ err)
							var likes_len = like_works.length
							cb(null, likes_len)
						})
					},
					collects_len: function(cb){
						UserCollect.findByWorkId(work._id, function(err, collect_works){
						if(err) return console.log('WorkNewData.UserCollect: '+ err)
							var collects_len = collect_works.length
							cb(null, collects_len)
						})
					},
					user: function(cb){
						User.findById(work.from, function(err, user){
							if(err) return console.log(err)
							cb(null, user)
						})
					},
				},function(err, data){
					if(err) console.log(err)
					_works[i] = {
						url: '/work/' + work._id,
						from: data.user.username,
						from_photo: data.user.head_photo,
						title: work.title,
						type: work.type,
						titleImage: work.titleImage,
						watch: work.watch,
						like: data.likes_len,
						collect: data.collects_len,
						meta:{
							createAt: moment(work.meta.createAt).format('YYYY年MM月DD日'),
							updateAt: moment(work.meta.updateAt).format('YYYY年MM月DD日')
						}
					}
					if(i == works.length -1){
						next(null, _works)
					}
					eachNext()
				})
			})
		}
	],function(err, _works){
		if(err) console.log(err)
		res.send({
			value: 1,
			worksList: _works
		})
	})
}
//作品展示页
exports.WorkIndexRender = function(req, res){
	res.render('work')
}
exports.WorkIndexData = function(req, res){

	async.waterfall([
	    function(cb){
			Work.findById(req.params.id, function(err, _work){
				if(err) return console.log('WorkIndexRender.Work.findById: '+ err)
				Work.update({_id: _work._id}, {$inc: {watch: 1}}, function(err){
					if(err) console.log('WorkIndexRender.update.err: '+ err)
				})
				cb(null, _work)
			})
	    },
	    function(work ,cb){
			User.findById(work.from, function(err, user){
				if(err) return console.log('WorkIndexRender.User.findById: '+ err)
				cb(null, user, work)
			})
	    },
		function(user, work, cb){
			UserLike.findByWorkId(work._id, function(err, likes_works){
				if(err) return console.log('WorkNewData.findByWorkId: '+ err)
				var likes_len = likes_works.length
				cb(null, user, work, likes_len)
			})
		},
		function(user, work, likes_len, cb){
			UserCollect.findByWorkId(work._id, function(err, collect_works){
				if(err) return console.log('WorkNewData.findByWorkId: '+ err)
				var collects_len = collect_works.length
				cb(null, user, work, likes_len, collects_len)
			})
		}
	], function (err, from_user, _work, likes_len, collects_len) {
	    if(err) return console.log('WorkIndexRender.waterfall: ' + err)

		res.send({
			from_user_id: from_user._id,
			from_user_name:  from_user.username,
			from_user_head_photo:  from_user.head_photo,
			work: _work,
			likes: likes_len,
			collects: collects_len
		})
	})
}
//获取作品点赞列表
exports.WorkLikeListRender = function(req, res){
	res.render('list')
}
exports.WorkLikeListData = function(req, res){
	var _workID = req.params.id

	async.waterfall([
		function(cb){
			UserLike.findLikeList(_workID , function(err, data){
				if(err) return console.log('WorkLikeListData.findLikeList: '+ err)
				cb(null, data)
			})
		},
		function(data, cb){
			var _user_like = {}

			async.forEachOfSeries(data, function(like, i, eachNext){
				User.findById(like._id, function(err, user){

					var createTime = moment(like.like[0].createAt).locale('zh-cn').startOf('second').fromNow()
					_user_like[i] = {
						username: user.username,
						head_photo: user.head_photo,
						job: user.job,
						createAt: createTime
					}
					if(i == data.length -1){
						cb(null, _user_like)
					}
					eachNext()
				})
			})
		}
	], function (err, _user_like){
	    if(err){
	    	res.send({value: 0})
	    	return console.log('like_list_data: ' + err)
	    }
		res.send({
			value: 1,
			lists: _user_like
		})
	})
}
//获取作品评论列表
exports.WorkCommentListRender = function(req, res){
	res.render('list')
}
exports.WorkCommentListData = function(req, res){
	var _workID = req.params.id
	// var res_start = parseInt(req.params.start)
	// var res_num = parseInt(req.params.number)

	async.waterfall([
		function(cb){
			Comment.findByWorkId(_workID, function(err, _comments){
				if(err) return console.log('Comment.findByWorkId: '+ err)
				cb(null, _comments)
			})
		},
		function(_comments, cb){
			var CommentList = []
			if(_comments == '') return cb(null, _comments)
				
			async.forEachOfSeries(_comments, function(_comment, i, eachNext){
				User.findById(_comment.fromID, function(err,_user){
					var createTime = moment(_comment.meta.createAt).locale('zh-cn').startOf('second').fromNow()
					
					switch(_comment.state){
						case 0:
							CommentList[i] = {
								state: 0
							}
							if(i == _comments.length -1){
								cb(null, CommentList)
							}
							eachNext()
						break
						case 1:
							CommentList[i] = {
								state: 1,
								_id: _comment._id,
								username: _user.username,
								head_photo: _user.head_photo,
								content: _comment.content,
								createAt: createTime
							}
							if(i == _comments.length -1){
								cb(null, CommentList)
							}
							eachNext()
						break
						case 2:
							Comment.findOneById(_comment.toID, function(err, from_comment){
								if(err) return console.log('Comment.findOneById: '+ err)
								User.findById(from_comment.fromID, function(err,from_user){
									if(err) return console.log('Comment.User.findById: '+ err)
									CommentList[i] = {
										state: 2,
										_id: _comment._id,
										username: _user.username,
										head_photo: _user.head_photo,
										content: _comment.content,
										createAt: createTime,
										from_user: from_user.username,
										from_content: from_comment.content,
										from_state: from_comment.state
									}
									if(i == _comments.length -1){
										cb(null, CommentList)
									}
									eachNext()
								})
							})
						break
					}
				})
			})
		},
		function(CommentList, cb){
			Comment.CountByWorkId(_workID, function(err, count){
				if(err) return console.log('Comment.CountByWorkId: '+ err)
				cb(null, CommentList, count)
			})
		},
	], function (err, CommentList, count){
	    if(err){
	    	res.send({value: 0})
	    	return console.log('CommentList: ' + err)
	    }
		res.send({
			value: 1,
			comment: CommentList,
			workID: _workID,
			count: count
		})
	})
}
//添加评论
exports.WorkAddComment = function(req, res){
	var _workID = req.params.id
	var _fromCommentID = req.params.from
	var _content = req.body.content
	var _user = req.session.user
	var _comment = new Comment()

	_comment.workID = _workID
	_comment.fromID = _user._id
	_comment.content = _content

	if(_fromCommentID){
		_comment.state = 2
		_comment.toID = _fromCommentID
	}else{
		_comment.state = 1
	}

	_comment.save(function(err, work){
		if(err){
			console.log(err)
			res.send({
				value: 0,
				tips: '评论失败!'
			})
			return
		}
		res.send({
			value: 1,
			tips: '评论成功!',
			comment: {
				_id: _user._id,
				head_photo: _user.head_photo,
				username: _user.username,
				content: _content,
				createAt: '几秒前'
			}
		})
	})
}
//检测是否已经点赞
exports.WorkIsLike = function(req, res){
	var _userID = req.session.user._id
	var _workID = req.params.id

	async.waterfall([
		function(cb){
			UserLike.findByUserId(_userID, function(err, likes){
				if(err) return console.log('UserLike.findByUserId: '+ err)
				cb(null, likes)
			})
	    },
	    function(like_list, cb){
	    	var val = 0
	    	if(like_list == ''){
	    		cb(null, val)
	    	}else{
				async.each(like_list[0].like, function(like){
					if(like._id == _workID){
						val = 1
						cb(null, val)
					}
				})
	    	}
	    }
	], function (err, val){
	    if(err){
	    	res.send({value: 0})
	    	return console.log('user_like.add: ' + err)
	    }
		res.send({
			value: val
		})
	})
}
//作品点赞
exports.WorkAddLike = function(req, res){
	var _userID = req.session.user._id
	var _workID = req.params.id
	var _user_like = new UserLike()

	_user_like._id = _userID

	async.waterfall([
	    function(cb){
			UserLike.findByUserId(_userID, function(err, user_like){
				if(err) return console.log('UserLike.findByUserId: '+ err)

				if(user_like == ''){
					_user_like.like = [{
						_id: _workID,
						createAt: Date.now()
					}]
					_user_like.save(function(err){
						if(err){
							console.log('user_like.save: '+ err)
							cb(null, 0)
						}
						cb(null, 1)
					})
				}else{
					UserLike.find({_id:_userID, like: {$elemMatch: {_id: _workID}} }, function(err, is_exist){
						if(err) console.log('WorkIndexRender.update.err: '+ err)
						if(is_exist != ''){
							cb(null, 0)
						}
						UserLike.update({_id:_userID}, {$push: {like: {_id: _workID} }}, function(err){
							if(err) console.log('WorkIndexRender.update.err: '+ err)
							cb(null, 1)
						})
					})
				}
			})
	    }
	], function (err, val) {
	    if(err){
	    	res.send({
				value: 0
			})
	    	return console.log('user_like.add: ' + err)
	    }
		res.send({
			value: val
		})
	})
}
//检测是否已经收藏
exports.WorkIsCollect = function(req, res){
	var _userID = req.session.user._id
	var _workID = req.params.id

	async.waterfall([
		function(cb){
			UserCollect.findByUserId(_userID, function(err, collects){
				if(err) return console.log('UserCollect.findByUserId: '+ err)
				cb(null, collects)
			})
	    },
	    function(collect_list, cb){
	    	var value = 0
	    	if(collect_list == ''){
	    		cb(null, value)
	    	}else{
				async.each(collect_list[0].collect, function(collect){
					if(collect._id == _workID){
						value = 1
						cb(null, value)
					}
				})
	    	}
	    }
	], function (err, value){
	    if(err){
	    	res.send({value: 0})
	    	return console.log('user_collect.add: ' + err)
	    }
		res.send({
			value: value
		})
	})
}
//作品收藏
exports.WorkAddCollect = function(req, res){
	var _userID = req.session.user._id
	var _workID = req.params.id
	var _user_collect = new UserCollect()

	_user_collect._id = _userID

	async.waterfall([
	    function(cb){
			UserCollect.findByUserId(_userID, function(err, user_collect){
				if(err) return console.log('UserCollect.findByUserId: '+ err)

				if(user_collect == ''){
					_user_collect.collect = [{
						_id: _workID,
						createAt: Date.now()
					}]
					_user_collect.save(function(err){
						if(err) return console.log('user_collect.save: '+ err)
					})
				}else{
					UserCollect.find({_id:_userID, like: {$elemMatch: {_id: _workID}} }, function(err, is_exist){
						if(err) console.log('WorkAddCollect.update.err: '+ err)
						if(is_exist != ''){
							cb(null, 0)
						}
						UserCollect.update({_id:_userID}, {$push: {collect: {_id: _workID} }}, function(err){
							if(err) console.log('WorkAddCollect.update.err: '+ err)
							cb(null, 1)
						})
					})
				}
			})
	    }
	], function (err, val) {
	    if(err){
	    	res.send({
				value: 0
			})
	    	return console.log('user_collect.add: ' + err)
	    }
		res.send({
			value: val
		})
	})
}
//取消收藏
exports.WorkRemoveCollect = function(req, res){
	var _userID = req.session.user._id
	var _workID = req.params.id

	async.waterfall([
	    function(cb){
			UserCollect.update({_id:_userID}, {$pull: {collect: {_id: _workID}}}, function(err){
				if(err) console.log('WorkRemoveCollect.update.err: '+ err)
			})
			cb()
	    }
	], function (err) {
	    if(err){
	    	res.send({
				value: 0
			})
	    	return console.log('WorkRemoveCollect: ' + err)
	    }
		res.send({
			value: 1
		})
	})
}

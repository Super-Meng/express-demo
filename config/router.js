//替换工具
//var _ = require('underscore')

var Manager = require('../server/controllers/manager')
var User = require('../server/controllers/user')
var Work = require('../server/controllers/work')

module.exports = function (app){
	//pre handle user 
	app.use(function (req, res, next) {
		var _user = req.session.user
		if(_user){
			app.locals.user = _user
		}
		next()
	})

	//框架
	app.route('/')
		.get(function(req, res){
			res.render('index')
		})
	//百度站长
	app.route('/baidu_verify_2NZoYqQCQZ.html')
		.get(function(req, res){
			res.sendfile('baidu_verify_2NZoYqQCQZ.html')
		})
	//首页
	app.route('/home')
		.get(function(req, res){
			res.render('home')
		})
	//最新作品
	app.route('/news')
		.get(Work.WorkNewRender)
	app.route('/data/news')
		.get(Work.WorkNewData)
	//团队
	app.route('/teams')
		.get(function(req, res){
			res.render('teams')
		})
	//联系我们
	app.route('/contact')
		.get(function(req, res){
			res.render('contact')
		})

	//作品展示
	app.route('/work/:id')
		.get(Work.WorkIndexRender)
	app.route('/data/work/:id')
		.get(Work.WorkIndexData)
	//作品点赞用户列表
	app.route('/work/:id/like_list')
		.get(Work.WorkLikeListRender)
	app.route('/data/work/:id/like_list')
		.get(Work.WorkLikeListData)
	//作品评论列表
	app.route('/work/:id/comment_list')
		.get(Work.WorkCommentListRender)
	app.route('/data/work/:id/comment_list')
		.get(Work.WorkCommentListData)
	//评论作品
	app.route('/work/:id/add_comment')
		.post(User.UserLoginRequired, Work.WorkAddComment)
	app.route('/work/:id/add_comment/:from')
		.post(User.UserLoginRequired, Work.WorkAddComment)
	//是否已经点赞
	app.route('/work/:id/is_like')
		.get(User.UserLoginRequired, Work.WorkIsLike)
	//作品点赞
	app.route('/work/:id/add_like')
		.get(User.UserLoginRequired, Work.WorkAddLike)
	//是否已经收藏
	app.route('/work/:id/is_collect')
		.get(User.UserLoginRequired, Work.WorkIsCollect)
	//作品收藏
	app.route('/work/:id/add_collect')
		.get(User.UserLoginRequired, Work.WorkAddCollect)
	//取消收藏
	app.route('/work/:id/remove_collect')
		.get(User.UserLoginRequired, Work.WorkRemoveCollect)



	//检查是否登录获取用户信息
	app.route('/check/userIsLogin')
		.get(User.CheckIsLogin)
	//检查用户是否创建
	app.route('/check/userIsCreate')
		.post(User.CheckIsCreate)
	//用户登录
	app.route('/user/login')
		.get(User.UserIsLoginBanRequired, User.UserLoginRender)
		.post(User.UserIsLoginBanRequired, User.UserLoginPost)
	//用户登出
	app.route('/user/logout')
		.get(User.UserLoginRequired, User.UserLogout)
	//用户注册
	app.route('/user/create')
		.get(User.UserIsLoginBanRequired, User.UserCreateRender)
		.post(User.UserIsLoginBanRequired, User.UserCreatePost)
	//用户信息修改
	app.route('/user/update')
		.get(User.UserLoginRequired, User.UserUpdateRender)
		.post(User.UserLoginRequired, User.UserUpdatePost)
	//添加作品
	app.route('/user/work/add')
		.get(User.UserLoginRequired, Work.WorkAddRender)
		.post(User.UserLoginRequired, Work.WorkAddPost)
	//用户页面
	app.route('/user/index')
		.get(User.UserLoginRequired, User.UserIndexRender)
	//用户页面-作品
	app.route('/user/work')
		.get(User.UserLoginRequired, User.UserWorkRender)
	//用户页面-点赞
	app.route('/user/like')
		.get(User.UserLoginRequired, User.UserLikeRender)
	app.route('/data/user/like')
		.get(User.UserLoginRequired, User.UserLikeData)
	//用户页面-收藏
	app.route('/user/collect')
		.get(User.UserLoginRequired, User.UserCollectRender)
	app.route('/data/user/collect')
		.get(User.UserLoginRequired, User.UserCollectData)
	//用户页面-设置
	app.route('/user/setting')
		.get(User.UserLoginRequired, User.UserSettingRender)
	//检测是否关注
	app.route('/user/check_follower/:id')
		.get(User.UserLoginRequired, User.UserCheckFollower)
	//添加关注
	app.route('/user/add_follower/:id')
		.get(User.UserLoginRequired, User.UserAddFollower)
	//取消关注
	app.route('/user/remove_follower/:id')
		.get(User.UserLoginRequired, User.UserRemoveFollower)
	//关注列表
	app.route('/user/follower')
		.get(User.UserLoginRequired, User.UserFollowerRender)
	app.route('/data/user/follower')
		.get(User.UserLoginRequired, User.UserFollowerData)
	//粉丝列表
	app.route('/user/fans')
		.get(User.UserLoginRequired, User.UserFansRender)
	app.route('/data/user/fans')
		.get(User.UserLoginRequired, User.UserFansData)
	//取消关注
	app.route('/user/remove_fans/:id')
		.get(User.UserLoginRequired, User.UserRemoveFans)



	//后台登录
	app.route('/manager/login')
		.get(Manager.ManagerLoginRender)
		.post(Manager.ManagerLoginPost)
	//后台登出
	app.route('/manager/logout')
		.get(Manager.ManagerLoginRequired, Manager.ManagerLogout)
	//管理员创建
	app.route('/manager/create')
		.get(Manager.ManagerLoginRequired, Manager.ManagerCreateRender)
		.post(Manager.ManagerLoginRequired, Manager.ManagerCreatePost)


	app.route('/index1')
		.get(function(req, res){
			if(req.headers['x-pjax']){
				res.render('index1' + '_pjax')
			}else{
				res.render('index1')
			}
		})
	app.route('/index2')
	.get(function(req, res){
		res.render('index2')
	})

	//非定义路由跳转首页
	app.route('*')
		.get(function(req, res){
			res.redirect('/')
		})
}

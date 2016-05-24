var Manager = require('../models/manager')

//后台登录
exports.ManagerLoginRender = function(req, res){
	res.render('admin_login', {
		title: 'Flora Cc 后台管理',
		postURL: '/manager/login'
	})
}
exports.ManagerLoginPost = function(req, res){
	var managerObj = req.body.manager
	var _manager = new Manager({
		username: managerObj.username,
		password: managerObj.password
	})
	Manager.findByName(_manager.username ,function(err, manager){
		if(err){
			console.log(err)
		}

		manager.comparePassword(_manager.password, function(err, isMatch) {
			if(err) return console.log(err)

			if(isMatch){
				req.session.manager = manager
				res.redirect('/manager/login_success')
			}else{
				res.redirect('/manager/login_false')
			}
		})
	})
}
//后台登出
exports.ManagerLogout = function(req, res){
	delete req.session.manager
	delete req.locals.manager
	res.redirect('/manager/login')
}
//管理员创建
exports.ManagerCreateRender = function(req, res){
	res.render('admin_manager_create', {
		title: 'Flora Cc 创建管理员',
		postURL: '/manager/create'
	})
}
exports.ManagerCreatePost = function(req, res){
	var managerObj = req.body.manager
	var _manager = new Manager({
		username: managerObj.username,
		password: managerObj.password,
		level: managerObj.level
	})
	Manager.findByName(_manager.username, function(err, manager){
		if(err) return console.log(err)

		if(manager){
			return console.log('err')
		}else{
			_manager.save(function(err, manager){
				if(err){
					console.log(err)
				}
			})
		}
	})
	res.redirect('/manager/create')
}
//登录访问权限
exports.ManagerLoginRequired = function(req, res, next){
	var _manager = req.session.manager

	if(!_manager){
		return res.redirect('/manager/login')
	}

	next()
}
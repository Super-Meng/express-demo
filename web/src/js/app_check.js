var app_check = function(){
	this.username = ''
	this.password = ''
}
app_check.prototype.check_username = function(){
	var Reg = /^\w{6,16}$/

	if(this.username == ''){
		app_tips_show('请输入帐号!', 'warning')
		return false
	}
	if(!Reg.test(this.username)){
		app_tips_show('帐号格式为6-16位数字或英文组合!', 'warning')
		return false
	}
	return true
}
app_check.prototype.check_password = function(){
	var Reg = /^\w{6,16}$/

	if(this.password == ''){
		app_tips_show('请输入密码!', 'warning')
		return false
	}
	if(!Reg.test(this.password)){
		app_tips_show('密码格式为6-16位数字或英文组合!', 'warning')
		return false
	}
	return true
}
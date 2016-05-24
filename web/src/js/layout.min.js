$(function(){
	FastClick.attach(document.body)
	remLayout()
	$(window).resize(function(){
		remLayout()
	})
	$(window).load(function(){
		if($('.containter').length != 0){
			$('.containter').velocity({
				'opacity': 1
			},300)
		}
	})
})
//设置默认1rem = 100px
var remLayout = function(){
	var win_w = $(window).width()
	$('html').css('font-size', win_w/320*100)
	set_iframe_main_h()
	//web
	function set_iframe_main_h(){
		var win_h = $(window).height()
		var heeader_h = $('.app_header').height()
		$('#iframe_main').height(win_h - heeader_h)
		if($('.app_header').length == 0){
			$('.containter').height($(window).height())
		}
	}
}
//图片上传预览
var upload_image_change = function(btnClass, imgClass){
	var oFReader = new FileReader()
	var rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i

	oFReader.onload = function(e){
		$(imgClass).attr('src', e.target.result)
	}

	$(btnClass).on('change', function(){
		var btn = $(this)[0]
	  	var oFile = btn.files[0]
		if(btn.files.length === 0){
			return
		}
		if(!rFilter.test(oFile.type)){
	  		alert("必须选择小于750px的图像文件!")
	  		return
	  	}
	  	oFReader.readAsDataURL(oFile)
	})
}
//修改标题
var set_header_title = function(text){
	$('.app_header .title', window.parent.document).html(text)
}
//tab_menu显隐
var tab_menu_toggle = function(tapClass){
	var tab = $('.tab_menu')
	var hide_mask = 0
	$(tapClass).on('click.tab_menu_toggle', function(){
		if(hide_mask){
			clearTimeout(hide_mask)
		}
		tab.velocity({
			left: 0
		},300)
		$('.app_mask').show().velocity({
			'opacity': 0.3
		},300)
	})
	$('.app_mask').on('click', function(){
		tab.velocity({
			left: '-2.8rem'
		},300)
		$(this).velocity({
			'opacity': 0
		},300)
		hide_mask = setTimeout(function(){
			$('.app_mask').hide()
			var hide_mask = 0
		},300)
	})
}
var tab_hide = function(){
		$('.tab_menu').velocity({left: '-2.8rem'},300)
		$('.app_mask').velocity({'opacity': 0},300)
		setTimeout(function(){
			$('.app_mask').hide()
		},300)
}
//icon_menu
var icon_menu_toggle = function(){
	var i = 19
	var icon_menu = $('.app_header .icon_menu', window.parent.document)
	var icon_back = $('.app_header .icon_back', window.parent.document)
	
	if(icon_menu.is(":visible")){
		return
	}

	icon_menu.show()
	icon_back.hide()

	var icon_change = setInterval(function(){
		icon_menu.css({
			'background-position': -0.24*i +'rem 0.1rem'
		})
		i--
		if(i < 0){
			clearInterval(icon_change)
		}
	}, 1000/60)
}
//icon_back
var icon_back_toggle = function(){
	var i = 0
	var icon_menu = $('.app_header .icon_menu', window.parent.document)
	var icon_back = $('.app_header .icon_back', window.parent.document)
	var icon_change = setInterval(function(){
		icon_menu.css({
			'background-position': -0.24*i +'rem 0.1rem'
		})
		i++
		if(i == 19){
			clearInterval(icon_change)
			icon_menu.hide()
			icon_back.show()
		}
	}, 1000/60)
}
//登出后改变tab_menu
var reRender_logout = function(){
	$('.tab_menu .user_cover',window.parent.document).html('<a class="btn" href="javascript:" data-url="/user/login">登录</a><a class="btn" href="javascript:" data-url="/user/create">注册</a>')		
}
//登录后改变tab_menu	
var reRender_login = function(){
	$.ajax({
		url: '/check/userIsLogin',
		cache: false,
		success: function(data){
			if(data.value){
				var user_html = '<a class="head_photo fl" href="javascript:" data-url="/user/index" data-title="">'+
					'<img src="'+data.head_photo+'" width="100%"/>'+
					'</a>'+
				'<div class="user fl">'+
					'<div class="username">'+data.username+'</div>'+
					'<div class="user_job">'+data.job+'</div>'+
					'<div class="clear"></div>'+
				'</div>'
				$('.tab_menu .user_cover',window.parent.document).html(user_html)
			}
		}
	})
}
//app_tips
var app_tips_times = 0
var app_tips_show = function(tips_text, tips_type){
	this.success = '#00896c'
	this.warning = '#f9bf45'
	this.error = '#cc543a'

	var tips = $('.app_tips', window.parent.document)

	if(app_tips_times != 0){
		clearTimeout(app_tips_times)
		tips.stop().velocity("reverse").velocity({top: 0}, 500)
		app_tips_times = 0
	}else{
		tips.velocity({top: 0}, 500)
	}

	tips.html(tips_text)
	switch(tips_type){
		case 'success':
			tips.css({'background': this.success})
		break
		case 'warning':
			tips.css({'background': this.warning})
		break
		case 'error':
			tips.css({'background': this.error})
		break
	}
	
	app_tips_times = setTimeout(function(){
		tips.velocity({top: '-0.45rem'}, 500)
	},2000)
}
var app_tips_hide = function(){
	var tips = $('.app_tips', window.parent.document)
	clearTimeout(app_tips_times)
	tips.stop().velocity({top: '-0.45rem'}, 500)
}
//input_wrap
var input_wrap = function(){
	this.url = ''//ajax地址
	this.type = ''//input, textarea, list
	this.list_data = {}//list数组
	input_wrap.orientation = ''//弹出方向 right, bottom
}
input_wrap.prototype.create = function(){
	if($('.input_wrap').length == 0){
		$('body').append('<div class="input_wrap"><div class="input_box"><form method="POST", enctype="multipart/form-data"><div class="list_group"></div></form></div></div>')
	}else{
		$('.input_wrap .list_group').html('')
	}
	//防止重复绑定事件
	if($('.app_header .input_submit', window.parent.document).length != 0){
		$('.app_header .input_submit', window.parent.document).remove()
	}

	$('.app_header .icon_box', window.parent.document).append('<a class="fr input_submit" href="javascript:">确定</a>')

	$('.input_wrap .list_group').attr('action', this.url)

	switch(this.type){
		case 'input':
			$('.input_wrap .list_group').append('<input maxlength="120"/>')
		break
		case 'textarea':
			$('.input_wrap .list_group').append('<textarea maxlength="2000"/>')
		break
		case 'list':
			$.each(this.list_data, function(i, list_name){
				$('.input_wrap .list_group').append('<a class="list" href="javascript:">'+list_name+'</a>')
			})
		break
		default:
			$('.input_wrap .list_group').append('<input maxlength="120"/>')
		break
	}
}
input_wrap.prototype.show = function(){
	$('.input_wrap').show()
	$('.app_header .input_submit', window.parent.document).show()
	$('.app_header .input_submit', window.parent.document).velocity({opacity: 1},300)
	switch(this.orientation){
		case 'right':
			$('.input_wrap .input_box').css({
				'right': '-100%',
				'bottom': 0
			}).velocity({
				'right': 0
			},300)
		break
		case 'bottom':
			$('.input_wrap .input_box').css({
				'right': 0,
				'bottom': '-100%'
			}).velocity({
				'bottom': 0
			},300)
		break
		default:
			$('.input_wrap .input_box').css({
				'right': '-100%',
				'bottom': 0
			}).velocity({
				'right': 0
			},300)
		break
	}
	$('.app_header .icon_back', window.parent.document).attr('href', 'javascript:')
	$('.app_header .icon_back', window.parent.document).click(function(){
		input_wrap.hide()
	})
}
input_wrap.prototype.hide = function(){
	$('.app_header .input_submit', window.parent.document).velocity({opacity: 0},300)
	switch(this.orientation){
		case 'right':
			$('.input_wrap .input_box').css({
				'right': 0,
				'bottom': 0
			}).velocity({
				'right': '-100%'
			},300)
		break
		case 'bottom':
			$('.input_wrap .input_box').css({
				'right': 0,
				'bottom': 0
			}).velocity({
				'bottom': '-100%'
			},300)
		break
		default:
			$('.input_wrap .input_box').css({
				'right': 0,
				'bottom': 0
			}).velocity({
				'right': '-100%'
			},300)
		break
	}
	setTimeout(function(){
		$('.input_wrap').hide()
		$('.app_header .input_submit', window.parent.document).hide()
		$('.app_header .icon_back', window.parent.document).attr('href', 'javascript:window.history.go(-1)')
	},300)
}
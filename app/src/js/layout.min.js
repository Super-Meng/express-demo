$(function(){

	remLayout()
	$(window).resize(function(){
		remLayout()
	})
})
//设置默认1rem = 100px
var remLayout = function(){
	var win_w = $(window).width()
	$('html').css('font-size', win_w/320*100)
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
//tab_menu显隐
var tab_menu_toggle = function(tapClass){
	var parent = plus.webview.getLaunchWebview()
	var tab = plus.webview.getWebviewById('tab_menu')
	$(tapClass).on('tap', function(){
		tab_show()
	})
	parent.addEventListener('maskClick', function(){
		tab_hide()
	})
}
var tab_show = function(){
	var parent = plus.webview.getLaunchWebview()
	plus.webview.show('tab_menu', 'slide-in-left', 300)
	parent.setStyle({
		mask: 'rgba(0,0,0,0.3)'
	})
}
var tab_hide = function(){
	var parent = plus.webview.getLaunchWebview()
	plus.webview.hide('tab_menu', 'slide-out-left', 300)
	parent.setStyle({
		mask: 'none'
	})
}
//区分os和web的ajax地址
var ajax_render = function(url, fn){
	var app_url = ''
	var self = plus.webview.currentWebview()
	
	app_url = self.app_url
	fn(app_url + url)
}
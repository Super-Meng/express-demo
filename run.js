//配置node.js服务为windows服务，开机自启动
var shortcut = require('windows-shortcuts');
var fs=require("fs");
//windows下的开机启动
if(process.platform.match(/^win/)){
    //开机启动目录
    var startupMenu="";
    //APPDATA目录中有Roming的是win7,win8等同类系统开机目录
    if(/Roaming/.test(process.env.APPDATA)){
        startupMenu=process.env.APPDATA+"\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\";
    }else{
        //winXp等同类系统开机目录
        startupMenu=process.env.USERPROFILE+"\\「开始」菜单\\程序\\启动\\";
    }    //在目录下生成的快捷方式名称
    var startupTarget=startupMenu+"FloraServer.lnk"; /*注意更改*/
    //要复制快捷方式过去的源程序
    var sourcePrograme=__dirname+"\\run.bat"; /*注意更改*/
    //存在就删除,不存在就创建
    if(fs.existsSync(startupTarget)){
        fs.unlink(startupTarget,function(err){
            if(err){
                console.error("取消开机启动出错",err);
            }
   else
            {
                console.log("取消开机启动成功");
            } 
        })
    }else{
        shortcut.create(startupTarget,sourcePrograme,function(err){
            if(err){
                console.error("设置开机启动出错",err);
            }else{
                console.log("设置开机启动成功");
            }
        })
    }
}
target_building = '1'
target_floor = '1'
target_position = '01'
target_sex = '男'
token = '';

//停止别的autojs
engines.all().map((ScriptEngine) => {
    if (engines.myEngine().toString() !== ScriptEngine.toString()) {
      ScriptEngine.forceStop();
    }
});
  

current_dir=engines.myEngine().cwd();
now = new Date().getTime()
time_path = current_dir + '/tmp_time.txt'
if(files.exists(time_path)){
    prev_time = files.read(time_path)
}else{
    prev_time = now
    files.write(time_path, now.toString())
}
var diff=now - prev_time;
console.log(diff/1000);
if(diff/1000 > 5*60 || diff == 0){
    prev_msg = ''
    msg_path = current_dir + '/tmp.txt'
    if(files.exists(msg_path)){
        prev_msg = files.read(msg_path)
    }
    if(!device.isScreenOn()){
        device.wakeUp()
    }
    console.log(msg_path);
    device.keepScreenDim();
    launchApp("大白U帮");

    var detect_floors=new Array(1,2,3,4,5,6,7,8,9,10);
    Array.prototype.indexOf = function(val) {
        for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
        }
        return -1;
    };
    Array.prototype.remove = function(val) {
        var index = this.indexOf(val);
        if (index > -1) {
        this.splice(index, 1);
        }
    };
    detect_floors.remove(Number(target_floor))
    // 初始化截图
    images.requestScreenCapture(false)
    msg = '来自EZBath的消息：\n'
    while(true){
        var position=id("home_bathroom_location").findOne();
        sleep(1);
        if(position){
            break;
        }
    }
    if(className("android.widget.TextView").text("浴室").exists()){
        id("home_choice_bathroomlocation").findOne().click()
    }
    sleep(200)
    setScreenMetrics(1080, 1920);
    swipe(540,768,540,1800,600);
    sleep(200)
    while(true){
        if(id("home_bathroom_location").exists()){
            break;
        }
        sleep(1);
    }
    if(id("home_bathroom_location").exists()){
        if(!className("android.widget.TextView").text("浴室").exists()){
            id("home_choice_bathroomlocation").findOne().click()
        }
        id("choiceroom_listview").findOne().children().forEach(child => {
            var target = child.findOne(className("android.widget.TextView").text(target_building+"号楼"+target_floor+"层 ("+target_sex+") "));
            if(target){
                tc = target.parent().children();
                tc.forEach(child=>{
                    var status = child.findOne(id("com.zhuochi.hydream:id/filter_bathroom_ratio"))
                    if(status){
                        if(status.text()){
                            if(status.text()!=''){
                                toastLog(status.text())
                                var raw_status = status.text();
                                splited_status = raw_status.split('/');
                                on_total = Number(splited_status[0])
                                off_total = Number(splited_status[1])
                                console.log(on_total);
                                if(on_total < off_total){
                                    msg = msg + '当前'+target_floor+'层，'+'有'+(off_total - on_total).toString()+"人洗澡！\n"
                                }
                            }
                        }
                    }
                });
            }
       });
    }
    
    for (var i=0,len=detect_floors.length; i<len; i++){
    
        checking_full_name = target_building+"号楼"+detect_floors[i].toString()+"层 ("+target_sex+") ";
        if(!className("android.widget.TextView").text("浴室").exists()){
            id("home_choice_bathroomlocation").findOne().click()
        }
        id("choiceroom_listview").findOne().children().forEach(child => {
            var target = child.findOne(className("android.widget.TextView").text(checking_full_name));
            if(target){
                tc = target.parent().parent();
                console.log(tc);
                tc.click();
            }
        });
        while(true){
            tmp_tgt=id("tv_sort_tip").exists()
            if(tmp_tgt){
                break;
            }
        }
        id("home_list_gridview").findOne().children().forEach(child => {
            var target = child.findOne(id("bathroom_status").text(target_position));
            if(target){
                console.log(target.parent().parent().bounds());
                t_rect = target.parent().parent().bounds();
                t_x = Math.round((t_rect.left + t_rect.right)/2+20);
                t_y = Math.round((t_rect.top + t_rect.bottom)/2+20);
                console.log(t_x);
                console.log(t_y);
            }
        });
        //截图
        sleep(800)    
    
        var img = captureScreen();
        sleep(800)    
    
        //获取在点(100, 100)的颜色值
        var color = images.pixel(img, t_x, t_y);
        //显示该颜色值
        toastLog(colors.toString(color))
        if(colors.toString(color)=='#fffa5939'){
            msg = msg + checking_full_name+' '+ target_position +'号 有人洗澡！\n'
        };
    }
    
    if(msg!='来自EZBath的消息：\n' && msg!=prev_msg){
        var url = "https://xariapush.azurewebsites.net/**/";
        var res = http.post(url, {
            "title": "来自EZBath的附近洗澡提醒",
            "description": msg,
            "content": msg,
            "token":token,
        });
        var html = res.body.string();
        console.log(html);
        files.write(msg_path, msg)
    }
    now = new Date().getTime()
    files.write(time_path, now.toString())
    device.cancelKeepingAwake();
    home();
    engines.stopAll();
}

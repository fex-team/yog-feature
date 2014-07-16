var dk  =  require("../index.js");
var Features = require("../lib/features.js");
var assert = require("assert");
var config = {
	 "config_dir": __dirname +  "/config",
     "feature_dir" : __dirname +  "/feature_extend" 
};
//模拟的request对象
var req = {
	'headers' : {
		'cookie' : 'BAIDUID=93DCA8B25F1F793BA1D4F2B42CD1D879:FG=1',
		'x-forwarded-for' : '127.0.0.1'
	}
};
var res = {};
var dooKeeper = new dk.dooKeeper(config,req,res);

// new Date().Format("yyyy-MM-dd HH:mm:ss");  
Date.prototype.Format = function (fmt) { 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

//测试switch开关是否正常
describe('Feature switch', function(){

    it('should return true when value is on', function(){
         assert.equal(true, dooKeeper.getFlag('common:switch-on'));
    })

    it('should return true when value is off', function(){
         assert.equal(false, dooKeeper.getFlag('common:switch-off'));
    })

})

//测试date开关是否正常
describe('Feature date', function(){

	var now = new Date();
	var today = now.Format("yyyy-MM-dd hh:mm:ss");
	var preday = new Date(now.getTime() - 24*60*60*1000).Format("yyyy-MM-dd hh:mm:ss");  
	var nextday = new Date(now.getTime() + 24*60*60*1000).Format("yyyy-MM-dd hh:mm:ss");  


	dooKeeper['features']['date'] = {};
	
	//左边*表示任意小
	dooKeeper['features']['date']['date-1']  = {
		"type" : "date",
        "value" : "* | " + nextday,
        "desc" : "test date work or not"
	};

	//正常范围
	dooKeeper['features']['date']['date-2']  = {
		"type" : "date",
        "value" : preday + " | " + nextday,
        "desc" : "test date work or not"
	};

	//右边日期不正常
	dooKeeper['features']['date']['date-3']  = {
		"type" : "date",
        "value" : "* | " + preday,
        "desc" : "test date work or not"
	};

	//左边日期不正常
	dooKeeper['features']['date']['date-4']  = {
		"type" : "date",
        "value" : nextday +  " | *",
        "desc" : "test date work or not"
	};

	//右边配置无限大
	dooKeeper['features']['date']['date-5']  = {
		"type" : "date",
        "value" : preday +  " | *",
        "desc" : "test date work or not"
	};

	//错误配置
	dooKeeper['features']['date']['date-6']  = {
		"type" : "date",
        "value" : preday,
        "desc" : "test date work or not"
	};

    //配置为空
    dooKeeper['features']['date']['date-7']  = {
        "type" : "date",
        "desc" : "test date work or not"
    };

    it('date-1', function(){    
         assert.equal(true, dooKeeper.getFlag('date:date-1'));
    })

    it('date-2', function(){
         assert.equal(true, dooKeeper.getFlag('date:date-2'));
    })

    it('date-3', function(){
         assert.equal(false, dooKeeper.getFlag('date:date-3'));
    })

    it('date-4', function(){
         assert.equal(false, dooKeeper.getFlag('date:date-4'));
    })

    it('date-5', function(){
         assert.equal(true, dooKeeper.getFlag('date:date-5'));
    })

    it('date-6', function(){
         assert.equal(false, dooKeeper.getFlag('date:date-6'));
    })

    it('null',function(){
        assert.equal(false,dooKeeper.getFlag('date:date-7'));
    })

})


//测试percentage开关是否正常
describe('Feature percentage', function(){

    it('should return true when random is small', function(){    
         assert.equal(true, dooKeeper.getFlag('common:percentage-on'));
    })

    it('should return false when random is bigger', function(){
         assert.equal(false, dooKeeper.getFlag('common:percentage-off'));
    })

    it('should return false when random is null', function(){
        assert.equal(false, dooKeeper.getFlag('common:percentage-null'));
    })

    it('no cookie',function(){
        var req = {
            'headers' : {
                'x-forwarded-for' : '127.0.0.1'
            }
        };
        var res = {};
        var dooKeeper = new dk.dooKeeper(config,req,res);
        assert.equal(true,dooKeeper.getFlag('common:percentage-on'));
    })
})


//测试自定义IP开关是否正常
describe('custom Feature IP', function(){

    it('should return true when ip in conf', function(){    
         assert.equal(true, dooKeeper.getFlag('common:ip-on'));
    })

    it('should return true when ip not in conf', function(){    
         assert.equal(false, dooKeeper.getFlag('common:ip-off'));
    })

})

//测试配置
describe('config', function(){

    it('feature should be function ',function(){
        Features();
    })

    it('type is null',function(){
        assert.equal(false,dooKeeper.getFlag('common:type-null'));
    })

    it('no type', function(){    
         assert.equal(false, dooKeeper.getFlag('common:test'));
    })

    it('no feature', function(){    
         assert.equal(false, dooKeeper.getFlag('home:switch'));
    })

    it('wrong name', function(){    
         assert.equal(false, dooKeeper.getFlag('test'));
    })

    var config2 = {
		 "config_dir": __dirname +  "/config2",
	     "feature_dir" : __dirname +  "/feature_extend2" 
	};

	var dooKeeper2 = new dk.dooKeeper(config2);
	it('no dir', function(){    
         assert.equal(false, dooKeeper2.getFlag('common:switch-on'));
    })
    it('use exports function of index.js',function(){
        var fn = dk(config);
    })
})


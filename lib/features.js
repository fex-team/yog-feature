
var features = module.exports = function(){};

//去除字符串左右空格
function trim(str){
	return str.replace(/(^\s*)|(\s*$)/g, "");
}

//获取某个cookie
function getCookie(cookies,name){
	var match = String(cookies).match(new RegExp(name + '=([^;]+)'));
	if (match){
	   return match[1]; 
	}         
	return false;
}

//同php hexdec方法，16进制转10进制
function hexdec(hex_string) {
  hex_string = (hex_string + '')
    .replace(/[^a-f0-9]/gi, '');
  return parseInt(hex_string, 16);
}




/**
 * switch开关，根据配置on/off控制功能展现关闭
 * @param  {[type]} val [on/off]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [true/false]
 */
features.switch = function(val,req,res){
    if(val == "on"){
        return true;
    }
    return false;    
}

/**
 * 日期开关，在日期范围内的将开启. *代表无限大或者无限小
 * @param  {[type]} val ["2014-04-03 23:10:00"]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [true/false]
 */
features.date = function(val,req,res){
    if(val){
    	var times = String(val).split("|");
    	var startStamp = 0, endStamp = 0,nowStamp = +new Date;
    	if(times.length == 2){
    		if(trim(times[0]) != "*"){
    			startStamp = +new Date(times[0]); //此处暂时用new Date，对日期字符串有格式要求
    		}
            //第二个*代表无限大
    		if(trim(times[1]) == "*"){
    			endStamp = 2145953471 * 10;
    		}else{
    			endStamp = +new Date(times[1]);
    		}
            //日期范围内的功能开启
    		if(startStamp <  nowStamp && nowStamp < endStamp){
    			return true;
    		}else{
    			return false;
    		}       	
    	}else{
    		return false;
    	}	
    }
    return false;    
}


/**
 * 比例开关，0-1范围内配置，根据baiduID进行抽样
 * @param  {[type]} val [description]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
features.percentage = function(val,req,res){
	if(!req || !req.headers || !val){
		return false;
	}
    //从cookie中读取baiduID
	var baiduId  = getCookie(req.headers['cookie'],"BAIDUID"); 
	//test
	//baiduId = "93DCA8B25F1F793BA1D4F2B42CD1D879:FG=1";

	var sample = val * 100 , num = Math.random()*100;
	if(baiduId){
        //baiduid后6位是随机数，转为0-100整数
		num = hexdec(baiduId.replace(':FG=1','').substr(-6)) % 100;
	}
	return num > sample;
}
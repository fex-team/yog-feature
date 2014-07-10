var Features = require("./lib/features.js");
var Logger = require("yog-log");
var fs = require("fs");

/**
 * feature flag控制类，提供接口给模板调用，判断某个feature是否开启
 * @param {[type]} option [description]
 * @param {[type]} req    [description]
 * @param {[type]} res    [description]
 */
var DoorKeeper = function(option,req,res){
    this.params  = {
        'req' : req,
        'res' : res
    };
    this.option = option;
    this.features = {};//feature实例配置列表
    this.init(option);
    this.logger = Logger.getLogger();
}

/**
 * 初始化用户feature配置与自定义扩展
 * @param  {[type]} option [description]
 * @return {[type]}        [description]
 */
DoorKeeper.prototype.init = function(option){
    this.option = option;
    var logger = this.logger;
    if(option['config_file']){
        var feature_json = option['config_file'];
        try {
            stat = fs.statSync(feature_json);
        }catch(e) {
            logger.log('fatal',{'stack': e});
        }
        if (stat && stat.isFile()) {
            try {             
                var json = JSON.parse(fs.readFileSync(feature_json));
                this.features = json['features'];
            } catch (e) {
                logger.log('fatal',{
                    'stack': e
                });
            }
        } 
    }
}

/**
 * 给模板层调用接口，判断某个feature是否开启
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
DoorKeeper.prototype.getFlag = function(name){
    if(!this.features[name]){
        return false;
    }
    var req = this.params['req'],
        res = this.params['res'],
        value = this.features[name]['value'] || null,//feature阈值
        feature_dir =  this.option['feature_dir'],
        type  = this.features[name]['type']; //feature类型

    var logger = this.logger;
    //默认的feature
    if(Features[type] &&  'function' == typeof(Features[type])){
        try{
            return Features[type](value,req,res); 
        }catch(e){
            logger.log('fatal',{
                'stack': e
            });
            return false;
        } 
    }else if(feature_dir) {  //自定义扩展的feature
        var file = feature_dir + "/" + type + ".js";
        if(fs.existsSync(file)){
            try{
                var feature = require(file);
                return feature(value,req,res);
            }catch(e){
                logger.log('fatal',{
                    'stack': e
                });
                return false;
            }
        }
        return false;
    }
    return false;   
}


module.exports = function(config){
    
    var config = config || {};

    return function (req, res, next) {

        //由于feature配置随时可能变化，request参数也不同，故每次请求进行一次初始化
        var dooKeeper = new DoorKeeper(config,req,res);
        //test
        //console.log(dooKeeper.getFlag("featureB"));

        //绑定在res对象的locals上的变量将直接传递到swig中
        //便于模板层编译时直接调用
        res.locals._doorKeeper = dooKeeper;
        next();
    }    
};
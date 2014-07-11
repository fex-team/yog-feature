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
    this.logger = Logger.getLogger();
}


/**
 * 获取某个模块内的feature
 * @param  {[type]} module [description]
 * @return {[type]}        [description]
 */
DoorKeeper.prototype.getModuleFeature = function(nameSpace) {
    //已读取配置不重复读取
    if(this.features[nameSpace]){
        return false;
    }
    var option = this.option;
    var logger = this.logger;
    if(option['config_dir']){
        var feature_json = option['config_dir'] + "/" + nameSpace + "-features.json";
        try {
            stat = fs.statSync(feature_json);
        }catch(e) {
            logger.log('fatal',{
                'stack': e ,
                'msg' : 'stat ' +  feature_json + ' error!'
            });

        }
        if (stat && stat.isFile()) {
            try {             
                var json = JSON.parse(fs.readFileSync(feature_json));
                this.features[nameSpace] = json['features'];
            } catch (e) {
                logger.log('fatal',{
                    'stack': e,
                    'msg' : 'parse json file '+ feature_json + " error! detail :" + e
                });
            }
        } 
    }
};

/**
 * 给模板层调用接口，判断某个feature是否开启
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
DoorKeeper.prototype.getFlag = function(str){
    var logger = this.logger;
    var _arr = str.split(":");  
    if(_arr.length != 2){
        logger.log('warning',{
            'msg' : "wrong feature name " + str
        });
        return false;
    }
    var nameSpace = _arr[0], featureName = _arr[1];
    //初始化该模块的feature配置
    this.getModuleFeature(nameSpace);

    //如果模块里不存在此feature配置，报错返回
    if(!this.features[nameSpace] || !this.features[nameSpace][featureName]){
        logger.log('warning',{
            'msg' : "no conf for feature : " + featureName + " and module :" + nameSpace
        });
        return false;
    }
    var req = this.params['req'],
        res = this.params['res'],      
        feature_dir =  this.option['feature_dir'],
        conf = this.features[nameSpace][featureName],   
        value = conf['value'] || null,//feature阈值
        type  = conf['type']; //feature类型

    //默认的feature
    if(Features[type] &&  'function' == typeof(Features[type])){
        try{
            return Features[type](value,req,res); 
        }catch(e){
            logger.log('fatal',{
                'stack': e,
                'msg' : 'exec feature type :' + type + ' and featureName ' + featureName + ' error! detail:' + e 
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
                    'stack': e,
                    'msg' : 'exec custom feature type ' + file + ' error! detail:' + e
                });
                return false;
            }
        }
        return false;
    }
    //不存在feature类型
    logger.log('warning',{
        'msg': 'no feature type :' + type
    });

    return false;   
}


module.exports = function(config){
    
    var config = config || {};

    return function (req, res, next) {

        //由于feature配置随时可能变化，request参数也不同，故每次请求进行一次初始化
        var dooKeeper = new DoorKeeper(config,req,res);
        //test
        //console.log(dooKeeper.getFlag("common:featureD"));

        //绑定在res对象的locals上的变量将直接传递到swig中
        //便于模板层编译时直接调用
        res.locals._doorKeeper = dooKeeper;
        next();
    }    
};
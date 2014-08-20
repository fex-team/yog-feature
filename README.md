yog-feature  
===========

## 这是什么

yog-feature是yog框架feature-flag中间件，关于feature-flag的介绍可以查看[官网](http://solar.baidu.com/featureflag)

yog-feature不支持单独使用，集成在yog框架中，与yog-swig模板结合提供类似于php smarty模板插件的支持。


## 快速上手

### 1 在yog app的`config/config.json`文件中添加配置开启此中间件

```javascript
{
	"middleware": {
         "yogFeature": {
            "enabled": true,
            "priority": 110,
            "module": {
                "name" : "yog-feature",
                "arguments": [
                    {
                        "config_dir": "path:./config"
                    }
                ]
            }
        }
    }
}
```

其中 config_dir表示feature配置文件夹地址，必填项。

### 2 配置所使用的feature

各个模块的feature单独配置，命名规则`namespace-features.json`。如`common-features.json`。

中间件默认提供三种feature：switch(是否开启控制)、date(日期范围控制)、percentage(比例抽样控制)，具体说明见下feature说明。配置格式如下：

```javascript
{
	"features" : {
        "featureA" : {
            "type" : "switch",
            "value" : "on",
            "desc" : "test switch feature work or not"
        },
        "featureB" : {
            "type" : "date",
            "value" : "2014-07-10 00:01:00 | 2014-01-13 23:45:00",
            "desc" : "test date work or not"
        }
        "featureC" : {
        	"type" : "percentage",
        	"value" : 0.2,
        	"desc" : "test percentage work or not"
        }  
    }
}
```

### 3 在模板层使用feature控制功能展现

配置好后就可以使用相应的feature来控制模板层的功能，如下所示：

```html
{% feature "common:featureA" %}
	<h1>Feature Flag控制命中</h1>
    {% widget "example:widget/new.tpl" id="1" mode="async" %}
{% featureelse %}
    <h1>Feature Flag控制内容没有命中！</h1>
    {% widget "example:widget/old.tpl" id="2" mode="async" %}
{% endfeature %}
```
或者只使用一个feature标签

```
{% feature "common:featureA" %}
	<h1>Feature Flag控制命中才看到这部分内容</h1>
    {% widget "example:widget/new.tpl" id="1" mode="async" %}
{% endfeature %}
```

## 内置feature说明

### **switch**

swith控制的value值配置只有on和off,on表示开启此功能，off表示关闭此功能。

### **date**

date控制日期范围，只有在日期范围内的功能才会开启，否则关闭。需配置起始时间，如下所示

```
"featureB" : {
    "type" : "date",
    "value" : "2014-07-10 00:01:00 | 2014-01-13 23:45:00",
    "desc" : "test date work or not"
}
```

### **percentage**

percentage控制抽样比例，0-1范围，1表示全部抽样。根据baiduid判断抽样，命中抽样的用户将一直命中。


## 扩展自己的feature

扩展自己的feature非常简单，只需要在配置的文件夹内添加扩展即可。需要注意的是文件的名称就是扩展feature的名称，扩展通过module.export暴露方法，参数为(val,req,res)，结果必须return true/false。

配置文件夹的方法请在app的config.json中添加feature_dir

```
{
	"middleware": {
         "yogFeature": {
            "enabled": true,
            "priority": 110,
            "module": {
                "name" : "yog-feature",
                "arguments": [
                    {
                        "config_dir": "path:./config",
                        "feature_dir" : "path:./config/feature_extend" 
                    }
                ]
            }
        }
    }
}
```

扩展示例如下：

```
// 扩展文件路径 feature_extend/ip.js  ,ip就是扩展的feature名称

//val是feature配置中的value,req是request对象，res是response对象
//此段代码的作用是只有用户IP地址等于feature配置中的value值，才开启功能
module.exports = function(val,req,res){
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.headers['x-real-ip'];
	if(ip == val){
		return true;
	}else{
		return false;
	}
}

```

针对这个ip控制的feature配置如下：

```
"featureD" : {
    "type" : "ip",
    "value" : "127.0.0.1",
    "desc" : "test custom extend ip"
}
```

这样就轻松实现了扩展，使得线上的功能只对限定IP的人可见，可以实现线上调试。


## 联系我们

任何需求或者问题欢迎联系！

邮件组 ： oak@baidu.com
HI ： zhangtao07@baidu.com、wangcheng@baidu.com

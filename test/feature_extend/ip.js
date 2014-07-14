

module.exports = function(val,req,res){
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.headers['x-real-ip'];
	if(ip == val){
		return true;
	}else{
		return false;
	}
}
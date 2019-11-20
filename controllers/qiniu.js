let qiniu = require('qiniu');
let config = require('./../config');
let accessKey = config.qiniu.AccessKey;
let secretKey = config.qiniu.SecretKey
let domain = config.qiniu.domain

const qiniuController = {
  token:function(req, res,next){
    try{
      let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
      let options = {
        scope: config.qiniu.bucket
      };
      let putPolicy = new qiniu.rs.PutPolicy(options);
      let uploadToken=putPolicy.uploadToken(mac);
      res.json({code:200, data:{uploadToken,domain}, message:'请求成功'})
    }catch(e){
      res.json({code:0, message:"服务器错误"})
    }
  }
};

module.exports = qiniuController;
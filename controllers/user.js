const userModel = require('./../models/user.js');
const weixinModel = require('./../models/weixin.js');
const authCode = require('./../utils/authCode.js');

const userController = {
  wxlogin: async function(req, res, next) {
    const code = req.body.code;
    const nickname = req.body.nickname;
    const avatar_url = req.body.avatar_url;

    if(!code){
      res.json({ code: 0, mssage: 'code empty!'})
      return
    }
    
    try{
      let weixinRequest = await weixinModel.login(code);
      let weixinData = weixinRequest.data;
      let open_id    = weixinData.openid;
      let userInfoShow   = await userModel.show({ open_id });
      let userInfo = userInfoShow[0] || {};
      if(!userInfo.id){
        let userInfoInsert = await userModel.insert({
          open_id, nickname, avatar_url
        });
        userInfo.id = userInfoInsert[0];
      }
      let str = open_id + '\t' + userInfo.id;
      let token = authCode(str, 'ENCODE');
      res.json({ code: 200, data: {  userInfo, token }});
    } catch(err) {
      console.log(err)
      res.json({ code: 0, message: '登录失败' })
    }
  },
}

module.exports = userController;
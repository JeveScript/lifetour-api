const aliyunModel = require('./../models/aliyun');
const smsModel = require('./../models/sms');

const smsController = {
  send: async function(req,res,next) {
    try {
      const findex = req.body.findex;
      const user_id = req.body.user_id;
      const phone = req.body.phone;

      if(!user_id || !findex || !phone) {
        res.json({code: 0, message: '缺少参数'});
        return
      }

      const code = Math.random().toString().slice(-4);
      const TemplateParam = JSON.stringify({
        code
      })


      const smsLogInsert = await smsModel.insert({
        code,
        phone,
        params: TemplateParam,
        template: 'SMS_175485006',
        sign_name: '卡券速兑',
      })

      const smsLogId = smsLogInsert[0];
      const smsResult =  await aliyunModel
        .sms({
          PhoneNumbers: phone,
          SignName: '卡券速兑',
          TemplateCode: 'SMS_175485006',
          TemplateParam
        });

      if(smsResult.status === 1 ) {
        res.json({code: 200, message: '短信发送成功', data: {
          sms_id: smsLogId
        }});
      } else {
        res.json({code: 0, message: '短信发送失败', data: smsResult.data});
      }

    } catch(e) {
      console.log(e)
      res.json({code: 0, message: '短信发送失败'});
    }
  },
}

module.exports = smsController;

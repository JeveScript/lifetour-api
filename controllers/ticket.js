const ticketModel = require('./../models/ticket');
const smsModel = require('./../models/sms');
const orderModel = require('./../models/order');

const ticketController = {
  exchange: async function(req, res, next) {
    let sms_id = req.body.sms_id;
    let phone = req.body.phone;
    let code = req.body.code;
    let findex = req.body.findex;
    let fcode = req.body.fcode;
    let user_id = req.body.user_id;
    let address_name = req.body.address_name;
    let address_phone = req.body.address_phone;
    let address_detail = req.body.address_detail;

    if(!sms_id || !phone || !code 
        || !findex || !fcode || !user_id 
        || !address_name || !address_phone || !address_detail) {
        res.json({ code: 0, message: '缺少参数'});
        return
    }

    try{
      let smsLogShow = await smsModel.show({
        phone, code, 
        id: sms_id,
      })
      
      let smsLog = smsLogShow[0];
      if(!smsLog) {
        res.json({code: 0, message: '短信验证码错误'});
        return
      }

      if(smsLog.status === 1) {
        res.json({code: 0, message: '验证码已使用，请重新获取'});
        return
      }

      let created_at = new Date(smsLog.created_at).getTime();
      let date_now = Date.now();
      let time_offset = date_now - created_at;
      if(time_offset > 5 * 60 * 1000){
        res.json({ code: 0, message: '验证码过期'})
        return
      }

      await smsModel.update(smsLog.id, { status: 1 });
      console.log(findex,fcode)
      let ticketShow = await ticketModel.show({ findex, fcode });
      let ticketInfo = ticketShow[0];
      console.log(ticketInfo)
      if(!ticketInfo) {
        res.json({ code: 0, message: '券码错误，请重新获取验证码'});
        return
      }

      let endAt = new Date(ticketInfo.end_at).getTime();
      if(date_now > endAt) {
        res.json({ code: 0, message: '券码错误已过期'});
        return
      }

      if(ticketInfo.user_id) {
        res.json({ code: 0, message: '卡券已被兑换'});
        return
      }

      let ticket_id = ticketInfo.id;
      await ticketModel.update(ticket_id, { user_id, status: 1 });
      let orderInsert = await orderModel.insert({
        findex,
        user_id,
        ticket_id,
        address_name,
        address_phone,
        address_detail,
      })

      res.json({ code: 200, data: {
        order_id: orderInsert[0]
      }});

    }catch(e) {
      res.json({code: 0, message: '服务器错误'});
    }
  },
}

module.exports = ticketController;
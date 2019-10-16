const orderModel = require('./../models/order');
const { formatTime, formatDate } = require('./../utils/formatDate.js');
const smsModel = require('./../models/sms');
const aliyunModel = require('./../models/aliyun');
const ticketModel = require('./../models/ticket');
const goodsModel = require('./../models/goods');

const orderController = {
  list: async function(req, res, next) {
    let status = req.query.status;
    let findex = req.query.findex;
    let address_name = req.query.address_name;
    let address_phone = req.query.address_phone;
    let express_number = req.query.express_number;
    let express_status = req.query.express_status;
    let pageSize = req.query.page_size || 20;
    let currentPage = req.query.current_page || 1;
    let startAt = req.query.start_at;
    let endAt = req.query.end_at;
    let filterColumn = (startAt && endAt) ? 'order.created_at' : '';
    let params = {};
    if(status !== '') params.status = status;
    if(findex) params.findex = findex;
    if(address_name) params.address_name = address_name;
    if(address_phone) params.address_phone = address_phone;
    if(express_number) params.express_number = express_number;
    if(express_status !== '') params.express_status = express_status;

    try {
      let orders = await orderModel
        .pagination(pageSize, currentPage, params, {
          column: filterColumn,
          startAt: startAt,
          endAt: endAt,
        })
        .orderBy('id', 'desc');

      // 格式化时间
      orders.forEach(data => data.created_at = formatTime(data.created_at));
      let ordersTotalCount = await orderModel.count(params,  {
        column: filterColumn,
        startAt: startAt,
        endAt: endAt,
      });
      let total = ordersTotalCount[0].total;
      res.json({code: 200, message: '获取成功', data: {
        datas: orders,
        pagination: {
          total: total,
          current_page: currentPage,
          page_size: pageSize,
        }
      }})
    } catch (err) {
      console.log(err)
      res.json({code:0,message: '服务器错误'});
    }
  },
  check: async function(req,res,next) {
    let findex = req.body.findex;
    if(!findex) {
      res.json({code: 0, message: '缺少必要参数'})
      return
    }

    try{
      let orderInfoShow   = await orderModel.show({ findex });
      let orderInfo = orderInfoShow[0];
      if(!orderInfo) {
        res.json({ code: 200, data: {}})
      }else{
        res.json({ code: 200, data: { 
          id: orderInfo.id,
          user_id: orderInfo.user_id
        }});
      }
    } catch(err) {
      res.json({ code: 0, message: '服务器错误' })
    }
  },
  show: async function(req, res, next) {
    let id = req.params.id;
    try{
      let orderInfoShow   = await orderModel.show({ id });
      let orderInfo = orderInfoShow[0];
      if(!orderInfo) {
        res.json({ code: 0, message: '无该订单' })
      }else{
        let goodsId = orderInfo.goods_id;
        let goodsInfo = await goodsModel.show({ id: goodsId });
        orderInfo.goods = goodsInfo[0];
        orderInfo.created_at = formatTime(orderInfo.created_at);
        res.json({ code: 200, data: orderInfo });
      }
    } catch(err) {
      res.json({ code: 0, message: '服务器错误' })
    }
  },
  my: async function(req,res, next) {
    let user_id = req.body.user_id;
    try{
      let orderInfoShow   = await orderModel.show({ user_id });
      res.json({ code: 200, data: orderInfoShow });
    } catch(err) {
      res.json({ code: 0, message: '服务器错误' })
    }
  },
  updateExpress: async function(req, res, next) {
    let id = req.params.id;
    let express_code = req.body.express_code;
    let express_number = req.body.express_number;
    let express_company = req.body.express_company;
    let user_phone = req.body.user_phone;
    let findex = req.body.findex;

    if(!express_code || !express_number || !express_company || !findex || !user_phone) {
      res.json({code: 0, message: '缺少必要参数'})
      return
    }

    try {
      await orderModel.update(id, 
        { express_code,
          express_number,
          express_company,
          express_status: 1 });
      const TemplateParam = JSON.stringify({
        findex,
        name: '红酒',
        phone: '4001579757',
        company: express_company,
        code: express_number,
      })

      const smsLogInsert = await smsModel.insert({
        code: express_code,
        phone: user_phone,
        params: TemplateParam,
        template: 'SMS_175570407',
        sign_name: '卡券速兑',
      })

      const smsLogId = smsLogInsert[0];
      const smsResult =  await aliyunModel
        .sms({
          PhoneNumbers: user_phone,
          SignName: '卡券速兑',
          TemplateCode: 'SMS_175570407',
          TemplateParam
        });

      if(smsResult.status === 1 ) {
        res.json({code: 200, message: '短信发送成功', data: {
          sms_id: smsLogId
        }});
      } else {
        res.json({code: 0, message: '短信发送失败', data: smsResult.data});
      }
      // res.json({ code: 200, data: { express_code, express_number, express_company, express_status: 1 } });
    } catch (err) {
      console.log(err)
      res.json({ code: 0, message: '服务器错误'})
    }
  },
}

module.exports = orderController;
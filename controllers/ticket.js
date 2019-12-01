const ticketModel = require('./../models/ticket');
const goodsModel = require('./../models/goods');
const smsModel = require('./../models/sms');
const orderModel = require('./../models/order');
const { formatTime, formatDate } = require('./../utils/formatDate.js');
const crypto = require('crypto');
const config = require('./../config.js');
const key = Buffer.from(config.ticket.key, 'utf8');
const iv = Buffer.from(config.ticket.iv, 'utf8');
const APPID = config.miniapp.appid;
const APPSECRET = config.miniapp.secret;
const ACTOKEN_URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`;
const axios = require('axios');

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

      let ticketShow = await ticketModel.show({ findex, fcode });
      let ticketInfo = ticketShow[0];

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
      let goods_id = ticketInfo.goods_id;
      let company_id = ticketInfo.company_id;
      await ticketModel.update(ticket_id, { user_id, status: 1 });
      let orderInsert = await orderModel.insert({
        findex,
        user_id,
        goods_id,
        ticket_id,
        company_id,
        address_name,
        address_phone,
        address_detail,
        user_phone: phone,
      })

      res.json({ code: 200, data: {
        order_id: orderInsert[0]
      }});

    }catch(e) {
      res.json({code: 0, message: '服务器错误'});
    }
  },
  list: async function(req, res, next) {
    let status = req.query.status;
    let findex = req.query.findex;
    let company_id = req.query.company_id;
    let goods_id = req.query.goods_id;
    let pageSize = req.query.page_size || 20;
    let currentPage = req.query.current_page || 1;
    let startAt = req.query.start_at;
    let endAt = req.query.end_at;
    let filterColumn = (startAt && endAt) ? 'ticket.start_at' : '';
    let params = {};
    if(status !== undefined && status !== '') params.status = status;
    if(findex) params.findex = findex;
    if(company_id) params.company_id = company_id;
    if(goods_id) params.goods_id = goods_id;

    try{
      let tickets = await ticketModel
        .pagination(pageSize, currentPage, params, {
          column: filterColumn,
          startAt: startAt,
          endAt: endAt,
        })
        .leftJoin('company', 'ticket.company_id', 'company.id')
        .leftJoin('goods', 'ticket.goods_id', 'goods.id')
        .column('ticket.id', 'ticket.findex', 'ticket.start_at', 'ticket.end_at', 
          'ticket.company_id', 'ticket.status', 'ticket.goods_id',
          { goods_name: 'goods.name' },
          { company_name: 'company.name' })
        .orderBy('id', 'desc');

      tickets.forEach(data => {
        data.start_at = formatDate(data.start_at)
        data.end_at = formatDate(data.end_at)
      });

      let ticketsTotalCount = await ticketModel.count(params,  {
        column: filterColumn,
        startAt: startAt,
        endAt: endAt,
      });

      let total = ticketsTotalCount[0].total;
      res.json({code: 200, message: '获取成功', data: {
        datas: tickets,
        pagination: {
          total: total,
          current_page: currentPage,
          page_size: pageSize,
        }
      }})
    }catch(e) {
      console.log(e)
      res.json({code: 0, message: '服务器错误'});
    }
  },
  insert: async function(req, res, next) {
    const goodsId = req.body.goods_id;
    const startAt = req.body.start_at;
    const period = Number(req.body.period);
    const number = Number(req.body.number);
    const PREFIX = 'R';

    if(!goodsId || !number || !startAt || !period) {
      res.json({ code: 0, message: '缺少参数'});
      return
    }

    const DATE = startAt.split('-');
    const YEAR = Number(DATE[0]);
    const MONTH = DATE[1].padStart(2,0);
    const DAY = DATE[2].padStart(2,0);
    const SIMPLEYEAR = String(YEAR).substring(2);

    try {
      const goodsRes = await goodsModel.show({ id: goodsId});
      const beginIndex = goodsRes[0].index;
      const companyId = goodsRes[0].company_id;
      const endIndex = beginIndex + number;
      const insertArr = [];
      for (let i = beginIndex + 1; i <= endIndex; i++) {
        const tmp = {};
        const index = String(i).padStart(5,0);
        const encode = PREFIX + companyId + goodsId + index;
        const goodsIdStr = String(goodsId).padStart(2,0);
        tmp.company_id = companyId;
        tmp.goods_id = goodsId;
        tmp.findex = `${PREFIX}${companyId}${goodsIdStr}${SIMPLEYEAR}${MONTH}${DAY}${index}`;
        tmp.start_at = `${YEAR}-${MONTH}-${DAY}`;
        tmp.end_at = `${YEAR + period}-${MONTH}-${DAY}`;
        tmp.index = index;
        let src = '';
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        src += cipher.update(encode, 'utf8', 'hex');
        src += cipher.final('hex');
        tmp.fcode = src.toLocaleUpperCase().substr(0,16);
        insertArr.push(tmp);
      }
      await goodsModel.update(goodsId, { index: endIndex })
      await ticketModel.insert(insertArr)
      res.json({code: 200, data: insertArr, message: '卡券生成成功'});

    }catch(e) {
      console.log(e)
      res.json({code: 0, message: '服务器错误'});
    }

  },
  qrcode:async function(req, res, next) {
    let id = req.params.id;
    let ticketRes =  await ticketModel.show({id});
    let ticketInfo = ticketRes[0];
    if(!ticketInfo) {
      res.json({code: 0, message: '没有改卡券'});
      return
    }

    try{
      const wexinTokenRes = await axios.get(ACTOKEN_URL);
      const wexinTokenResData = wexinTokenRes.data;
      const wexinToken = wexinTokenResData.access_token;
      const WXACODE_URL = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${wexinToken}`;
      const findex = ticketInfo.findex;
      const fcode = ticketInfo.fcode;
      const getUnlimitedRes = await axios.post(WXACODE_URL,{
        scene: findex + fcode,
        page: 'pages/dexchange/dexchange',
      },{
        headers: {
          'content-type': 'application/json'
        },
        responseType:'arraybuffer',
      })
      const prefix = "data:image/jpeg;base64,";
      const base64 = prefix + new Buffer(getUnlimitedRes.data, 'binary').toString('base64');
      res.json({ code: 200, data: base64 })
    }catch(e) {
      res.json({code: 0, message: '服务器错误'});
    }

  }
}

module.exports = ticketController;
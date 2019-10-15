const crypto = require('crypto');
const axios = require('axios');
const qs = require('qs');
const config = require('./../config.js');

const kdniaoController = {
  search:async function(req,res,next) {

    const EBUSINESS_ID = config.kdniao.id;
    const APP_KEY = config.kdniao.key;
    const express_code = req.query.express_code;
    const express_number = req.query.express_number;
    // const expCode = 'ZTO';
    // const expNo = '75301185055225';

    if(!express_code || !express_number) {
      res.json({code: 0, message: '缺少参数'});
      return
    }


    let URL = 'http://api.kdniao.com/Ebusiness/EbusinessOrderHandle.aspx';
    let md5 = str => {
      return crypto
        .createHash('md5')
        .update(str)
        .digest('hex');
    };

    let encrypt = (content, keyValue = '') => {
      let buf = Buffer.from(md5(content + keyValue));
      return buf.toString('base64');
    };
    
    const requestData = `{"OrderCode":"19100222332167214250","ShipperCode":"${express_code}","LogisticCode":"${express_number}"}`;
    const params = {
        RequestData: requestData,
        EBusinessID: EBUSINESS_ID,
        RequestType: 1002,
        DataSign: encrypt(requestData, APP_KEY),
        DataType: 2
    };

    axios({
      url: URL,
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: qs.stringify(params),
    }).then( response => {
      res.json({code: 200 , data: response.data});
    }).catch( err => {
      res.json({code:0 , message: err.response.data});
    })
  },
}

// Buffer() is deprecated due to security and usability issues. 
// Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.

module.exports = kdniaoController;
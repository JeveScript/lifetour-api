const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const ticketModel = require('./../models/ticket');
const config = require('./../config.js');
const key = Buffer.from(config.ticket.key, 'utf8');
const iv = Buffer.from(config.ticket.iv, 'utf8');
const APPID = config.miniapp.appid;
const APPSECRET = config.miniapp.secret;
const ACTOKEN_URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`;

async function getTicketImage() {
  try{
    const wexinTokenRes = await axios.get(ACTOKEN_URL);
    const wexinTokenResData = wexinTokenRes.data;
    const wexinToken = wexinTokenResData.access_token;
    const WXACODE_URL = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${wexinToken}`;

    const beginIndex = 1;
    const endIndex = 20;
    // const PREFIX = 'R';
    const PREFIX = 'D';
    const companyId = '01';
    const goodsId = '01';
    const result = [];
    for (let i = beginIndex; i <= endIndex; i++) {
      const tmp = {};
      // const DATE = new Date();
      // const YEAR = DATE.getFullYear();
      // const MONTH = String(DATE.getMonth() + 1).padStart(2,0);
      // const DAY = String(DATE.getDate() + 1).padStart(2,0);
      const YEAR = 2019;
      const MONTH = '10';
      const DAY = '01';
      const SIMPLEYEAR = String(YEAR).substring(2);
      const index = String(i).padStart(5,0);
      const encode = PREFIX + companyId + goodsId + index;
      tmp.company_id = companyId;
      tmp.goods_id = goodsId;
      tmp.findex = `${PREFIX}${companyId}${goodsId}${SIMPLEYEAR}${MONTH}${DAY}${index}`;
      tmp.start_at = `${YEAR}-${MONTH}-${DAY}`;
      tmp.end_at = `${YEAR + 2}-${MONTH}-${DAY}`;
      let src = '';
      const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
      src += cipher.update(encode, 'utf8', 'hex');
      src += cipher.final('hex');
      tmp.fcode = src.toLocaleUpperCase().substr(0,16);
      result.push(tmp);
    }

    result.forEach(async function(data,index) {
      const getUnlimitedRes = await axios.post(WXACODE_URL,{
        scene: data.findex + data.fcode,
        page: 'pages/dexchange/dexchange',
      },{
        headers: {
          'content-type': 'application/json'
        },
        responseType:'stream', //arraybuffer
      })
      const getUnlimitedResData = getUnlimitedRes.data;
      getUnlimitedResData.pipe(fs.createWriteStream('./dist/' + data.findex + '.jpeg'));
    })

    // await ticketModel.insert(result)
    console.log('success')
  }catch(e) {
    console.log(e)
  }
}

getTicketImage();


// const ticketController = {
//   build:async function(req,res,next) {
//     const PREFIX = 'R';
//     const companyId = '01';
//     const goodsId = '01';

//     const result = [];
//     const crypto = require('crypto');
//     const key = Buffer.from(config.ticket.key, 'utf8');
//     const iv = Buffer.from(config.ticket.iv, 'utf8');

//     const APPID = 'wx4ac399de99621032';
//     const APPSECRET = 'f3ad398e11c23167c4bdc6c85d927909';
//     const ACTOKEN_URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`;
//     const wexinTokenRes = await axios.get(ACTOKEN_URL);
//     const wexinTokenResData = wexinTokenRes.data;
//     const wexinToken = wexinTokenResData.access_token;
//     const WXACODE_URL = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${wexinToken}`;


//     for (let i = 1; i <= 1000; i++) {
//       // if(i >= 1 && i <= 10) {
//         const tmp = {};
//         const DATE = new Date();
//         const YEAR = DATE.getFullYear();
//         // const MONTH = String(DATE.getMonth() + 1).padStart(2,0);
//         // const DAY = String(DATE.getDate() + 1).padStart(2,0);
//         const MONTH = '10';
//         const DAY = '01';
//         const index = String(i).padStart(5,0);
//         const encode = PREFIX + companyId + goodsId + index;
//         tmp.company_id = companyId;
//         tmp.goods_id = goodsId;
//         tmp.findex = `${PREFIX}${companyId}${goodsId}${YEAR}${MONTH}${DAY}${index}`;
//         tmp.start_at = `${YEAR}-${MONTH}-${DAY}`;
//         tmp.end_at = `${YEAR + 2}-${MONTH}-${DAY}`;

//         let src = '';
//         const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
//         src += cipher.update(encode, 'utf8', 'hex');
//         src += cipher.final('hex');
//         tmp.fcode = src.toLocaleUpperCase().substr(0,16);
//         result.push(tmp);
//       // }
//     }
//     try{
//       // await ticketModel.insert(result)
//       res.json({code:result});
//     }catch(e) {
//       console.log(e)
//       res.json({code:0});
//     }
//     // result.forEach(async function(data,index) {
//     //   const getUnlimitedRes = await axios.post(WXACODE_URL,{
//     //     scene: data.findex,
//     //     page: 'pages/exchange/exchange',
//     //   },{
//     //     headers: {
//     //       'content-type': 'application/json'
//     //     },
//     //     responseType:'stream', //arraybuffer
//     //   })
//     //   const getUnlimitedResData = getUnlimitedRes.data;
//     //   getUnlimitedResData.pipe(fs.createWriteStream('./dist/' + data.findex + '.jpeg'));
//     // })
//   }
// }

// module.exports = ticketController;
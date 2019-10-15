const Core = require('@alicloud/pop-core');
const config = require('./../config.js');

const aliyun = {
  sms: function({ PhoneNumbers, SignName, TemplateCode, TemplateParam }){
    const client = new Core({
      accessKeyId: config.aliyun.accessKey,
      accessKeySecret: config.aliyun.secretKey,
      endpoint: 'https://dysmsapi.aliyuncs.com',
      apiVersion: '2017-05-25'
    });

    const params = {
      "RegionId": "cn-hangzhou",
      "PhoneNumbers": PhoneNumbers,
      "SignName": SignName,
      "TemplateCode": TemplateCode,
      "TemplateParam": TemplateParam
    }

    const requestOption = {
      method: 'POST'
    };

    // return client.request('SendSms', params, requestOption);
    return new Promise((resolve,reject) => {
      client.request('SendSms', params, requestOption)
        .then((result) => {
          resolve({status: 1, data: result})
        })
        .catch((ex) => {
          resolve({status: 0, data: ex.data})
        })
    })
  }
}

module.exports = aliyun;
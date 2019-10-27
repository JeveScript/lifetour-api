const companyModel = require('./../models/company.js');

const companyController = {
  index: async function(req,res,next) {
    try {
      let companys = await companyModel.all();
      res.json({code: 200, message: '获取成功', data: companys})
    } catch (err) {
      console.log(err)
      res.json({code:0,message: '服务器错误'});
    }
  }
}

module.exports = companyController;
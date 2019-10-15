var managerModel = require('./../models/manager.js');

const managerController = {
  insert: async function(req,res,next) {
    let name = req.body.name;
    let password = req.body.password;
    let phone = req.body.phone;
    if(!name || !password || !phone) {
      res.json({code:0,message: '参数缺少'});
      return
    }

    try {
      let judge = await managerModel.where({phone});
      if(judge.length >= 1){
          return res.json({code:0,message:'用户已存在'})
      }
      await managerModel.insert({ name, password, phone});
      res.json({code:200,message: '添加成功'});
    } catch (err) {
      res.json({code:0,message: '服务器错误'});
    }
  },
  show: async function(req,res,next) {
    let id = req.params.id;

    try {
      let manages = await managerModel.show({id});
      let data = manages[0];
      res.json({code: 200, message: '获取成功', data: data})
    } catch (err) {
      res.json({code:0,message: '服务器错误'});
    }
  },
  update:async function(req, res, next) {
    let id = req.params.id;
    let name = req.body.name;
    let password = req.body.password;
    let phone = req.body.phone;
    if(!name || !password || !phone) {
      res.json({code:0,message: '参数缺少'});
      return
    }


    try {
      await managerModel.update(id, { name, password, phone});
      res.json({code: 200, message: '修改成功'})
    } catch (err) {
      res.json({code:0,message: '服务器错误'});
    }
  },
  delete:async function(req, res, next) {
    let id = req.params.id;
    try {
      await managerModel.sortDelete(id);
      res.json({code: 200, message: '删除成功'})
    } catch (err) {
      res.json({code:0,message: '服务器错误'});
    }
  },
  index:async function(req, res, next ) {

    try {
      let managers = await managerModel.sortAll();
      res.json({code: 200, message: '获取成功', data: managers})
    } catch (err) {
      console.log(err)
      res.json({code:0,message: '服务器错误'});
    }
  }
}

module.exports = managerController;
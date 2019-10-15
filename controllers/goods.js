const goodsModel = require('./../models/goods');

const goodsController = {
  show:async function(req,res,next) {
    let id = req.params.id;
    try{
      let datas = await goodsModel.show({ id });
      res.json({code:200, data: datas[0]})
    }catch(e) {
      res.json({code:0})
    }
  }
}

module.exports = goodsController;
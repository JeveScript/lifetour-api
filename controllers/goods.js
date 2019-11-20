const goodsModel = require('./../models/goods');

const goodsController = {
  show: async function(req,res,next) {
    let id = req.params.id;
    try{
      let datas = await goodsModel.show({ id });
      res.json({code:200, data: datas[0]})
    }catch(e) {
      res.json({code:0,message: '服务器错误'})
    }
  },
  index: async function(req, res, next) {
    let pageSize = req.query.page_size || 20;
    let currentPage = req.query.current_page || 1;
    let company_id = req.query.company_id;
    let params = {};
    let filterColumn = '';
    if(company_id) params.company_id = company_id;

    try {
      let goods = await goodsModel
        .pagination(pageSize, currentPage, params)
        .leftJoin('company', 'goods.company_id', 'company.id')
        .column('goods.id', 'goods.name', 'goods.contact_phone', 'goods.company_id', 
          { company_name: 'company.name' })
        .orderBy('id', 'desc');

      // 格式化时间
      let goodsTotalCount = await goodsModel.count(params);
      let total = goodsTotalCount[0].total;
      res.json({code: 200, message: '获取成功', data: {
        datas: goods,
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
  update: async function(req, res, next) {
    let id = req.params.id;
    let name = req.body.name;
    let description = req.body.description;
    let contact_phone = req.body.contact_phone;
    let image_url = req.body.image_url;
    if(!name) {
      res.json({code:0,message: '参数缺少'});
      return
    }


    try {
      await goodsModel.update(id, { name, description, contact_phone, image_url});
      res.json({code: 200, message: '修改成功'})
    } catch (err) {
      res.json({code:0,message: '服务器错误'});
    }
  }
}

module.exports = goodsController;
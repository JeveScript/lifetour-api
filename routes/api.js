const express = require('express');
const router = express.Router();

const ticketController = require('./../controllers/ticket');
const goodsController = require('./../controllers/goods');
const userController = require('./../controllers/user');
const orderController = require('./../controllers/order');
const smsController = require('./../controllers/sms');
const kdniaoController = require('./../controllers/kdniao');
const managerController = require('./../controllers/manager');
const companyController = require('./../controllers/company');
const authController = require('./../controllers/auth');
const qiniuController = require('./../controllers/qiniu.js');
const authMiddleware = require('./../middlewares/auth')

router.get('/', function(req, res, next) {
  res.json({ code: 200 })
});

// 通用
router.post('/auth/login', authController.login);
router.get('/qiniu/token', qiniuController.token);
// 管理员
router.post('/manager', authMiddleware.mustRoot ,managerController.insert);
router.get('/manager/:id', authMiddleware.mustRoot ,managerController.show);
router.put('/manager/:id', authMiddleware.mustRoot ,managerController.update);
router.delete('/manager/:id', authMiddleware.mustRoot ,managerController.delete);
router.get('/manager', authMiddleware.mustRoot ,managerController.index);
// 订单
router.get('/order', authMiddleware.mustManager ,orderController.list);
router.get('/order/:id', authMiddleware.mustManager ,orderController.show);
router.put('/order/:id/express', authMiddleware.mustManager ,orderController.updateExpress);
// 卡券
router.get('/ticket', authMiddleware.mustRoot ,ticketController.list);
router.post('/ticket', authMiddleware.mustRoot ,ticketController.insert);
router.get('/ticket/:id/qrcode', ticketController.qrcode);



// 公司
router.get('/company', companyController.index);

// 产品
router.get('/goods', authMiddleware.mustRoot ,goodsController.index);
router.get('/goods/:id', authMiddleware.mustRoot ,goodsController.show);
router.put('/goods/:id', authMiddleware.mustRoot ,goodsController.update);

// 微信
router.get('/wx/goods/:id', goodsController.show);
router.post('/wx/wxlogin', userController.wxlogin);
router.post('/wx/order/check', orderController.check);
router.get('/wx/order/:id', orderController.show);
router.post('/wx/order/my', orderController.my);
router.post('/wx/sms/send', smsController.send);
router.post('/wx/ticket/exchange', ticketController.exchange);


router.get('/wx/express/search', kdniaoController.search);
router.get('/common/express/search', kdniaoController.search);


module.exports = router;

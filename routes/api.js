const express = require('express');
const router = express.Router();

const ticketController = require('./../controllers/ticket');
const goodsController = require('./../controllers/goods');
const userController = require('./../controllers/user');
const orderController = require('./../controllers/order');
const smsController = require('./../controllers/sms');
const kdniaoController = require('./../controllers/kdniao');
const managerController = require('./../controllers/manager');
const authController = require('./../controllers/auth');


router.get('/', function(req, res, next) {
  res.json({ code: 200 })
});

// 通用
router.post('/auth/login', authController.login);
// 管理员
router.post('/manager', managerController.insert);
router.get('/manager/:id', managerController.show);
router.put('/manager/:id', managerController.update);
router.delete('/manager/:id', managerController.delete);
router.get('/manager', managerController.index);
// 订单
router.get('/order', orderController.list);
router.get('/order/:id', orderController.show);
router.put('/order/:id/express', orderController.updateExpress);

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

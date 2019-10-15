var basicModel = require('./basic.js');

class orderModel extends basicModel {
  constructor(props = "order") {
    super(props);
  }
}

module.exports = new orderModel();

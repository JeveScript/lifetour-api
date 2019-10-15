var basicModel = require('./basic.js');

class ticketModel extends basicModel {
  constructor(props = "goods") {
    super(props);
  }
}

module.exports = new ticketModel();

var basicModel = require('./basic.js');

class ticketModel extends basicModel {
  constructor(props = "ticket") {
    super(props);
  }
}

module.exports = new ticketModel();

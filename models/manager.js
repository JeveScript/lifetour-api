var basicModel = require('./basic.js');

class managerModel extends basicModel {
  constructor(props = "manager") {
    super(props);
  }
}

module.exports = new managerModel();


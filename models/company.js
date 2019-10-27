var basicModel = require('./basic.js');

class companyModel extends basicModel {
  constructor(props = "company") {
    super(props);
  }
}

module.exports = new companyModel();

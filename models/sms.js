var basicModel = require('./basic.js');

class smsModel extends basicModel {
  constructor(props = "sms_log") {
    super(props);
  }
}

module.exports = new smsModel();

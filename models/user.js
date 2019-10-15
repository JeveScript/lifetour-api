var basicModel = require('./basic.js');

class userModel extends basicModel {
  constructor(props = "user") {
    super(props);
  }
}

module.exports = new userModel();

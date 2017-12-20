define(function(require, exports, module) {
  var apper = require('./data-apper')
  var member = require('./data-member')
  var tester = require('./data-tester')
  var wder = require('./data-wder')
  var lucky = require('./data-lucky')
  module.exports = apper.concat(tester).concat(wder).concat(member).concat(lucky);
});

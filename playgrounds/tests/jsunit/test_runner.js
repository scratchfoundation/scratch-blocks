require('chromedriver');
var webdriver = require('selenium-webdriver');
var browser = new webdriver.Builder()
  .forBrowser('chrome')
  .build();

// Parse jsunit html report, exit(1) if there are any failures.
var testHtml = function (htmlString) {
  var regex = /[\d]+\spassed,\s([\d]+)\sfailed./i;
  var numOfFailure = regex.exec(htmlString)[1];
  var regex2 = /Unit Tests for .*]/;
  var testStatus = regex2.exec(htmlString)[0];
  console.log("============Unit Test Summary=================");
  console.log(testStatus);
  var regex3 = /\d+ passed,\s\d+ failed/;
  var detail = regex3.exec(htmlString)[0];
  console.log(detail);
  console.log("============Unit Test Summary=================");
  if (parseInt(numOfFailure) !== 0) {
    console.log(htmlString);
    process.exit(1);
  }
};

var path = process.cwd();

browser
  .get("file://" + path + "/tests/jsunit/vertical_tests.html")
  .then(function () { return browser.sleep(5000) })
  .then(function () { return browser.findElement({id: "closureTestRunnerLog"}) })
  .then(function (e) { return e.getText() })
  .then(testHtml)
  .then(function () { return browser.get("file://" + path + "/tests/jsunit/horizontal_tests.html")})
  .then(function () { return browser.sleep(5000) })
  .then(function () { return browser.findElement({id: "closureTestRunnerLog"}) })
  .then(function (e) { return e.getText() })
  .then(testHtml);
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

var runTests = async function () {
  var element, text;

  await browser.get("file://" + path + "/tests/jsunit/vertical_tests.html");
  await browser.sleep(5000);
  element = await browser.findElement({id: "closureTestRunnerLog"});
  text = await element.getText();
  testHtml(text);

  await browser.get("file://" + path + "/tests/jsunit/horizontal_tests.html");
  await browser.sleep(5000);
  element = await browser.findElement({id: "closureTestRunnerLog"});
  text = await element.getText();
  testHtml(text);
};

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});

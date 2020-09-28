'use strict';

require('geckodriver');
const { Builder, By } = require('selenium-webdriver');

(async function test_runner() {
  async function checkFailures_(browser) {
    var mocha = await browser.findElement(By.id('mocha'));
    var li = await mocha.findElement(By.className('failures'));
    var em = await li.findElement(By.tagName('em'));
    return await em.getText();
  }

  var browser = await new Builder().forBrowser('firefox').build();
  const pathPrefix = 'file://' + process.cwd();

  await browser.get(pathPrefix + '/tests/mochaunit/vertical_tests.html');
  if (await checkFailures_(browser) != 0) {
    throw new Error();
  }

  await browser.get(pathPrefix + "/tests/mochaunit/horizontal_tests.html");
  if (await checkFailures_(browser) != 0) {
    throw new Error();
  }

  browser.quit();
})();

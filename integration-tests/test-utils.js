var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;
    Key = webdriver.key;

init = function() {
    var driver = new webdriver.Builder()
        .forBrowser('firefox')
        .build();

    driver.get('http://localhost:5000/');
    return driver;
}

getwebdriver = function(){
    return webdriver;
}

createRoom = function(driver, name) {
    driver.findElement(getwebdriver().By.id('input-text')).sendKeys(name);
    driver.findElement(By.id('join')).click();
}

joinRoom = function(driver, name) {
    driver.findElement(By.xpath('//li[contains(text(), ' + name + ')]')).click();
}

changeDirection = function(driver, newDirection) {
    driver.findElement(By.id('canvas')).sendKeys(newDirection);
}

close = function(driver, driver2) {
    driver.quit();
    driver2.quit();
}

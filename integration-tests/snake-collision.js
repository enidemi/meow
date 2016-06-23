require('./test-utils.js')

var driver = init();
createRoom(driver, 'mosomedve');

var driver2 = init();
joinRoom(driver2, 'mosomedve');

var sessionId;

driver.findElement(getwebdriver().By.id('stop')).click();
driver.executeScript('return sessionId')
    .then(function(value) {
        sessionId = value;
    });

changeDirection(driver, getwebdriver().Key.DOWN);
changeDirection(driver2, getwebdriver().Key.UP);

driver.findElement(getwebdriver().By.id('stop')).click();

driver2.wait(function() {
    return driver2.executeScript('return sessionId != ' + sessionId)
        .then(function(value) {
            return value
        });
    }, 10000)

close(driver, driver2);

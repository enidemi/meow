require('./test-utils.js')

var driver = init();
createRoom(driver, 'kiskutya');

var driver2 = init();
joinRoom(driver2, 'kiskutya');

driver2.wait(function() {
    return driver2.findElement(getwebdriver().By.id('canvas')).then(function(webElement) {
            return webElement.getCssValue('display').then(function(value) {
                return value == 'inline-block';
            })
        });
    }, 10000)

close(driver, driver2);

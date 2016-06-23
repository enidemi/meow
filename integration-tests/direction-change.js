require('./test-utils.js')

var driver = init();
createRoom(driver, 'cicakutya');

var driver2 = init();
joinRoom(driver2, 'cicakutya');

changeDirection(driver, getwebdriver().Key.DOWN);

driver2.wait(function() {
    return driver2.executeScript('return snakes[0].direction == "down"')
        .then(function(value) {
            return value
        });
    }, 10000)

close(driver, driver2);

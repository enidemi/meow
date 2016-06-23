var outbox = new ReconnectingWebSocket("ws://"+ location.host + "/submit");

outbox.onclose = function(){
    this.outbox = new WebSocket(outbox.url);
};

$(window).on('beforeunload', function(){
    outbox.send(JSON.stringify({ "close": "close"}))
});

if ($("#canvas")[0] == null) {
    $('body').append('<canvas id="canvas" width="600" height="300"></canvas>');
}
var $canvas = $("#canvas");
$canvas.hide();
var canvas = $canvas[0];
var ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;
var cellSize = 10;

var sessionId = -1;
var game;
var first = false;
var snakes = [];

var player;

var food = new Food(10, 10);
var room_name = "";

outbox.onopen = function(event) {
    sendMessage({ register: true, text: {}, room: "waiting_area" });
}

function startGame(){
    game = setInterval(play, 100);
    play();
    $canvas.show();
}

function resetGame() {
    clearInterval(game);
    addSnakesAndApple();
    sendMessage({ reset: true, text: {}, room: room_name });
}

function addSnakesAndApple() {
    food = new Food(10, 0);

    var snake1 = addSnake(0);
    var snake2 = addSnake(20);
    snakes = [snake1, snake2];

    player = snake1;
}

function addSnake(y) {
    var snake = new Snake();
    snake.createBody(y);
    return snake;
}

function play() {
    if (first == true) {
        update();
        draw();
        sendMessage({ update_all: true });
    } else {
        draw();
    }
}

function update() {
    var snake1Next = snakes[0].createNextCoordinate();
    var snake2Next = snakes[1].createNextCoordinate();

    if (snakes[0].isCollision(snake2Next) || snakes[1].isCollision(snake1Next)) {
        resetGame();
        return;
    }

    for ( var i=0; i < snakes.length; i++ ) {
        if (snakes[i].isOutside(width, height, cellSize)
            || snakes[i].isCollision()) {
            resetGame();
            return;
        }

        if (snakes[i].isEatingFood(food)) {
            snakes[i].grow();
            food.createNew(width, height, cellSize);
        }
        else {
            snakes[i].moveForward();
        }
    }

}

// draw
function draw() {
    ctx.fillStyle = "#AEC6CF";
    ctx.fillRect(0, 0, width, height);

    for (var i=0; i<snakes.length; i++) {
        drawSnake(snakes[i].location);
    }
    drawCell(food.x, food.y);
}

function drawSnake(snake) {
    for(var i = 0; i < snake.length; i++) {
        var c = snake[i];
        drawCell(c.x, c.y);
    }
}

function drawCell(x, y) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
}

function Snake() {
    this.direction = 'right';
    this.location = [];
    this.nextCoordinate = { x: 0, y: 0 };
    this.createBody = function(y) {
        var length = 5;
        this.location = [];
        for (var i = length-1; i>=0; i--) {
            this.location.push({ x: i, y: y });
        };
    };
    this.createNextCoordinate = function() {
        var head = {x: this.location[0].x, y: this.location[0].y};
        switch(this.direction) {
            case "right":
                head.x++;
                break;
            case "left":
                head.x--;
                break;
            case "up":
                head.y--;
                break;
            case "down":
                head.y++;
                break;
            default:
                //
        }
        this.nextCoordinate = head;
        return this.nextCoordinate;
    }
    this.moveForward = function() {
        var last = this.location.pop();
        last.x = this.nextCoordinate.x;
        last.y = this.nextCoordinate.y;
        this.location.unshift(last);
    };
    this.grow = function() {
        var newCell = { x: this.nextCoordinate.x, y: this.nextCoordinate.y };
        this.location.unshift(newCell);
    };
    this.isOutside = function(width, height, cellSize) {
        return this.nextCoordinate.x == -1 || this.nextCoordinate.y == -1
            || this.nextCoordinate.x == width/cellSize || this.nextCoordinate.y == height/cellSize;
    };
    this.isEatingFood = function(food) {
        return food.x == this.nextCoordinate.x && food.y == this.nextCoordinate.y;
    };
    this.isCollision = function(nextCoordinate) {
        if (typeof nextCoordinate == 'undefined')
        {
            nextCoordinate = this.nextCoordinate;
        }
        for (var i = 0; i < this.location.length; i++) {
            if (this.location[i].x == nextCoordinate.x
                && this.location[i].y == nextCoordinate.y) {
                return true;
            }
        }
        return false;
    }
}

function Food(x, y) {
    this.x = x;
    this.y = y;
    this.createNew = function(width, height, cellSize) {
        this.x = Math.round(Math.random() * (width - cellSize) / cellSize);
        this.y = Math.round(Math.random() * (height - cellSize) / cellSize);
    };
}

// click events
$(document).keydown(function(event) {
    if (typeof player == "undefined") {
        return;
    }

    var key = event.which;

    if (key == "37" && player.direction != "right") {
        player.direction = "left";
    }
    else if (key == "38" && player.direction != "down") {
        player.direction = "up";
    }
    else if (key == "39" && player.direction != "left") {
        player.direction = "right";
    }
    else if (key == "40" && player.direction != "up") {
        player.direction = "down";
    }

    sendMessage({update_direction: true})
});

$("#input-form").on("submit", function(event) {
    event.preventDefault();
    var room = $("#input-text")[0].value;
    sendMessage({ register: true, text: {}, room: room });
    $("#input-text")[0].value = "";
});

$("#step").click(function(event) {
    play();
    // outbox.send(JSON.stringify({ text: {first: first, update: true}, room: "snake"}));
});

$("#stop").click(function(event) {
    if (game) {
        console.log('stop', new Date().getTime());
        clearInterval(game);
        game = null;
    }
    else {
        console.log('start', new Date().getTime());
        game = setInterval(play, 100);
    }
    // outbox.send(JSON.stringify({ text: {first: first, update: true}, room: "snake"}));
});

$("#room-list").on("click", ".room", function(event) {
    var room = $(event.target).data("name");
    sendMessage({ register: true, text: {}, room: room })
})

// send and receive
function sendMessage(messageData) {
    var messageBase = {
        text: {
        first: first,
        snakes: snakes,
        food: food,
        sessionId: sessionId },
        room: room_name
    };

    var message = $.extend({}, messageBase, messageData);
    outbox.send(JSON.stringify(message));
    console.log('send ', new Date().getTime(), message)
}

outbox.onmessage = function(message) {
    var data = JSON.parse(message.data);
    console.log('received', new Date().getTime(), data.text);
    if (data.text == "first") {
        first = true;
        addSnakesAndApple();
    }
    if (data.text.start == true) {
        room_name = data.text.room_name;
        sessionId = data.text.sessionId;
        if (first == true) {
            sendMessage({ update_all: true });
            // startGame();
        } else {
            $("#step").hide();
            $("#stop").hide();
        }
        startGame();
    }
    if (data.update_all == true && data.text.sessionId == sessionId) {
        if (first == false) {
            snakes = data.text.snakes;
            food = data.text.food;
            player = snakes[1];
            play();
        } else {
            player = snakes[0];
        }
    }
    if (data.update_direction == true && data.text.sessionId == sessionId) {
        if (first != data.text.first) {
            snakes[1].direction = data.text.snakes[1].direction;
        }
    }
    if (data.text.rooms != null) {
        $("#room-list").empty();
        $.each(data.text.rooms, function(index, value) {
            if (value != "waiting_area" && data.text.player_count[index] == 1) {
                $("<li>").attr("class", 'room')
                    .text(value)
                    .data("name", value)
                    .appendTo("#room-list");
            }
        });
    }
}

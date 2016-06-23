describe("Food", function() {
    var food;

    beforeEach(function() {
        food = new Food();
    });

    it("adds random food", function() {
        food.createNew(10, 10, 1);
        expect(food.x).toBeGreaterThan(-1);
        expect(food.x).toBeLessThan(10);

        expect(food.y).toBeGreaterThan(-1);
        expect(food.y).toBeLessThan(10);
    });
});

describe("Snake", function() {
    var snake;

    beforeEach(function() {
        snake = addSnake(0);
    });

    it("creates a new snake", function() {
        expect(snake.direction).toEqual("right");
        expect(snake.location.length).toEqual(5);
    });

    it("when eating a food the size changes", function() {
        snake.createNextCoordinate();
        snake.grow();
        expect(snake.location.length).toEqual(6);
    });
});

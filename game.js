//Basic constructor for a game object
const game = function(id) {
    this.id = id;
    this.playerOne = null;
    this.playerTwo = null;
    this.done = false;

    this.setId = function(id) {
        this.id = id;
    }

    this.setPlayerOne = function(player) {
        this.playerOne = player;
    }

    this.setPlayerTwo = function(player) {
        this.playerTwo = player;
    }

    this.addPlayer = function(player) {
        if(this.playerOne == null) {
            this.playerOne = player;
            return 1;
        } else if(this.playerTwo == null) {
            this.playerTwo = player;
            return 2;
        } else {
            return 0;
        }
    }
};

module.exports = game;
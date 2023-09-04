//Basic constructor of a game
function Game(socket) {
    //Column is the first index, row is the second index
    this.board = [
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0]
    ];
    //Web socket of this game, whos turn it is, the player type, the opponent type
    //The total number of pieces played, the time elapsed for the game and if the game has finished
    this.socket = socket;
    this.turn = 1;
    this.player = 0;
    this.oppo = 0;
    this.pieces = 0;
    this.time = [0, 0];
    this.done = true;

    this.setBoard = function(board) {
        this.board = board;
    }

    this.setSocket = function(socket) {
        this.socket = socket;
    }

    //Set player, the opponent must be of the other type
    this.setPlayer = function(player) {
        this.player = player;
        if(player == 1) {
            this.oppo = 2;
        } else {
            this.oppo = 1;
        }
    }

    this.setOppo = function(oppo) {
        this.oppo = oppo;
    }

    this.setTime = function(time) {
        this.time = time;
    }

    //Places a piece at the lowest possible position in the column, returns -1 if impossible
    this.placePiece = function(column) {
        for(let i = 5; i >= 0; i--) {
            if(this.board[column][i] == 0) {
                this.board[column][i] = this.turn;
                this.pieces++;
                //Returns the row of the piece played
                return i;
            }
        }
        return -1;
    }

    //Places the piece on the board, used when message is gotten of an opponent playing
    this.setPiece = function(row, column) {
        this.board[column][row] = this.turn;
        this.pieces++;
        return row;
    }

    //Sees if any player has won
    this.checkWin = function(row, column) {
        //Horizontal Check 
        for (let j = 0; j<3 ; j++ ){
            for (let i = 0; i<7; i++){
                if (this.board[i][j] != 0 && this.board[i][j] == this.board[i][j+1] && this.board[i][j+2] == this.board[i][j] && this.board[i][j+3] == this.board[i][j]){
                    return true;
                }           
            }
        }
        //Vertical Check
        for (let i = 0; i<4; i++ ){
            for (let j = 0; j<6; j++){
                if (this.board[i][j] != 0 && this.board[i+1][j] == this.board[i][j] && this.board[i+2][j] == this.board[i][j] && this.board[i+3][j] == this.board[i][j]){
                    return true;
                }           
            }
        }
        //Left to Right Diagonal Check
        for (let i=3; i<6; i++){
            for (let j=0; j<4; j++){
                if (this.board[i][j] != 0 && this.board[i-1][j+1] == this.board[i][j] && this.board[i-2][j+2] == this.board[i][j] && this.board[i-3][j+3] == this.board[i][j])
                    return true;
            }
        }
        //Right to Left Diagonal Check
        for (let i=3; i<7; i++){
            for (let j=3; j<6; j++){
                if (this.board[i][j] != 0 && this.board[i-1][j-1] == this.board[i][j] && this.board[i-2][j-2] == this.board[i][j] && this.board[i-3][j-3] == this.board[i][j])
                    return true;
            }
        }
        return false;
    }

    //Update the game when the player has played, returns [next turn, row of piece]
    this.updateGame = function(row, column) {
        //Check if it is their turn and the game is not over
        if(this.turn == this.player && !this.done) {
            //Try to place the piece in the column
            let r = this.placePiece(column);
            if(r != -1) {
                //Create a message of the piece played
                let msg = Messages.O_PLAYED;
                msg.data = [r, column];
                //Send message of piece played to the server
                this.socket.send(JSON.stringify(msg));
                //Check if the player has won
                if(this.checkWin(r, column)) {
                    //Game won function called
                    this.gameWon();
                    //Return winner
                    return [this.turn, r];
                } else {
                    //Game is not over, swap turns and return values
                    if(this.turn == 1) {
                        this.turn = 2;
                        return [1, r];
                    } else {
                        this.turn = 1;
                        return [2, r];
                    }
                }
            }
        }
        //Unsuccessful play
        return [-1, -1];
    }

    //Opponent has played a piece, return [next turn, row of piece played]
    this.opponentPlay = function(row, column) {
        //Check if it is their turn and the game is no over
        if(this.turn == this.oppo && !this.done) {
            //Place the piece on the board
            let r = this.setPiece(row, column);
            //If the piece has been successfully placed
            if(r != -1) {
                //If won, run game won function and return winner
                if(this.checkWin(r, column)) {
                    this.gameWon();
                    return [this.turn, r];
                } else {
                    //Otherwise swap the turn over
                    if(this.turn == 1) {
                        this.turn = 2;
                        return [1, r];
                    } else {
                        this.turn = 1;
                        return [2, r];
                    }
                }
            }
        }
        return [-1, -1];
    }

    //Game won function, shows it to the player and sends it to the server
    this.gameWon = function() {
        //Reports to the player who won the game
        console.log("Player " + this.turn + " wins!");
        let winner = document.getElementById("center");
        winner.style.display = "block";
        //Creates a message for the server about who won and how many pieces were played
        let msg = Messages.O_GAME_WON_BY;
        msg.tokens = this.pieces;
        if(this.turn == 1) {
            winner.innerText = "Player One Wins!";
            msg.data = 1;
        } else {
            winner.innerText = "Player Two Wins!";
            msg.data = 2;
        }
        //Send the message to the server and end the game
        this.socket.send(JSON.stringify(msg));
        this.done = true;
    }

    this.updateSide = function() {
        //Update side info when a game update occurs
        let token = document.getElementById("player");
        let turn = document.getElementById("turn");
        if(this.turn == 1) {
            token.classList.add("playerOne");
            token.classList.remove("playerTwo");
            turn.innerText = "One";

        } else {
            token.classList.add("playerTwo");
            token.classList.remove("playerOne");
            turn.innerText = "Two";
        }
        let played = document.getElementById("pieces");
        played.innerText = this.pieces;
    }

    this.updateTime = function() {
        //Starts timer when the game starts
        if(!this.done) {
            let timer = document.getElementById("time");
            this.time[1] += 1;
            if(this.time[1] == 60) {
                this.time[0]++;
                this.time[1] = 0;
            }
            let sec = this.time[1];
            let min = this.time[0];
            if (sec < 10 || sec == 0) {
                sec = '0' + sec;
            }
            if (min < 10 || min == 0) {
                min = '0' + min;
            }
            timer.innerHTML = min + ':' + sec;
        }
        setInterval(function(){this.updateTime}, 1000);
    }

    //Tells the player that the other player left the game
    this.playerLeft = function() {
        let center = document.getElementById("center");
        center.style.display = "block";
        center.innerText = "Other player quit, You Win!";
    }
}

//Code to fun on start up of the page
(function initialize() {
    //Create websocket to connect to the server
    const socket = new WebSocket("ws://localhost:3000");
    //Set row anc column values for showing tokens
    const rows = ["rowone", "rowtwo", "rowthr", "rowfou", "rowfiv", "rowsix"];
    const cols = ["colone", "coltwo", "colthr", "colfou", "colfiv", "colsix", "colsev"];
    //Make a local game with the socket for communication
    const game = new Game(socket);
    //Start the timer
    setInterval(function(){game.updateTime()}, 1000);
    //Get all token places on the board
    const tokens = document.getElementsByClassName("token");
    //Add event listener for each token
    for(let i = 0; i < tokens.length; i++) {
        tokens.item(i).addEventListener("click", function() {
            //Update the game based on the place selected
            let values = game.updateGame(this.dataset.row-1, this.dataset.column-1);
            //Get values
            let worked = values[0];
            let row = values[1];
            let col = this.dataset.column-1;
            //If a successful play
            if(worked != -1) {
                //Show the new token with the correct type
                let token = document.getElementsByClassName("token " + cols[col] + " " + rows[row]).item(0);
                if(worked == 1) {
                    token.classList.add("playerOne");
                } else {
                    token.classList.add("playerTwo");
                }
                //Update side info
                game.updateSide();
            }
            //If game finished and either player leaves, close the socket
            if(game.done && (game.playerOne == 0 || game.playerTwo == 0)) {
                game.socket.close();
            }
        });
    }
    //On message from the server
    socket.onmessage = function(event) {
        let msg = JSON.parse(event.data);
        //Get player type, other player must be of that type then
        if(msg.type == Messages.T_PLAYER_TYPE) {
            if(game.player == 0) {
                game.setPlayer(msg.data);
            } else {
                game.done = false;
                document.getElementById("center").style.display = "none";
            }
        }
        //Other player placed a token, got place on board
        if(msg.type == Messages.T_PLACED) {
            console.log("Got message of PLACED row " + msg.data[0] + " column " + msg.data[1]);
            //If game has not been started, start the game (Occurs when player is player two)
            if(game.done) {
                game.done = false;
                document.getElementById("center").style.display = "none";
            }
            //Get place of the opponents piece
            let place = msg.data;
            let values = game.opponentPlay(place[0], place[1]);
            let worked = values[0];
            let row = place[0];
            let col = place[1];
            if(worked != -1) {
                //If a successful place, update the game board with the new token
                let token = document.getElementsByClassName("token " + cols[col] + " " + rows[row]).item(0);
                if(worked == 1) {
                    token.classList.add("playerOne");
                } else {
                    token.classList.add("playerTwo");
                }
                //Update side info
                game.updateSide();
            }
        }
        //Game aborted
        if(msg.type == Messages.S_GAME_ABORTED) {
            game.playerLeft();
            game.done = true;
            this.socket.close();
        }
    };

    //On opening of the socket, send a message to confirm that it is open
    socket.onopen = function () {
        socket.send("{}");
    };

    //If the socket is closed and the game is not finished, the other player must have left
    socket.onclose = function() {
        if(!game.done) {
            game.playerLeft();
        }
    }

    //On error do something (not needed here)
    socket.onerror = function() {};
})();
//Messages between the client and server
(function (exports) {
    /*
     * Client to server: game is complete, the winner is ... and how many tokens were played in the game
     */
    exports.T_GAME_WON_BY = "GAME-WON-BY";
    exports.O_GAME_WON_BY = {
      type: exports.T_GAME_WON_BY,
      data: null,
      tokens: 0
    };
  
    /*
     * Server to client: abort game (e.g. if second player exited the game)
     */
    exports.O_GAME_ABORTED = {
      type: "GAME-ABORTED",
    };
    exports.S_GAME_ABORTED = JSON.stringify(exports.O_GAME_ABORTED);
  
    /*
     * Server to client: Token is placed, [row, column]
     */
    exports.T_PLACED = "PLACED";
    exports.O_PLACED = { 
        type: exports.T_PLACED,
        data: null,
    };
  
    /*
     * Server to client: set as player A
     */
    exports.T_PLAYER_TYPE = "PLAYER-TYPE";
    exports.O_PLAYER_ONE = {
      type: exports.T_PLAYER_TYPE,
      data: 1,
    };
    exports.S_PLAYER_ONE = JSON.stringify(exports.O_PLAYER_ONE);
  
    /*
     * Server to client: set as player B
     */
    exports.O_PLAYER_TWO = {
      type: exports.T_PLAYER_TYPE,
      data: 2,
    };
    exports.S_PLAYER_TWO = JSON.stringify(exports.O_PLAYER_TWO);
  
    /*
     * Player B to server OR server to Player A: Token played
     */
    exports.T_PLAYED = "PLAYED";
    exports.O_PLAYED = {
      type: exports.T_PLAYED,
      data: null,
    };
  })(typeof exports === "undefined" ? (this.Messages = {}) : exports);
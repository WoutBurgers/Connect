const express = require("express");
const http = require("http");
const ws = require("ws");
const messages = require("./public/javascripts/messages");
const stats = require("./stats");
const Game = require("./game");
const port = process.argv[2];
const app = express();
const routes = require("./routes/index");


//Creating the server
app.use(express.static(__dirname + "/public"));
const server = http.createServer(app);


//Setup the paths
app.get("/play", routes);
app.get("/", routes);

//Create the set of web sockets that make up the different games
const websockets = {};
const wss = new ws.Server({ server });
//Id of the users, and unique id for the games, creating the first game
let currentId = 0;
let currentGame = new Game(stats.totalGames++);


//Set up connections for the users, starting on server startup
wss.on("connection", function(ws) {
  //Connection of the user, set id to a unique id
  const con = ws;
  con["id"] = currentId++;
  //Set player into game, taking player one then player two
  const playerType = currentGame.addPlayer(con);
  //Add game to the list of web sockets
  websockets[con["id"]] = currentGame;
  console.log("Player " + playerType + ": " + con["id"] + " in game " + currentGame.id);
  //If playerone, try to tell the other player that you have joined
  if(playerType == 1) {
    con.send(messages.S_PLAYER_ONE);
    if(currentGame.playerTwo != null) {
      try {
        currentGame.playerTwo.send(messages.S_PLAYER_ONE);
      } catch(e) {
        console.log("Error with telling other player of join");
      }
    }
    //if player two, try to tell the other player that you have joined
  } else if(playerType == 2) {
    con.send(messages.S_PLAYER_TWO);
    if(currentGame.playerOne != null) {
      try {
        currentGame.playerOne.send(messages.S_PLAYER_TWO);
      } catch(e) {
        console.log("Error with telling other player of join");
      }
    }
  }

  //If the game now has two players, create a new game
  if(currentGame.playerOne != null && currentGame.playerTwo != null) {
    currentGame = new Game(stats.totalGames++);
  }
  //When server gets a message, parse it and put it in the console
  con.on("message", function incoming(inc) {
    const msg = JSON.parse(inc.toString());
    console.log(msg);
    //Get current game
    const game = websockets[con["id"]];
    //Send played token to other player
    if(msg.type == messages.T_PLAYED) {
      console.log("Player id: " + con["id"] + " played row " + msg.data[0] + " and column " + msg.data[1]);
      //Transfer message type to a client message
      let out = messages.O_PLACED;
      out.data = msg.data;
      let output = JSON.stringify(out);
      //Send message to the other player
      if(playerType == 1) {
        game.playerTwo.send(output);
      } else {
        game.playerOne.send(output);
      }
    }
    //Send other player that they won
    if(msg.type == messages.T_GAME_WON_BY) {
      //If player one has message
      if(playerType == 1) {
        //Send to other player
        game.playerTwo.send(inc);
        //Add tokens to the stats
        stats.tokensPlaced += msg.tokens;
        //If the player who won was player one, add to stats
        if(msg.data == 1) {
          stats.firstWins++;
        }
      } else {
        //Send to other player
        game.playerOne.send(inc);
      }
    }
  });
  //On connection close
  con.on("close", function(code) {
    //Player disconnected
    console.log("Player " + con["id"] + " has disconnected");
    const game = websockets[con["id"]];
    let msg = messages.S_GAME_ABORTED;
    //Finished the game
    game.done = true;
    //Try to tell each player that the game has finished and close the connection
    try {
      game.playerOne.send(JSON.stringify(msg));
      game.playerOne.close();
      game.playerOne = null;
    } catch(e) {
      console.log("Player One Closed: " + e);
    }
    try {
      game.playerTwo.send(JSON.stringify(msg));
      game.playerTwo.close();
      game.playerTwo = null;
    } catch(e) {
      console.log("Player Two Closed: " + e);
    }
  });
});

//Listen on port for connections
server.listen(port);
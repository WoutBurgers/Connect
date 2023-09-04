const express = require('express');
const router = express.Router();
const stats = require("../stats");

//Connection to the /play path
router.get('/play', function(req, res) {
  res.sendFile('game.html', { root: './public' });
});

//Render the splash screen using the splash.ejs and import the stats of the server
router.get('/', function(req, res) {
  res.render("splash.ejs", {
    totalGames: stats.totalGames - 1, tokensPlaced: stats.tokensPlaced, firstWins: stats.firstWins
  })
});
module.exports = router;

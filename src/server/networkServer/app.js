const cors = require('cors');
const express = require("express"); 
const path = require('path');
const bodyParser = require('body-parser');

const test_levels_v1 = require("../gameLogic/api/v1/test_levels.service.js");
const test_levels_beta = require("../gameLogic/api/beta/test_levels.service.js");

const LogRocket = require('logrocket');
LogRocket.init('9o6vsp/enolapoc0');
const app = express(); // Initializing Express App

app.use('/api/v1', express.static(path.join(__dirname, '../../api/v1/public')))
app.use('/api/beta', express.static(path.join(__dirname, '../../api/beta/public')))

app.use(bodyParser.json());
app.use(cors({
	origin: '*',
	methods: ['GET', 'POST']
}));

app.post('/v1/generate_level', function(req, res) {
  const difficulty = req.body.difficulty;
  // console.log(difficulty);
  board = test_levels_v1.retrieve_level(difficulty);
  console.log(board);
  res.send(JSON.stringify(board));
});

app.post('/beta/generate_level', function(req, res) {
  const difficulty = req.body.difficulty;
  // console.log(difficulty);
  board = test_levels_beta.retrieve_level(difficulty);
  console.log(board);
  res.send(JSON.stringify(board));
});

app.post('/register_user', function(req, res) {
  const email = req.body.email;
  console.log(email);
  res.send();
});

app.listen(3000, ()=> console.log("App Listening on port 3000"));

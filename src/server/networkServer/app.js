const cors = require('cors');
const express = require("express"); 
const path = require('path');
const bodyParser = require('body-parser');
const test_levels = require("../gameLogic/test_levels.service.js");
// const LogRocket = require('logrocket');
// LogRocket.init('9o6vsp/enolapoc0');
const app = express(); // Initializing Express App

app.use('/', express.static(path.join(__dirname, '../../public')))

app.use(bodyParser.json());
app.use(cors({
	origin: '*',
	methods: ['GET', 'POST']
}));

app.post('/generate_level', function(req, res) { 
  const difficulty = req.body.difficulty;
  // console.log(difficulty);
  board = test_levels.retrieve_level(difficulty);
  console.log(board);
  res.send(JSON.stringify(board));
});

app.post('/register_user', function(req, res) {
  const email = req.body.email;
  console.log(email);
  res.send();
});

app.listen(3300, ()=> console.log("App Listening on port 3000"));

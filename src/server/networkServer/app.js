const cors = require('cors');
const express = require("express"); 
const path = require('path');
const bodyParser = require('body-parser');
const picwiz_levels = require("../gameLogic/picwiz_levels.service.js");
// const functions = require("firebase-functions");
const app = express(); // Initializing Express App

app.use('/', express.static(path.join(__dirname, '../../public')))

app.use(bodyParser.json());
app.use(cors({
	origin: '*',
	methods: ['GET', 'POST']
}));

app.post('/get_level', function(req, res) { 
  // console.log(difficulty);
  board = picwiz_levels.retrieve_level();
  // console.log(board);
  res.send(JSON.stringify(board));
});

app.post('/register_user', function(req, res) {
  const email = req.body.email;
  console.log(email);
  res.send();
});

app.listen(8080, ()=> console.log("App Listening on port 8080"));
// exports.api = functions.https.onRequest(app);

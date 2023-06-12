const cors = require('cors');
const express = require("express"); 
const path = require('path');
const bodyParser = require('body-parser');
const test_levels = require("../gameLogic/test_levels.service.js");
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

app.listen(3000, ()=> console.log("App Listening on port 3000"));

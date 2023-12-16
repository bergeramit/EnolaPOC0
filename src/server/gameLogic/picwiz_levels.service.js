const fs = require('fs');

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
var levels;

fs.readFile("../gameLogic/resources/pic_quiz_levels.json", "utf8", (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err);
        return;
    }
    levels = JSON.parse(jsonString);
    // console.log(levels.length);
    // console.log(levels[levels.length-1]);
});

function retrieve_level() {
    let date = new Date()
    console.log("Level for " + MONTH_NAMES[date.getMonth()] + " " + date.getDay() + "th")
    let selectedLevel = levels[date.getDay() % levels.length]
    return {"imageURL": selectedLevel[0], "title": selectedLevel[1],"phrase": selectedLevel[2]};
}

module.exports.retrieve_level = retrieve_level;
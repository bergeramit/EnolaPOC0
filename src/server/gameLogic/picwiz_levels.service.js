const fs = require('fs');

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];


var levels;

function compareFn(a, b) {
    if (a[0] < b[0]) {
        return -1;
    }
    if (a[0] > b[0]) {
        return 1;
    }
    return 0;
}

fs.readFile("../gameLogic/resources/easy_levels_dataset.json", "utf8", (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err);
        return;
    }
    levels = JSON.parse(jsonString);
    levels.sort(compareFn);
    // console.log(levels.length);
    // console.log(levels[levels.length-1]);
});

function retrieve_level() {
    let date = new Date()
    console.log("Level for " + MONTH_NAMES[date.getMonth()] + " " + date.getDay() + "th")
    return {"level": levels[date.getDay()][1]};
}

module.exports.retrieve_level = retrieve_level;
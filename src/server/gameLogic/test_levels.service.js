const fs = require('fs');

var levels;
var metaLevels;
var currentMetaLevel;

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max-min)) + min;
}

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
    console.log(levels.length);
    console.log(levels[levels.length-1]);
});

fs.readFile("../gameLogic/resources/easy_meta_levels.json", "utf8", (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err);
        return;
    }
    metaLevels = JSON.parse(jsonString);
    console.log(metaLevels.length);
    console.log(metaLevels[metaLevels.length-1]);
});

function retrieve_level(difficulty) {
    console.log(difficulty)
    const diff_to_range = {
        "Easy": [0, levels.length-1]
    }
    difficulty_range = diff_to_range[difficulty]
    var lower = difficulty_range[0];
    var upper = difficulty_range[1];
    var level_difficulty = getRandomArbitrary(lower, upper);
    
    for (let i=0;i<metaLevels.length;i++) {
        console.log(metaLevels[i][0]);
        if (metaLevels[i][0] == levels[level_difficulty][1][0]) {
            currentMetaLevel = metaLevels[i]
        }
    }
    
    return {"level": levels[level_difficulty][1], "metaLevel": currentMetaLevel};
}

module.exports.retrieve_level = retrieve_level;
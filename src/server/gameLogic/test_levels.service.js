const fs = require('fs');

var levels;

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

function retrieve_level(difficulty) {
    const diff_to_range = {
        "Easy": [0, levels.length / 4],
        "Medium": [Math.floor(levels.length / 4),Math.floor(levels.length / 2)],
        "Hard": [Math.floor(levels.length / 2), Math.floor(3 * levels.length / 4)],
        "Very Hard": [Math.floor(3 * levels.length / 4), levels.length-1],
    }
    difficulty_range = diff_to_range[difficulty]
    console.log(difficulty_range);
    var lower = difficulty_range[0];
    var upper = difficulty_range[1];
    console.log(lower);
    console.log(upper);
    var level_difficulty = getRandomArbitrary(lower, upper);
    console.log(level_difficulty)

    return levels[level_difficulty][1];
}

module.exports.retrieve_level = retrieve_level;
const fs = require('fs');
const schedule = require('node-schedule');

const MONTH_NAMES = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const BG_PATH = '../../public/img/LevelsBackground/bg.png'
var levels;
let currentDate;
let selectedLevel;

fs.readFile("../gameLogic/resources/pic_quiz_levels.json", "utf8", (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err);
        return;
    }
    levels = JSON.parse(jsonString);
    updateDailyChallenge();
    // console.log(levels.length);
    // console.log(levels[levels.length-1]);
});

function updateDailyChallenge() {
        // Synchronously delete a file
        try {
            currentDate = new Date()
            console.log("Level for " + MONTH_NAMES[currentDate.getMonth()] + "-" + currentDate.getDate())
            selectedLevel = levels[currentDate.getDate() % levels.length]
            if (fs.existsSync(BG_PATH)) {
                fs.unlinkSync(BG_PATH);
            }
            console.log('File deleted!');
            fs.copyFileSync('../../public/img/LevelsBackground/' + selectedLevel[0], BG_PATH)
        } catch (err) {
            // Handle specific error if any
            console.error(err.message);
        }
}

schedule.scheduleJob('0 0 * * *', updateDailyChallenge) // run everyday at midnight

function retrieve_level() {
    // updateDailyChallenge()
    return {"imageURL": selectedLevel[0],
            "phrase": selectedLevel[0].split('.')[0],
            "title": selectedLevel[1],
            "hints": selectedLevel[2],
            "color": selectedLevel[3]};
}


module.exports.retrieve_level = retrieve_level;
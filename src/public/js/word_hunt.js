const BASE_URL = "http://64.226.100.123/"
//const BASE_URL = "http://127.0.0.1:3000/";
const generateLevelPostURL = BASE_URL + "generate_level/";
//const generateLevelPostURL = 'generate_level/'
const registerPostURL = BASE_URL + "register_user/";
const timeoutBetweenLevels = 3000
const difficulty = 'Easy'
const ENTER_KEY_NAME = "Enter"
const SPACE_KEY_NAME = "space"
const BACKSPACE_KEY_NAME = "Backspace"
const botGuessInterval = [7000, 8000, 9000, 10000]
const botAngryMsgs = [
    "I had enough",
    "jesus these levels man...",
    "did someone ever pass round 10??",
    "...",
    "well...",
    "semek",
    "this level is impossible!",
    "stuck on this level forever!",
    "why is this level so hard?",
    "i'm about to give up!",
    "this level is driving me crazy!",
    "i've tried everything, but no luck!",
    "is this level even beatable?",
    "so close, yet so far!",
    "i can't believe how difficult this is!",
    "need a break from this madness!",
    "this lvl sux! noob trap",
  "stuck 4eva! rage quit",
  "y is this lvl so hrd? smh",
  "i'm about 2 give up! fml",
  "this lvl is drivin me cray! argh",
  "tried evrythng, no luck! srsly",
  "is this lvl even possible? facepalm",
  "so close, yet so far! fml",
  "can't believe how difficult this is! wth",
  "need a break from this madness! gtfo",
]
const botCockyMsgs = [
    "do you guys even try?",
    "I M a God",
    "I'll slow down for you guys",
    "i'm unstoppable!",
  "crushing it today!",
  "can't be beaten!",
  "unleashing my ultimate power!",
  "domination mode activated!",
  "no one can match my skills!",
  "i'm on fire!",
  "victory after victory!",
  "raining destruction on my opponents!",
  "they can't handle my awesomeness!",
  "i'm unstoppable! #rekt",
  "crushing it 2day! gg ez",
  "can't be beaten! git gud",
  "unleashing my ult pwr! 1337",
  "domination mode activated! pwned",
  "no one can match my skills! l33t",
  "i'm on fire! lit af",
  "victory after victory! ownage",
  "raining destruction on my opponents! gg wp",
  "they can't handle my awesomeness! pro player",
]
const EXTRA_CHAT_MESSAGE_DELAY = 1000
const PIP_CHAT_MESSAGE_DELAY = 500
const BEGINNING_ROUND_LETTER = `
<div class="overlap-group">
    <div class="begin-in-letter t valign-text-middle gilroy-extra-extra-bold-haiti-20-9px"></div>
</div>
`
const LETTER_TEMPLATE = `
<div class="overlap-group-1">
    <div class="price valign-text-middle gilroy-extra-extra-bold-gunsmoke-12-1px top-letter">
    </div>
</div>
`
const EMPTY_TILE = `
<article class="tail">
    <div class="tail-1">
        <div class="highlights"><img class="intersect" src="img/intersect-1.svg" alt="Intersect" /></div>
    </div>
</article>
`
const FILLED_TILES = `
<article class="tail">
    <div class="letter-tile">
        <div class="overlap-group-3">
        <div class="tile-bg">
            <div class="tile-fill"></div>
        </div>
        <div class="letter-input letter-1 valign-text-middle gilroy-extra-extra-bold-cherry-pie-23-7px"></div>
        </div>
    </div>
</article>
`
const CHAT_MESSAGE = `
    <div class="chat-row-icon"></div>
    <div class="chat-row-username-and-message">
        <div class="chat-row-username">You</div>
        <div class="chat-row-message correct-word">Correct</div>
    </div>
`
const CHAT_NICE_TRY_ADDON = `
<div class="chat-points-1">
    <div class="nice-try-name valign-text-middle">NICE TRY!</div>
    <div class="nice-try-score valign-text-middle nice-try-score">+1</div>
    <img class="star-6" src="img/star-6.svg" alt="Star 6" />
</div>
`
const CHAT_CORRECT_ADDON = `
<div class="chat-points-1 chat-points-correct-word">
    <div class="nice-try-name valign-text-middle">PERFECT!</div>
    <div class="nice-try-score valign-text-middle nice-try-score">+1</div>
    <img class="star-6" src="img/star-6.svg" alt="Star 6" />
</div>
`
const FULL_TILES_SIZE = "17rem"
const FULL_CHAT_SIZE = "10rem"
const BROWSER_TILES_SIZE = "13.5rem" 
const BROWSER_CHAT_SIZE = "8rem"
const GAME_TIMER_TIMEOUT = 120 // 1 for testing

class Player {
    constructor(username, id, icon, color, textColor) {
        this.id = id
        this.username = username
        this.color = color
        this.textColor = textColor
        this.icon = icon
        this.attempts = 0
        this.sequentialMisses = 0
        this.sequentialHits = 0
        this.score = 0
    }

    trashTalk() {
        if (this.attempts > 10) {
            appendMessage(this, botAngryMsgs[Math.floor(Math.random()*botAngryMsgs.length)], false, false, EXTRA_CHAT_MESSAGE_DELAY)
        }
        if (this.sequentialMisses >= 2) {
            appendMessage(this, botAngryMsgs[Math.floor(Math.random()*botAngryMsgs.length)], false, false, EXTRA_CHAT_MESSAGE_DELAY)
            this.sequentialMisses = 0
        }
        if (this.sequentialHits >= 2) {
            appendMessage(this, botCockyMsgs[Math.floor(Math.random()*botCockyMsgs.length)], false, false, EXTRA_CHAT_MESSAGE_DELAY)
            this.sequentialHits = 0
        }
    }

    updateDOMScore(value) {
        this.score += value
        if (this.id === "PIP") {
            return
        }
        let scoreElement = document.getElementById(this.id +"-score")
        scoreElement.textContent = this.score

        groupScore += value

        if (this.id === "player-you") {
            groupScoreElement.textContent = this.score
        }

        setScaleAnimation(scoreElement)
    }
}

/* ---------------------- GlobalsDefines ---------------------- */

let finishedLevels = []
let pipPlayer = new Player("PIP", "PIP", "url('img/pip_icon.png')", "#1abc9c", "black")
let youPlayer = new Player("you", "player-you", "url('img/user-fill.svg')", "#ffd232", "black")
let timeLeft
let CurrentLevel
let chatInput
let metaCurrentLevel
let deviceId
let correctlyGuessed = []
let validGuessed = []
let availableLetters
let round = 0
let freezeGame = true
let groupScore
let groupScoreElement
let shouldWaitForStartUp
let registeredAlready = false

/* ---------------------- /GlobalsDefines ---------------------- */


/* ---------------------- GameLogic ---------------------- */

function resetGame() {
    round = 0
    streak = 1
    playersList.forEach((player) => {
        player.currentLevelAttempts = 0
        player.sequentialHits = 0
        player.sequentialMisses = 0
        player.score = 0
        player.updateDOMScore(0)
    })

    groupScore = 0
    groupScoreElement.textContent = 0

}

function checkGuess (player, guess) {
    for (let i = 0; i < CurrentLevel.length; i++) {
        //console.log('Checks: CurrentLevel[1][i]: ' + CurrentLevel[i] + ' === ' + guess)
        if (CurrentLevel[i] === guess && !correctlyGuessed.includes(guess)) {
            if (player.username === "you") {
                window.LogRocket.track('UserCorrectGuess', {round: round, score: player.score});    
            }
            correctlyGuessed.push(guess)
            // console.log('Success! at row: ' + (i + 1))
            streak += 1
            
            const row = document.getElementsByClassName('word')[i]
            for (let j = 0; j < row.children.length; j++) {
                // place word correctly!
                row.children[j].innerHTML = FILLED_TILES
                const currentTile = row.children[j].getElementsByClassName("letter-input")[0]
                currentTile.textContent = CurrentLevel[i][j].toUpperCase()  
                const backgroundFill = row.children[j].getElementsByClassName("tile-fill")[0]
                backgroundFill.style.backgroundColor = player.color
            }
            setScaleAnimation(row)

            if (correctlyGuessed.length < CurrentLevel.length) {
                // There are still empty rows
                return true
            }
            // generate new level
            //appendMessage('WordHunt', 'Great job!', false)
            //appendMessage('WordHunt', 'Get Ready for level ' + (levelNumber+1))
            freezeGame = true
            window.LogRocket.track('FinishedLevel', {round: round, score: youPlayer.score, groupScore: groupScore});
            setTimeout(() => {
                displayFinishedLevel()
            }, 1000)
            return true
        }
    }
    streak = 1
    return false
}

function countLetter (letter, str) {
    let letterCount = 0
    const lowercaseLetter = letter.toLowerCase()
    const lowercaseString = str.join("").toLowerCase()
    
    for (let i = 0; i < lowercaseString.length; i++) {
        if (lowercaseString[i] === lowercaseLetter) {
            letterCount++
        }
    }
    return letterCount
}

function checkNiceTry(player, message) {
    if (metaCurrentLevel.includes(message) && !validGuessed.includes(message)) {
        if (!correctlyGuessed.includes(message)) {
            if (player.username === "you") {
                appendMessage(pipPlayer, "'"+ message + "' is valid but not here!", false, false, PIP_CHAT_MESSAGE_DELAY)
            }
            return true
        } else {
            if (player.username === "you") {
                appendMessage(pipPlayer, "'"+ message + "' was already solved!", false, false, PIP_CHAT_MESSAGE_DELAY)
            }
        }
    }
    return false
}

function handleSubmitChatMessage(message) {
    if (message.length <= 0) {
        return
    }

    if (message.toLowerCase() === "daniel trau"
        || message.toLowerCase() === "dvir modan"
        || message.toLowerCase() === "amit berger") {
            appendMessage(pipPlayer, message + " is my father!", false, false, 0)
        return
    }

    if (!checkGuess(youPlayer, message)) {
        /* Guessed Wrong - Check if close */
        youPlayer.sequentialHits = 0
        if (checkNiceTry(youPlayer, message)) {
            validGuessed.push(message)
            appendMessage(youPlayer, message, false, true, 0)
        } else {
            appendMessage(youPlayer, message, false, false, 0)
        }
    } else {
        appendMessage(youPlayer, message, true, false, 0)
        youPlayer.sequentialHits += 1
        if (youPlayer.sequentialHits > 2) {
            appendMessage(pipPlayer, "You're on a roll!", false, false, EXTRA_CHAT_MESSAGE_DELAY)
            youPlayer.sequentialHits = 0
        }
        // totalScore += 10 * currentStreak
        // updateScore()
    }
}

function addKeyToInput (pressedKey, onScreen) {
    const guess = document.getElementById('chat-input')
    if (pressedKey === BACKSPACE_KEY_NAME && onScreen) {
        guess.value = guess.value.substring(0, guess.value.length - 1)
        return
    }

    if (pressedKey === SPACE_KEY_NAME && onScreen) {
        guess.value = guess.value + " "
        return
    }
    
    if (pressedKey === ENTER_KEY_NAME) {
        handleSubmitChatMessage(guess.value)
        guess.value = ''
        return
    }

    if (onScreen) {
        guess.value = guess.value + pressedKey.toLowerCase()[0]
    }
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

/* ---------------------- /GameLogic ---------------------- */


/* ---------------------- DOM Cyber ---------------------- */

// function handleEmailSubmitted() {
//     let emailElement = document.getElementById("email-input")
//     emailElement.style.display = "none"
//     let submitElement = document.getElementById("register-text-button")
//     submitElement.textContent = "We'll be in touch!"
//     submitElement.style.left = "65px"
    
//     let fullButton = document.getElementById("full-register-button")
//     fullButton.style.cursor = "default"
// }

function beginReadyLevel() {
    const popup = document.getElementById("complete-level-popup")
    popup.style.display = "none"
    
    const board = document.getElementsByClassName("words-tiles")[0]
    board.innerHTML = ''

    var timer = document.getElementById("game-timer")
    timeLeft = GAME_TIMER_TIMEOUT - (5 * round)
    if (timeLeft <= 20) {
        timeLeft = 20
    }
    timer.textContent = getTimerStr(timeLeft)

    round += 1
    // const roundSideElement = document.getElementById("round-side-view")
    // roundSideElement.textContent = round

    const inLetters = document.getElementById("begin-in-letters")
    inLetters.innerHTML = ""

    for (let i = 0; i < availableLetters.length; i++) {
        let inLetter = document.createElement("div")
        inLetter.classList.add("letter-new-round")
        inLetter.innerHTML = BEGINNING_ROUND_LETTER
        let beginCurrentLetter = inLetter.getElementsByClassName("begin-in-letter")[0]
        beginCurrentLetter.textContent = availableLetters[i].toUpperCase()
        inLetters.appendChild(inLetter)
    }

    const readyPopup = document.getElementById("ready-level-popup")
    let roundElement = document.getElementById("round-1-id")
    roundElement.textContent = "Round " + round
    readyPopup.style.display = "flex"
    setScaleAnimation(readyPopup)
}

function setScaleAnimation(element) {
    element.style.animationDuration = "1s";
    element.style.animationTimingFunction = "ease";
    element.style.animationName = "zoom-in-zoom-out";
}

function setKeyTapAnimation(element) {
    element.style.animationDuration = "0.3s";
    element.style.animationTimingFunction = "ease";
    element.style.animationName = "keyboard-tap";
}

function appendMessageInternal(player, message, solved, niceTrySolved) {
    let chat = document.getElementById("chat-area")
    let messageElement = document.createElement('article')
    messageElement.classList.add("chat-row")
    messageElement.innerHTML = CHAT_MESSAGE
    let usernameElement = messageElement.getElementsByClassName("chat-row-username")[0]
    usernameElement.textContent = player.username
    let messageContentElement = messageElement.getElementsByClassName("chat-row-message")[0]
    
    if (solved) {
        // let tickElement = document.createElement('span')
        // tickElement.innerHTML = " &#10004;"
        // tickElement.classList.add("checkmark")
        messageContentElement.style.color = player.color
        messageContentElement.textContent = message.toUpperCase()
        if (player.username === "you") {
            messageContentElement.innerHTML += CHAT_CORRECT_ADDON
            let addedScore = messageContentElement.getElementsByClassName("nice-try-score")[0]
            addedScore.textContent = "+"+message.length
        }
        player.updateDOMScore(message.length)
        // messageContentElement.append(tickElement)
    } else if (niceTrySolved) {
        messageContentElement.classList.remove("correct-word")
        messageContentElement.textContent = message
        if (player.username === "you") {
            messageContentElement.innerHTML += CHAT_NICE_TRY_ADDON
        }
        player.updateDOMScore(1)
    } else {
        messageContentElement.classList.remove("correct-word")
        messageContentElement.textContent = message
        if (player.username == "PIP") {
            messageContentElement.style.color = player.color
            usernameElement.style.color = player.color
        }
    }
    
    let imgElement = messageElement.getElementsByClassName("chat-row-icon")[0]
    imgElement.style.backgroundImage = player.icon
    imgElement.style.borderColor = player.color

    chat.appendChild(messageElement)
    messageElement.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
}

function appendMessage (player, message, solved, niceTrySolved, delay) {
    if (delay > 0) {
        setTimeout(appendMessageInternal, delay, player, message, solved, niceTrySolved)
    } else {
        appendMessageInternal(player, message, solved, niceTrySolved)
    }
}

/* tile filling */
function appendFilledTile(word, letter) {
    word.innerHTML += filled_tile
    let input = word.getElementsByClassName("letter-input").slice(-1)
    input.innerText = letter
}

function appendEmptyTile(word) {
    word.innerHTML += EMPTY_TILE
}

  function createEmptyWordRow(word) {
    const row = document.createElement('div')
    row.className = 'word'
    
    /* for letter in word create empty tile and append to row */
    for (let i = 0; i < word.length; i++) {
        appendEmptyTile(row)
    }
    return row
  }

function setAvailableLetters() {
    availableLetters = shuffle(availableLetters)
    const letters = document.getElementById("available-top-letters")
    letters.innerHTML = ""
    for (let i = 0; i < availableLetters.length; i++) {
        let letterElement = document.createElement("div")
        letterElement.classList.add("letter")
        letterElement.innerHTML = LETTER_TEMPLATE
        let valueElement = letterElement.getElementsByClassName("top-letter")[0]
        valueElement.textContent = availableLetters[i].toUpperCase()
        letters.appendChild(letterElement)
    }
}

  function startCurrentLevel () {
    var readyPopup = document.getElementById("ready-level-popup")
    readyPopup.style.display = "none"

    const board = document.getElementsByClassName("words-tiles")[0]

    freezeGame = false
    setAvailableLetters()
    correctlyGuessed = []
    for (let i = 0; i < CurrentLevel.length; i++) {
        const row = createEmptyWordRow(CurrentLevel[i])
        board.appendChild(row)
    }

    playersList.forEach((player) => {
        player.currentLevelAttempts = 0
        player.sequentialHits = 0
        player.sequentialMisses = 0
    })
    
    const buttons = document.querySelectorAll('.keyboard-button')
    buttons.forEach((button) => {
        button.classList.remove("keyboard-button-1", "keyboard-button-2")
        const letterCount = button.getElementsByClassName('letter-count')[0]
        const letter = button.getElementsByClassName('button-letter')[0]
        letterCount.textContent = ''
        if (availableLetters.includes(letter.textContent[0].toLowerCase())) {
            button.classList.add("keyboard-button-1", "keyboard-button-2")
            letterCount.textContent = countLetter(letter.textContent, availableLetters)
        }
    })
}

function displayFinishedLevel() {
    finishedLevels.push(CurrentLevel[0]) /* insert the key level identifier */
    freezeGame = true
    var scoreElement = document.getElementById("level-finish-score")
    scoreElement.textContent = youPlayer.score + " POINTS"
    var completePopup = document.getElementById("complete-level-popup")
    completePopup.style.display = "flex"
    setScaleAnimation(completePopup)

    setTimeout(() => {
        generateNewLevel()
    }, timeoutBetweenLevels)
}

function getTimerStr(timeLeft) {
    if (timeLeft > 60) {
        if (Math.floor(timeLeft % 60) < 10) {
            return Math.floor(timeLeft / 60) + ":0" + Math.floor(timeLeft % 60)
        } else {
            return Math.floor(timeLeft / 60) + ":" + Math.floor(timeLeft % 60)
        }
    } else {
        return timeLeft
    }
}

function updateTimer() {
    if (freezeGame) {
        return
    }
    var timer = document.getElementById("game-timer")
    timeLeft -= 1

    timer.textContent = getTimerStr(timeLeft)
    if (timeLeft === 0) {
        handleOutOfTime()
    }
}

function handleOutOfTime() {
    window.LogRocket.track('FinishedGameStats', {round: round, score: groupScore});
    freezeGame = true

    var scoreElement = document.getElementById("level-timeout-score")
    scoreElement.textContent = youPlayer.score + " POINTS"

    var oot = document.getElementById("out-of-time-popup")
    oot.style.display = "flex"
    setScaleAnimation(oot)
}

document.addEventListener("DOMContentLoaded", function(e) {
    var tiles = document.getElementsByClassName("words-tiles")[0]
    var chat = document.getElementById("chat-area")
    const howToPopup = document.getElementById("how-to-popup")
    
    chatInput = document.getElementById("chat-input")
    groupScoreElement = document.getElementById("group-score-side-view")

    // if (window.innerHeight > 700) {
    //     console.log('Opened from Home Screen');
    //     tiles.style.minHeight = FULL_TILES_SIZE
    //     tiles.style.maxHeight = FULL_TILES_SIZE
    //     chat.style.minHeight = FULL_CHAT_SIZE
    //     chat.style.maxHeight = FULL_CHAT_SIZE
    //     // Perform actions specific to opening from Home Screen
    // } else {
    //     console.log('Opened from browser');
    //     tiles.style.minHeight = BROWSER_TILES_SIZE
    //     tiles.style.maxHeight = BROWSER_TILES_SIZE
    //     chat.style.minHeight = BROWSER_CHAT_SIZE
    //     chat.style.maxHeight = BROWSER_CHAT_SIZE
    //     // Perform actions specific to opening from the browser
    // }

    window.LogRocket && window.LogRocket.init('9o6vsp/enolapoc0');
    deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
        shouldWaitForStartUp = true
        howToPopup.style.display = "flex"
        deviceId = uuidv4();
        localStorage.setItem("deviceId", deviceId);
    } else {
        howToPopup.style.display = "none"
        shouldWaitForStartUp = false
    }
    console.log(deviceId)
    window.LogRocket.identify(deviceId, { uuid: deviceId });

    if (!shouldWaitForStartUp) {
        startUp()
    }
  
});

/* ---------------------- /DOM Cyber ---------------------- */


/* ---------------------- Server API ---------------------- */
function generateNewLevel () {
    correctlyGuessed = []
    validGuessed = []
    // const levelNumberObj = document.getElementById('level-number')
    // levelNumber += 1
    // levelNumberObj.textContent = 'Level: ' + levelNumber
    // updateScore()

    fetch(generateLevelPostURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ difficulty })
    }).then(response => {
        console.log(response.statusText)
        return response.json()
    })
    .then(data => {
        console.log(data)
        if (finishedLevels.includes(data.level[0])) {
            /* level already played - generate new level */
            generateNewLevel()
            return
        }
        CurrentLevel = data.level
        metaCurrentLevel = data.metaLevel
        availableLetters = shuffle(Array.from(CurrentLevel[0]))
        CurrentLevel = shuffle(Array.from(CurrentLevel))
        beginReadyLevel()
        setTimeout(() => {
            startCurrentLevel()
        }, timeoutBetweenLevels)
    })
}

// function submitRegisterForm() {
//     const email = document.getElementById("email-input")
//     window.LogRocket.track("RegisterRequest", {email: email.value})
//     fetch(registerPostURL, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//             'Access-Control-Allow-Origin': '*',
//             'Access-Control-Allow-Credentials': true
//         },
//         body: JSON.stringify({ "email": email.value })
//     }).then(response => {
//         console.log(response.statusText)
//         handleEmailSubmitted()
//         return response.json()
//     })
// }

function submitRegisterForm(email, callback) {
    window.LogRocket.track("RegisterRequest", {email: email})
    fetch(registerPostURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ "email": email })
    }).then(response => {
        console.log(response.statusText)
        callback()
        return response.json()
    })
}

function startUp() {
    shouldWaitForStartUp = false
    resetGame()
    generateNewLevel()
    setInterval(runBotGuesser, botGuessInterval[Math.floor(Math.random()*botGuessInterval.length)]);
    setInterval(updateTimer, 1000) // once every second
}

/* ---------------------- /Server API ---------------------- */

/* ---------------------- EventListeners ---------------------- */

function setFadeAnimation(element, timeoutStr, timeoutMS) {
    element.style.display = "flex"
    element.style.animationDuration = timeoutStr;
    element.style.animationTimingFunction = "ease";
    element.style.animationName = "fade";
    setTimeout(() => {
        element.style.display = "none"
        element.style.animationName = "none"
    }, timeoutMS)
}

document.getElementById("register-from-tooltip").addEventListener("click", (e) => {
    let input = document.getElementById("email-input-tooltip")
    submitRegisterForm(input.value, () => {
        let view = document.getElementById("be-first-tooltip-register-view-id")
        view.style.display = "none"
        let messageElement = document.getElementById("tooltip-register-message")
        messageElement.textContent = "THANK YOU FOR REGISTERING!"
        registeredAlready = true
        let element = document.getElementById("first-to-play-message")
        setFadeAnimation(element, "3s", 3000)
    })
})

document.onclick = function (e) {
    var firstPlayPopup = document.getElementById('first-to-play-message');
    var firstPlayPopup2 = document.getElementById('first-to-play-message2');
    var firstPlayTriggerPopup = document.getElementById('be-the-first-to-play');
    var addToHomeTriggerPopup = document.getElementById('add-to-home-id');
    var howToTriggerPopup = document.getElementById('how-to-button-id');
    var howToPopup = document.getElementById('how-to-popup');
    if (!howToPopup.contains(e.target)
        && !(howToTriggerPopup.contains(e.target))) {
        howToPopup.style.display = "none"
    }
    if (!firstPlayPopup.contains(e.target)
        && !(firstPlayTriggerPopup.contains(e.target))) {
        firstPlayPopup.style.display = "none"
    }
    if (!firstPlayPopup2.contains(e.target)
        && !(addToHomeTriggerPopup.contains(e.target))) {
        firstPlayPopup2.style.display = "none" 
    }
}

document.getElementById("register-how-to-submit").addEventListener("click", (e) => {
    let input = document.getElementById("email-input-from-how-to")
    submitRegisterForm(input.value, () => {
        input.style.display = "none"
        let view2 = document.getElementById("register-how-to-submit")
        view2.style.display = "none"
        let messageElement = document.getElementById("register-prompt-in-how-to-id")
        messageElement.textContent = "THANK YOU FOR REGISTERING!"
        registeredAlready = true
    })
})

const buttons = document.querySelectorAll('.keyboard-button')
buttons.forEach((button) => {
    button.addEventListener("touchstart", (e) => {
        /* Only for onscreen button presses */
        // setKeyTapAnimation(e.target)
        if (e.target.classList.contains("keyboard-button")) {
            e = e.target.getElementsByClassName("button-letter")[0]
        } else if (e.target.classList.contains("letter-count")) {
            e = e.target.parentElement.getElementsByClassName("button-letter")[0]
        }
        const pressedKey = e.target.textContent[0].toLowerCase()
        addKeyToInput(pressedKey, true)
    }, {passive: true})
})

document.getElementById("yay-message").addEventListener("click", (e) => {
    /* When yay Pressed */
    window.LogRocket.track('clickDismissCompleteLevel', {});
    const popup = document.getElementById("complete-level-popup")
    popup.style.display = "none"
})

document.getElementById("play-again-button").addEventListener("click", (e) => {
    /* When play-again-click Pressed */
    window.LogRocket.track('clickPlayAgain', {});
    const popup = document.getElementById("out-of-time-popup")
    popup.style.display = "none"
    resetGame()
    generateNewLevel()
})

document.getElementById("enterButton").addEventListener("touchstart", (e) => {
    /* When Enterkey Pressed */
    window.LogRocket.track('clickEnter', {});
    handleSubmitChatMessage(chatInput.value)
    chatInput.value = ""
}, {passive: true})

document.getElementById("how-to-button-id").addEventListener("click", (e) => {
    /* When "how-to" Pressed */
    window.LogRocket.track('clickQuestionMark', {});
    const howToPopup = document.getElementById("how-to-popup")
    howToPopup.style.display = "flex"
}, {passive: true})

document.getElementById("x-how-to-popup-button").addEventListener("click", (e) => {
    /* When "x" Pressed in popup window */
    window.LogRocket.track('clickXInHowToPopup', {});
    const howToPopup = document.getElementById("how-to-popup")
    howToPopup.style.display = "none"
    if (shouldWaitForStartUp) {
        startUp()
    }
})

document.getElementById("be-the-first-to-play").addEventListener("click", (e) => {
    /* When "be-the-first" Pressed */
    window.LogRocket.track('clickBeTheFirst', {});
    const firstToPlay = document.getElementById("first-to-play-message")
    // firstToPlay.focus()
    firstToPlay.style.top = "1rem"
    if (registeredAlready) {
        setFadeAnimation(firstToPlay, "3s", 3000)
        return
    }

    if (firstToPlay.style.display === "flex") {
        firstToPlay.style.display = "none"
    } else {
        firstToPlay.style.display = "flex"
    }
})

document.getElementById("add-to-home-id").addEventListener("click", (e) => {
    /* When "be-the-first" Pressed */
    window.LogRocket.track('clickBeTheFirst', {});

    installToHome();

    if (!beforeInstallPrompt) {
        const firstToPlay = document.getElementById("first-to-play-message2")
        if (registeredAlready) {
            setFadeAnimation(firstToPlay, "3s", 3000)
            return
        }
        
        if (firstToPlay.style.display === "flex") {
            firstToPlay.style.display = "none"
        } else {
            firstToPlay.style.display = "flex"
        }
    }

})

document.getElementById("invite-friends-id").addEventListener("click", (e) => {
    /* When "be-the-first" Pressed */
    window.LogRocket.track('clickInviteFriends', {});
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = "http://wordhunt.gg";
    dummy.contentEditable = true;
    dummy.readOnly = true;
    // var range = document.createRange();
    // range.selectNodeContents(dummy);
    // var selection = window.getSelection();
    // selection.removeAllRanges();
    // selection.addRange(range);
    // dummy.select();
    // dummy.setSelectionRange(0, 999999);

    document.body.appendChild(dummy);
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    const firstToPlay = document.getElementById("share-link-message")
    setFadeAnimation(firstToPlay, "2s", 2000)

    // navigator.clipboard.writeText(dummy.value).then(() => {
    // const firstToPlay = document.getElementById("share-link-message")
    // setFadeAnimation(firstToPlay, "2s", 2000)
    //     console.log('Copied to clipboard!');
    // /* Resolved - text copied to clipboard successfully */
    // },() => {
    //     console.error('Failed to copy');
    //     /* Rejected - text failed to copy to the clipboard */
    //     });
            
    // document.body.removeChild(dummy);
})


document.getElementById("reshuffle-letters").addEventListener("touchstart", (e) => {
    /* When yay Pressed */
    window.LogRocket.track('reshuffle-pressed', {});
    setAvailableLetters()
}, {passive: true})

document.getElementById("delButton").addEventListener("touchstart", (e) => {
    /* When Enterkey Pressed */
    // const chatInput = document.getElementById("chat-input")
    chatInput.value = chatInput.value.substring(0, chatInput.value.length - 1)
}, {passive: true})

document.getElementById("spaceButton").addEventListener("touchstart", (e) => {
    /* When Spacekey Pressed */
    // const chatInput = document.getElementById("chat-input")
    chatInput.value += " "
}, {passive: true})

document.addEventListener('keyup', (e) => {
    const pressedKey = String(e.key)
    addKeyToInput(pressedKey, false)

    if (pressedKey === ENTER_KEY_NAME) {
        window.LogRocket.track('clickEnter', {});
    }

    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return
    } else {
        let emailElement = document.getElementById("chat-input")
        let sideEmailElement = document.getElementById("email-input-from-how-to")
        let tooltipEmailElement = document.getElementById("email-input-tooltip")
        if (!(emailElement === document.activeElement)
            && !(sideEmailElement === document.activeElement
                || tooltipEmailElement === document.activeElement)) {
            addKeyToInput(pressedKey, true)
            // emailElement.focus()
        }
    }
})

/* ---------------------- /EventListeners ---------------------- */

/* ---------------------- BotLogic ---------------------- */

const playersList = [
    youPlayer,
    pipPlayer,
    new Player("user12431", "player-1", "url('img/new_player_2.png')", "#32ff84", "white"),
    new Player("smartFox69", "player-2", "url('img/new_player_3.png')", "#ff3364", "white"),
    new Player("WordyJack3", "player-3", "url('img/new_player_1.png')", "#329dff", "white"),
]

function runBotGuesser() {
    if (freezeGame) {
        return
    }
    let bot = playersList[Math.floor(Math.random()*(playersList.length-2)) + 2]
    let botGuess = metaCurrentLevel[Math.floor(Math.random()*metaCurrentLevel.length)]
    bot.attempts += 1
    if (checkGuess(bot, botGuess)) {
        appendMessage(bot, botGuess, true, false, 0)
        bot.sequentialHits += 1
    } else {
        if (checkNiceTry(bot, botGuess)) {
            validGuessed.push(botGuess)
            appendMessage(bot, botGuess, false, true, 0)
        } else {
            appendMessage(bot, botGuess, false, false, 0)
        }
        bot.sequentialMisses += 1
    }

    bot.trashTalk()
}

/* ---------------------- /BotLogic ---------------------- */
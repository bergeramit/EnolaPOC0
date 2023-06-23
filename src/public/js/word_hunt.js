var postURL = "http://64.226.100.123/generate_level/";
//const postURL = 'http://127.0.0.1:3000/generate_level/'
let levelDataStructure
let metaLevelDataStructure
let correctlyGuessed = {}
let availableLetters
let round = 1
let lockBotGuess = false
const timeoutBetweenLevels = 3000
const difficulty = 'Easy'
const ENTER_KEY_NAME = "Enter"
const SPACE_KEY_NAME = "space"
const BACKSPACE_KEY_NAME = "Backspace"
const botGuessInterval = [4000, 5000, 6000, 7000, 8000, 9000]
let selectedLettersClasses = ["keyboard-button-1", "keyboard-button-2"]
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
let CHAT_MESSAGE = `
    <div class="chat-row-icon"></div>
    <div class="chat-row-username-and-message">
        <div class="chat-row-username">You</div>
        <div class="chat-row-message correct-word">Correct</div>
    </div>
`

/* ---------------------- GameLogic ---------------------- */

function checkGuess (player, guess) {
    for (let i = 0; i < levelDataStructure.length; i++) {
        //console.log('Checks: levelDataStructure[1][i]: ' + levelDataStructure[i] + ' === ' + guess)
        if (levelDataStructure[i] === guess && !correctlyGuessed[i]) {
            correctlyGuessed[i] = true
            console.log('Success! at row: ' + (i + 1))
            const row = document.getElementsByClassName('word')[i]
            for (let j = 0; j < row.children.length; j++) {
                // place word correctly!
                row.children[j].innerHTML = FILLED_TILES
                const currentTile = row.children[j].getElementsByClassName("letter-input")[0]
                currentTile.textContent = levelDataStructure[i][j].toUpperCase()  
                const backgroundFill = row.children[j].getElementsByClassName("tile-fill")[0]
                backgroundFill.style.backgroundColor = player.color
            }
            setScaleAnimation(row)

            for (const key of Object.keys(correctlyGuessed)) {
                if (!correctlyGuessed[key]) {
                    // There are still empty rows
                    return true
                }
            }
            // generate new level
            //appendMessage('WordHunt', 'Great job!', false)
            //appendMessage('WordHunt', 'Get Ready for level ' + (levelNumber+1))
            displayFinishedLevel()
            setTimeout(() => {
                beginReadyLevel()
            }, timeoutBetweenLevels)
            return true
        }
    }
    return false
}

function countLetter (letter, str) {
    let letterCount = 0
    const lowercaseLetter = letter.toLowerCase()
    const lowercaseString = str.toLowerCase()
    
    for (let i = 0; i < lowercaseString.length; i++) {
        if (lowercaseString[i] === lowercaseLetter) {
            letterCount++
        }
    }
    return letterCount
}

function handleSubmitChatMessage(message) {
    if (!checkGuess(playersList[0], message)) {
        appendMessage(playersList[0], message, false)
        //currentStreak = 1
    } else {
        appendMessage(playersList[0], message, true)
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

/* ---------------------- /GameLogic ---------------------- */


/* ---------------------- DOM Cyber ---------------------- */

function beginReadyLevel() {
    const popup = document.getElementById("complete-level-popup")
    popup.style.display = "none"

    let chat = document.getElementById("chat-area")
    chat.innerHTML = ""

    round += 1
    const readyPopup = document.getElementById("ready-level-popup")
    let roundElement = readyPopup.getElementsByClassName("round-1")[0]
    roundElement.textContent = "Round " + round
    readyPopup.style.display = "flex"
    setScaleAnimation(readyPopup)

    setTimeout(() => {
        generateNewLevel()
    }, timeoutBetweenLevels)
}

function setScaleAnimation(element) {
    element.style.animationDuration = "1s";
    element.style.animationTimingFunction = "ease";
    element.style.animationName = "zoom-in-zoom-out";
}

function appendMessage (player, message, solved) {
    let chat = document.getElementById("chat-area")
    let messageElement = document.createElement('article')
    messageElement.classList.add("chat-row")
    messageElement.innerHTML = CHAT_MESSAGE
    let usernameElement = messageElement.getElementsByClassName("chat-row-username")[0]
    usernameElement.textContent = player.username
    let messageContentElement = messageElement.getElementsByClassName("chat-row-message")[0]
    
    if (solved) {
        messageContentElement.style.color = player.color
    } else {
        messageContentElement.classList.remove("correct-word")
    }
    messageContentElement.textContent = message

    let imgElement = messageElement.getElementsByClassName("chat-row-icon")[0]
    imgElement.style.backgroundImage = player.icon
    imgElement.style.borderColor = player.color

    chat.appendChild(messageElement)
    messageElement.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
}


/* letter-input is key for inputting different letter values */
/* should change tile-fill with appropritate fillings */

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

  function paintCurrentLevel (currentLevel) {
    console.log(currentLevel)
    levelDataStructure = currentLevel
    availableLetters = Array.from(levelDataStructure[0])

    const board = document.getElementsByClassName("words-tiles")[0]
    board.innerHTML = ''
    
    for (let i = 0; i < levelDataStructure.length; i++) {
        correctlyGuessed[i] = false
        const row = createEmptyWordRow(levelDataStructure[i])
        board.appendChild(row)
    }
    
    const buttons = document.querySelectorAll('.keyboard-button')
    buttons.forEach((button) => {
        button.classList.remove("keyboard-button-1", "keyboard-button-2")
        const letterCount = button.getElementsByClassName('letter-count')[0]
        const letter = button.getElementsByClassName('button-letter')[0]
        letterCount.textContent = ''
        if (availableLetters.includes(letter.textContent[0].toLowerCase())) {
            button.classList.add("keyboard-button-1", "keyboard-button-2")
            letterCount.textContent = countLetter(letter.textContent, levelDataStructure[0])
        }
    })
}

function displayFinishedLevel() {
    lockBotGuess = true
    var completePopup = document.getElementById("complete-level-popup")
    completePopup.style.display = "flex"
    setScaleAnimation(completePopup)
}

/* ---------------------- /DOM Cyber ---------------------- */


/* ---------------------- Server API ---------------------- */
function generateNewLevel () {
    var readyPopup = document.getElementById("ready-level-popup")
    readyPopup.style.display = "none"

    correctlyGuessed = {}
    // const levelNumberObj = document.getElementById('level-number')
    // levelNumber += 1
    // levelNumberObj.textContent = 'Level: ' + levelNumber
    // updateScore()

    fetch(postURL, {
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
        metaLevelDataStructure = data.metaLevel
        paintCurrentLevel(data.level)
        lockBotGuess = false
    })
}

function startUp() {
    generateNewLevel ()
    setInterval(runBotGuesser, botGuessInterval[Math.floor(Math.random()*botGuessInterval.length)]);
}

startUp()
/* ---------------------- /Server API ---------------------- */

/* ---------------------- EventListeners ---------------------- */

const buttons = document.querySelectorAll('.keyboard-button')
buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
        /* Only for onscreen button presses */
        const pressedKey = e.target.textContent[0].toLowerCase()
        addKeyToInput(pressedKey, true)
    })
})

document.getElementById("yay-message").addEventListener("click", (e) => {
    /* When yay Pressed */
    const popup = document.getElementById("complete-level-popup")
    popup.style.display = "none"
})

document.getElementById("enterButton").addEventListener("click", (e) => {
    /* When Enterkey Pressed */
    const chatInput = document.getElementById("chat-input")
    handleSubmitChatMessage(chatInput.value)
    chatInput.value = ""
})


document.getElementById("info-button-id").addEventListener("click", (e) => {
    /* When "?" Pressed */
    
})

document.getElementById("delButton").addEventListener("click", (e) => {
    /* When Enterkey Pressed */
    const chatInput = document.getElementById("chat-input")
    chatInput.value = chatInput.value.substring(0, chatInput.value.length - 1)
})

document.getElementById("spaceButton").addEventListener("click", (e) => {
    /* When Spacekey Pressed */
    const chatInput = document.getElementById("chat-input")
    chatInput.value += " "
})

document.addEventListener('keyup', (e) => {
    const pressedKey = String(e.key)
    addKeyToInput(pressedKey, false)
})

/* ---------------------- /EventListeners ---------------------- */

/* ---------------------- BotLogic ---------------------- */


class Player {
    constructor(username, icon, color, textColor) {
        this.username = username
        this.color = color
        this.textColor = textColor
        this.icon = icon
    }
}

const playersList = [
    new Player("you", "url('img/player_1.png')", "#ffd232", "black"),
    new Player("user12431", "url('img/player_2.png')", "#32ff84", "white"),
    new Player("smartFox69", "url('img/player_3.png')", "#ff3364", "white"),
    new Player("WordyJack3", "url('img/player_4.png')", "#329dff", "white"),
]

function runBotGuesser() {
    if (lockBotGuess) {
        return
    }
    let bot = playersList[Math.floor(Math.random()*(playersList.length-1)) + 1]
    let botGuess = metaLevelDataStructure[Math.floor(Math.random()*metaLevelDataStructure.length)]
    if (checkGuess(bot, botGuess)) {
        appendMessage(bot, botGuess, true)
    } else {
        appendMessage(bot, botGuess, false)
    }
}

/* ---------------------- /BotLogic ---------------------- */
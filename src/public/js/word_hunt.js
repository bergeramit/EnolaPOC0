//var postURL = "http://64.226.100.123/generate_level/";
const postURL = 'http://127.0.0.1:3000/generate_level/'
let levelDataStructure
let metaLevelDataStructure
let correctlyGuessed = {}
let availableLetters
const timeoutBetweenLevels = 2000
const difficulty = 'Easy'
const ENTER_KEY_NAME = "Enter"
const SPACE_KEY_NAME = "space"
const BACKSPACE_KEY_NAME = "Backspace"
const botGuessInterval = [4000, 5000, 6000, 7000, 8000, 9000]
const botUserNames = ["user12431", "smartFox69", "Huberman32", "WordyJack3"]
const botOptionalPics = ["url('img/player_2.png')", "url('img/player_3.png')"]
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

function checkGuess (guess) {
    // console.log("in CheckGuess");
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
                currentTile.textContent = levelDataStructure[i][j].toUpperCase()            }
            
            for (const key of Object.keys(correctlyGuessed)) {
                if (!correctlyGuessed[key]) {
                    // There are still empty rows
                    return true
                }
            }
            // generate new level
            //appendMessage('WordHunt', 'Great job!', false)
            //appendMessage('WordHunt', 'Get Ready for level ' + (levelNumber+1))
            setTimeout(() => {
                generateNewLevel()
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
    if (!checkGuess(message)) {
        // add to chat instead
        appendMessage('you', message, false)
        //currentStreak = 1
    } else {
        appendMessage('you', message, true)
        // totalScore += 10 * currentStreak
        // currentStreak += 1
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

function appendMessage (username, message, solved) {
    console.log(username, message)
    let chat = document.getElementById("chat-area")
    let messageElement = document.createElement('article')
    messageElement.classList.add("chat-row")
    messageElement.innerHTML = CHAT_MESSAGE
    let usernameElement = messageElement.getElementsByClassName("chat-row-username")[0]
    usernameElement.textContent = username
    let messageContentElement = messageElement.getElementsByClassName("chat-row-message")[0]
    
    if (!solved) {
        messageContentElement.classList.remove("correct-word")
    }
    messageContentElement.textContent = message

    let imgElement = messageElement.getElementsByClassName("chat-row-icon")[0]
    if (username === "you") {
        imgElement.style.backgroundImage = "url('img/player_1.png')";
    } else {
        const botPic = botOptionalPics[Math.floor(Math.random()*botOptionalPics.length)]
        imgElement.style.backgroundImage = botPic;
    }

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

/* ---------------------- /DOM Cyber ---------------------- */


/* ---------------------- Server API ---------------------- */
function generateNewLevel () {
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

document.getElementById("enterButton").addEventListener("click", (e) => {
    /* When Enterkey Pressed */
    const chatInput = document.getElementById("chat-input")
    handleSubmitChatMessage(chatInput.value)
    chatInput.value = ""
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

function runBotGuesser() {
    let botUserName = botUserNames[Math.floor(Math.random()*botUserNames.length)]
    //let botMessage = botMessages[Math.floor(Math.random()*botMessages.length)]
    let botGuess = metaLevelDataStructure[Math.floor(Math.random()*metaLevelDataStructure.length)]
    if (checkGuess(botGuess)) {
        appendMessage(botUserName, botGuess, true)
    } else {
        appendMessage(botUserName, botGuess, false)
    }
}

/* ---------------------- /BotLogic ---------------------- */
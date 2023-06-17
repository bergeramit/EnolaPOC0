var postURL = "http://64.226.100.123/generate_level/";
//const postURL = 'http://127.0.0.1:3000/generate_level/'
let difficulty = 'Easy'
let levelDataStructure
let metaLevelDataStructure
let levelNumber = 0
let timeoutBetweenLevels = 1000;
let correctlyGuessed = {}
let availableLetters
let enterKeyName = "Enter"
let spaceKeyName = "space"
let backspaceKeyName = "Backspace"
let botGuessInterval = 7000
let botUserNames = ["user12431", "smartFox69", "Huberman32", "WordyJack3"]
let botMessages = ["a though one!", "Damn", "So close!", "almost almost", "thats so fun"]

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


function checkGuess (guess) {
    // console.log("in CheckGuess");
    for (let i = 0; i < levelDataStructure.length; i++) {
        //console.log('Checks: levelDataStructure[1][i]: ' + levelDataStructure[i] + ' === ' + guess)
        if (levelDataStructure[i] === guess && !correctlyGuessed[i]) {
            correctlyGuessed[i] = true
            //console.log('Success! at row: ' + (i + 1))
            const row = document.getElementsByClassName('letter-local')[i]
            for (let j = 0; j < row.children.length; j++) {
                // place word correctly!
                row.children[j].textContent = levelDataStructure[i][j]
            }
            
            for (const key of Object.keys(correctlyGuessed)) {
                if (!correctlyGuessed[key]) {
                    // There are still empty rows
                    return true
                }
            }
            // generate new level
            appendMessage('WordHunt', 'Great job!')
            appendMessage('WordHunt', 'Get Ready for level ' + (levelNumber+1))
            setTimeout(() => {
                generateNewLevel()
            }, timeoutBetweenLevels)
            return true
        }
    }

    return false
}

/* ---------------------- User Inputs ---------------------- */


function addKeyToInput (pressedKey, onScreen) {
    const guess = document.getElementById('input-guess')
    if (pressedKey === backspaceKeyName && onScreen) {
        guess.value = guess.value.substring(0, guess.value.length - 1)
        return
    }

    if (pressedKey === spaceKeyName && onScreen) {
        guess.value = guess.value + " "
        return
    }
    
    if (pressedKey === enterKeyName) {
        if (!checkGuess(guess.value)) {
            // add to chat instead
            appendMessage('you', guess)
        }else {
            appendMessage("WordHunt", "you solved a row!")
        }
        guess.value = ''
        return
    }

    if (onScreen) {
        guess.value = guess.value + pressedKey.toLowerCase()[0]
    }
}

document.getElementById('keyboard-cont').addEventListener('click', (e) => {
    const target = e.target
    if (!target.classList.contains('keyboard-button')) {
        return
    }
    
    let key = target.textContent
    const guess = document.getElementById('input-guess')
    if (target.className.includes("fa-share")) {
        if (!checkGuess(guess.value)) {
            // add to chat instead
            appendMessage('you', guess.value)
        } else {
            appendMessage("WordHunt", "you solved a row!")
        }
        guess.value = ''
    }
    else if (target.className.includes("backspace")) {
        guess.value = guess.value.substring(0, guess.value.length - 1)
        return
    }
    else if (key == spaceKeyName) {
        guess.value = guess.value + " "
        return
    } else {
        guess.value = guess.value + key.toLowerCase()[0]
    }
})

document.addEventListener('keyup', (e) => {
    const pressedKey = String(e.key)
    addKeyToInput(pressedKey, false) // actual press
})

const buttons = document.querySelectorAll('.pagination a')
buttons.forEach((button) => {
    button.addEventListener('click', () => {
        buttons.forEach((btn) => {
            btn.classList.remove('active')
        })
        
        button.classList.add('active')
        difficulty = button.textContent
        console.log(difficulty)
    })
})

/* ---------------------- /User Inputs ---------------------- */

/* ---------------------- Server API ---------------------- */
function generateNewLevel () {
    correctlyGuessed = {}
    const levelNumberObj = document.getElementById('level-number')
    
    levelNumber += 1
    levelNumberObj.textContent = 'Level: ' + levelNumber

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
/* ---------------------- /Server API ---------------------- */

/* ---------------------- Chat ---------------------- */
function appendMessage (username, message) {
    const chatMessages = document.getElementById('chat-messages')
    const messageElement = document.createElement('div')
    messageElement.textContent = username + ': ' + message
    chatMessages.appendChild(messageElement)
    messageElement.scrollIntoView()
}
/* ---------------------- /Chat ---------------------- */

/* ---------------------- Level Generation ---------------------- */
function paintCurrentLevel (currentLevel) {
    levelDataStructure = currentLevel
    availableLetters = Array.from(levelDataStructure[0])
    console.log(availableLetters)
    const board = document.getElementById('game-board')
    board.innerHTML = ''
    
    for (let i = 0; i < levelDataStructure.length; i++) {
        correctlyGuessed[i] = false
        const row = document.createElement('div')
        row.className = 'letter-local'
        
        console.log(levelDataStructure[i])
        for (let j = 0; j < levelDataStructure[i].length; j++) {
            const box = document.createElement('div')
            box.className = 'letter-box'
            row.appendChild(box)
        }
        board.appendChild(row)
    }
    
    const buttons = document.querySelectorAll('.keyboard-button')
    buttons.forEach((button) => {
        button.classList.remove('button-marked')
        button.style.color = 'black'
        const letterCount = button.getElementsByClassName('letter-count')[0]
        if (letterCount) {
            letterCount.textContent = ''
            if (availableLetters.includes(button.textContent[0])) {
                button.classList.add('button-marked')
                button.style.color = 'white'
                letterCount.textContent = countLetter(button.textContent, levelDataStructure[0])
            }
        }
    })
}

function setupStartingLevel () {
    generateNewLevel()
    appendMessage('WordHunt', 'Welcome!')
    appendMessage('WordHunt', 'Try and guess the words and communicate with your friends!')
    setInterval(runBotGuesser, botGuessInterval);
}
setupStartingLevel()
/* ---------------------- /Level Generation ---------------------- */


/* ---------------------- /Bot Logic ---------------------- */
function runBotGuesser() {

    let botUserName = botUserNames[Math.floor(Math.random()*botUserNames.length)]
    //let botMessage = botMessages[Math.floor(Math.random()*botMessages.length)]
    let botGuess = metaLevelDataStructure[Math.floor(Math.random()*metaLevelDataStructure.length)]
    if (checkGuess(botGuess)) {
        appendMessage("WordHunt", botUserName + " solved a row!")
    } else {
        appendMessage(botUserName, botGuess)
    }
}

/* ---------------------- /Bot Logic ---------------------- */

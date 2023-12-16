//const BASE_URL = "https://wordhunt.gg/"
const BASE_URL = "http://127.0.0.1:3300/";
const generateLevelPostURL = BASE_URL + "get_level/";
//const generateLevelPostURL = 'generate_level/'
const registerPostURL = BASE_URL + "register_user/";
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const ENTER_KEY_NAME = "Enter"
const SPACE_KEY_NAME = "space"
const BACKSPACE_KEY_NAME = "Backspace"
const outOfTimeString = "OUT OF TIME!"
const OOTRed = "#EF2253";

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

/* ---------------------- GlobalsDefines ---------------------- */

// let finishedLevels = []
let timeoutBetweenLevels = 1500
let CurrentLevel
let chatInput
let deviceId
let correctlyGuessed = []
let validGuessed = []
let availableLetters
let round = 0
let freezeGame = true
let shouldWaitForStartUp
let registeredAlready = false
let inFTUE = false
let tutorialProgress = 0

/* Sounds */
// let keyboardClickSound

/* ---------------------- /GlobalsDefines ---------------------- */


/* ---------------------- GameLogic ---------------------- */

function resetGame() {
    round = 0
    streak = 1
}

function addCorrectWord(wordIndex, fillColor, opacity=1) {
    const row = document.getElementsByClassName('word')[wordIndex]
    for (let j = 0; j < row.children.length; j++) {
        // place word correctly!
        row.children[j].innerHTML = FILLED_TILES
        const currentTile = row.children[j].getElementsByClassName("letter-input")[0]
        currentTile.textContent = CurrentLevel[wordIndex][j].toUpperCase()  
        const backgroundFill = row.children[j].getElementsByClassName("tile-fill")[0]
        const backgroundOpac = row.children[j].getElementsByClassName("letter-tile")[0]
        backgroundFill.style.backgroundColor = fillColor
        backgroundOpac.style.opacity = opacity
    }
    setScaleAnimation(row)
}

function checkGuess(player, guess) {
    for (let i = 0; i < CurrentLevel.length; i++) {
        //console.log('Checks: CurrentLevel[1][i]: ' + CurrentLevel[i] + ' === ' + guess)
        if (CurrentLevel[i] === guess && !correctlyGuessed.includes(guess)) {
            if (player.username === youUsername) {
                player.solveCorrectlyCurrentRound += 1
                player.totalCorrect += 1
            }
            correctlyGuessed.push(guess)
            streak += 1
            
            addCorrectWord(i, player.color)
            
            if (correctlyGuessed.length < CurrentLevel.length) {
                // There are still empty rows
                return true
            }

            // generate new level
            freezeGame = true
            wonRoundSound.start()
            reportAnalytics("FinishedRound", {round: round, score: youPlayer.score, solveCorrectlyCurrentRound: youPlayer.solveCorrectlyCurrentRound, totalCorrect: youPlayer.totalCorrect})
            setTimeout(() => {
                displayFinishedLevel()
            }, 1000)
            return true
        }
    }

    if (inFTUE) {
        for (let i=0; i<guess.length; i++) {
            let count = 0
            for (let j = 0; j < guess.length; j++) {
                if (guess[i] === guess[j]) {
                    count++
                }
            }
            if (count > 1) { // FTUE only has single letters
                appendMessage(pipPlayer, "Be careful not to use more letters that are allowed! (indicated by a number above each letter)", false, false, PIP_CHAT_MESSAGE_DELAY)
                return false
            }
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

function handleSubmitChatMessage(message) {
    if (message.length <= 0) {
        return
    }
    
    console.log("Handle Chat Message")
}

function addKeyToInput (pressedKey, onScreen) {
    // keyboardClickSound.start()
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

function beginReadyLevel() {
    const popup = document.getElementById("complete-level-popup")
    popup.style.display = "none"
    
    const board = document.getElementsByClassName("words-tiles")[0]
    board.innerHTML = ''
    
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

}

function startCurrentLevel () {
    var readyPopup = document.getElementById("ready-level-popup")
    readyPopup.style.display = "none"
    
    const board = document.getElementsByClassName("words-tiles")[0]
    
    //freezeGame = false

    correctlyGuessed = []
    for (let i = 0; i < CurrentLevel.length; i++) {
        const row = createEmptyWordRow(CurrentLevel[i])
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
            // letterCount.textContent = countLetter(letter.textContent, availableLetters)
        }
    })
}

function displayFinishedLevel() {
    // finishedLevels.push(CurrentLevel[0]) /* insert the key level identifier */
    freezeGame = true
    var scoreElement = document.getElementById("level-finish-score")
    scoreElement.textContent = youPlayer.score + " POINTS"
    var completePopup = document.getElementById("complete-level-popup")
    completePopup.style.display = "flex"
    setScaleAnimation(completePopup)

    // if (inFTUE) {
    //     startTutorial(tutorialProgress + 1)
    //     return
    // }
    
    setTimeout(() => {
        generateNewLevel()
    }, timeoutBetweenLevels)
}

function gtag(){dataLayer.push(arguments);}

function lockOrientation() {
    if (screen.orientation) {
        screen.orientation.lock("portrait").catch(function(error) {
            // If the orientation cannot be locked, handle the error (if needed)
            console.error("Orientation lock failed:", error);
        });
    }
}

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

function popBeTheFirstMessage(offset="1rem", message="AddFriend") {
    const firstToPlay = document.getElementById("first-to-play-message")
    // firstToPlay.focus()
    firstToPlay.style.top = offset
    if (registeredAlready) {
        setFadeAnimation(firstToPlay, "3s", 3000)
        return
    }
    
    if (firstToPlay.style.display === "flex") {
        firstToPlay.style.display = "none"
    } else {
        reportAnalytics("formMessage", {message: message})
        firstToPlay.style.display = "flex"
    }
}

/* ---------------------- /DOM Cyber ---------------------- */


/* ---------------------- Server API ---------------------- */

function setLevelDS(completeLevel) {
    CurrentLevel = completeLevel.level
    availableLetters = shuffle(Array.from(CurrentLevel[0]))
    // CurrentLevel = shuffle(Array.from(CurrentLevel))
}

function generateNewLevel () {
    correctlyGuessed = []
    validGuessed = []
    
    fetch(generateLevelPostURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ })
    }).then(response => {
        // console.log(response.statusText)
        return response.json()
    })
    .then(data => {
        console.log(data)
        setLevelDS(data)
        // beginReadyLevel()
        const popup = document.getElementById("complete-level-popup")
        popup.style.display = "none"
    
        const board = document.getElementsByClassName("words-tiles")[0]
        board.innerHTML = ''
        startCurrentLevel()
        // setTimeout(() => {
        //     startCurrentLevel()
        // }, timeoutBetweenLevels)
    })
}

function ValidateEmail(email)
{
    var mailformat = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    if(email.match(mailformat))
    {
        return true;
    }
    else
    {
        return false;
    }
}

function submitRegisterForm(email, callback) {
    // window.LogRocket.track("RegisterRequest", {email: email})
    if (!email || !ValidateEmail(email)) {
        return
    }
    reportAnalytics("SubmitApplication", {email: email})
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

function startUp(initTimer=false) {
    // let sideView = document.getElementById("players-side-view-id")
    // sideView.style.display = "flex"
    shouldWaitForStartUp = false
    const d = new Date();
    let month = MONTH_NAMES[d.getMonth()];
    let day = d.getDay();

    let date = document.getElementById("current-date");
    date.innerText = month + " " + day;

    resetGame()
    generateNewLevel()
}

function reportAnalytics(eventName, JSONData) {
    mixpanel.track(eventName, JSONData)
    fbq('track', eventName, JSONData)
    gtag('event', eventName, JSONData);
}

/* ---------------------- /Server API ---------------------- */


/* ---------------------- EventListeners ---------------------- */

document.addEventListener("DOMContentLoaded", function(e) {
    const welcomePopup = document.getElementById("welcome-popup")
    welcomePopup.style.display = "flex"
    
    chatInput = document.getElementById("chat-input")
    
    window.dataLayer = window.dataLayer || [];

    // keyboardClickSound = new gameSound("audio/DAE_noise_vk_space_bar_02.wav");
    
    gtag('js', new Date());
    gtag('config', 'G-2SSJZRPB03');
    
    // window.LogRocket && window.LogRocket.init('9o6vsp/enolapoc0');
    mixpanel.init('0a52e147364e256c34add1b9b04c0e79', { debug: true, track_pageview: true, persistence: 'localStorage' });
    deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem("deviceId", deviceId);
        inFTUE = true
    }
    // inFTUE = true

    shouldWaitForStartUp = true
    console.log(deviceId)
    // gtag()
    mixpanel.identify(deviceId)
    // window.LogRocket.identify(deviceId, { uuid: deviceId });

    if (!shouldWaitForStartUp) {
        startUp(true)
    }
    
    // Call the function to lock the orientation on page load
    // lockOrientation();
});

// Listen for the orientationchange event and lock the orientation when triggered
window.addEventListener("orientationchange", lockOrientation);

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
    var addToHomeTriggerPopup = document.getElementById('add-to-home-id');
    // var howToTriggerPopup = document.getElementById('how-to-button-id');
    var howToPopup = document.getElementById('how-to-popup');
    
    if (!howToPopup.contains(e.target)) {
        howToPopup.style.display = "none"
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
        //keyboardClickSound.start()
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
    // window.LogRocket.track('clickDismissCompleteLevel', {});
    reportAnalytics("clickDismissCompleteLevel", {})
    
    const popup = document.getElementById("complete-level-popup")
    popup.style.display = "none"
})

document.getElementById("play-again-button").addEventListener("click", (e) => {
    /* When play-again-click Pressed */
    // window.LogRocket.track('clickPlayAgain', {});
    reportAnalytics("clickPlayAgain", {})
    const popup = document.getElementById("out-of-time-popup")
    popup.style.display = "none"
    resetGame()
    if (inFTUE) {
        startTutorial()
    } else {
        generateNewLevel()
    }
    
})

document.getElementById("enterButton").addEventListener("touchstart", (e) => {
    /* When Enter key Pressed */
    // window.LogRocket.track('clickEnter', {});
    handleSubmitChatMessage(chatInput.value)
    chatInput.value = ""
}, {passive: true})

// document.getElementById("how-to-button-id").addEventListener("click", (e) => {
//     /* When "how-to" Pressed */
//     // window.LogRocket.track('clickQuestionMark', {});
//     reportAnalytics("clickQuestionMark", {})
//     const howToPopup = document.getElementById("how-to-popup")
//     howToPopup.style.display = "flex"
// }, {passive: true})

document.getElementById("register-play").addEventListener("click", (e) => {
    const howToPopup = document.getElementById("welcome-popup")
    howToPopup.style.display = "none"

    if (inFTUE) {
        startTutorial(0)
    } else if (shouldWaitForStartUp) {
        shouldWaitForStartUp = false
        startUp(true)
    }
})


document.getElementById("x-how-to-popup-button").addEventListener("click", (e) => {
    /* When "x" Pressed in popup window */
    // window.LogRocket.track('clickXInHowToPopup', {});
    reportAnalytics("clickXInHowToPopup", {})
    const howToPopup = document.getElementById("how-to-popup")
    howToPopup.style.display = "none"
    if (shouldWaitForStartUp) {
        startUp()
    }
})

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
        // window.LogRocket.track('clickEnter', {});
        reportAnalytics("clickEnter", {})
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

/* ---------------------- Tutorial ----------------------- */

class CompleteLevel {
    constructor(level, metaLevel=[]) {
        this.level = level
        if (metaLevel == []) {
            this.metaLevel = level
        } else {
            this.metaLevel = metaLevel
        }
    }
}

const FIRST_LEVELS = [
    new CompleteLevel(level=["cat"], metaLevel=["act","cat"]),
    new CompleteLevel(level=["now", "won"], metaLevel=["now", "own", "won"]),
    new CompleteLevel(level=["easy", "yes"], metaLevel=["easy", "say", "yes", "sea"])
]

function startTutorial(step=0) {
    tutorialProgress = step
    // inFTUE = false
    switch(tutorialProgress) {
        case 0:
            reportAnalytics("BeginFTUE", {})
            resetGame()
            setLevelDS(FIRST_LEVELS[0])
            beginReadyLevel()
            setTimeout(() => {
                appendMessage(pipPlayer, "Hey there, I'm PIP your in-game buddy :)", false, false, EXTRA_CHAT_MESSAGE_DELAY)
                appendMessage(pipPlayer, "Complete the missing words using the highlighted letters on the keyboard.", false, false, 4000)
                startCurrentLevel()
            }, timeoutBetweenLevels)
            break

        case 1:        
        case 2:
            reportAnalytics("StepFTUE", {step: tutorialProgress})
            setLevelDS(FIRST_LEVELS[tutorialProgress])
            beginReadyLevel()
            setTimeout(() => {
                startCurrentLevel()
            }, timeoutBetweenLevels)
            break
        
        case 3: // final
            reportAnalytics("FinishedFTUE", {})
            inFTUE = false
            appendMessage(pipPlayer, "Congratulations! now get ready to play against others!", false, false, EXTRA_CHAT_MESSAGE_DELAY)
            setTimeout(() => {
                startUp(false)
            }, 4000)
            break
    }
    // startUp()
}

/* ---------------------- /Tutorial ----------------------- */
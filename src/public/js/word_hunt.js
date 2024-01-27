//const BASE_URL = "https://wordhunt.gg/"
const BASE_URL = "https://goldfish-app-e7war.ondigitalocean.app/";
// const BASE_URL = "http://127.0.0.1/";
const generateLevelPostURL = BASE_URL + "get_level/";
//const generateLevelPostURL = 'generate_level/'
const registerPostURL = BASE_URL + "register_user/";
const MONTH_NAMES = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const ENTER_KEY_NAME = "Enter"
const SPACE_KEY_NAME = "space"
const BACKSPACE_KEY_NAME = "Backspace"
const outOfTimeString = "OUT OF TIME!"
const OOTRed = "#EF2253";
const DEFAULT_BACKGROUND_COLOR = "#3c4141b2"

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
const LETTER_FILL_V2 = `
<article class="letter-tile-v2">
    <div class="letter valign-text-middle gilroy-extra-extra-bold-cherry-pie-65-1px"> </div>
</article>
`
const EMPTY_TILE = `
<article class="letter-tile-empty">
    <div class="letter valign-text-middle gilroy-extra-extra-bold-cherry-pie-65-1px"> </div>
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
let timeoutBetweenLevels = 2500
let completeLevel
let CurrentImage
let CurrentLevelDS = []
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

class CompleteLevel {
    constructor(currentPhrase, hints, title, color) {
        this.currentPhrase = currentPhrase
        this.leftToGuess = this.currentPhrase.length
        this.finishedLevel = false
        this.maxTries = 5
        this.tries = 0
        this.outOfTries = false
        this.title = title
        this.color = color
        this.gaveUp = false
        // this.availableLetters = shuffle(new Set(this.currentPhrase.join(''))) // TODO: fix to all letters from current phrase
        this.hints = hints
        this.AFTERGAME_MESSAGE = [
            ["AMAZING","You made it on first try!"],
            ["AMAZING","You made it on second try!"],
            ["AMAZING","You made it on third try!"],
            ["AMAZING","You made it on fourth try!"],
            ["NICE","You made it!"]
        ]
    }

    guessWord(word) {
        for (let i=0; i< this.currentPhrase.length; i++) {
            if (word == this.currentPhrase[i]) {
                this.leftToGuess--;
                if (this.leftToGuess == 0) {
                    this.finishedLevel = true;
                }
                return i
            }
        }
        return -1
    }

    checkInputWord(word) {
        let position = this.guessWord(word)
        if (position != -1) {
            addCorrectWord(word, position)
        }
    }

    makeGuess(words) {
        this.tries++;
        if (this.tries == this.maxTries) {
            this.outOfTries = true
        }
        for (let i =0; i < words.length; i++) {
            this.checkInputWord(words[i])
        }
    }

    isFinished() {
        return this.finishedLevel
    }

    highlighAnotherLetter() {
        let hintLetter = this.hints[0]
        this.hints = this.hints.slice(1)

        const buttons = document.querySelectorAll('.keyboard-button')
        buttons.forEach((button) => {
            // button.classList.remove("highlight")
            const letterCount = button.getElementsByClassName('letter-count')[0]
            const letter = button.getElementsByClassName('button-letter')[0]
            letterCount.textContent = ''
            if (letter.textContent[0].toLowerCase() == hintLetter) {
                button.classList.add("keyboard-button-1", "keyboard-button-2")
            }
        })
        //TODO: add highlight functionality
    }

    getAfterGameTitle() {
        if (this.tries >= 5) {
            return this.AFTERGAME_MESSAGE[4][0]
        }
        return this.AFTERGAME_MESSAGE[this.tries-1][0]
    }

    getAfterGameMsg() {
        if (this.tries >= 5) {
            return this.AFTERGAME_MESSAGE[4][1]
        }
        return this.AFTERGAME_MESSAGE[this.tries-1][1]
    }
}

function deleteStar() {
    let stars = document.getElementsByClassName("star-class")
    for (var i=stars.length-1; i>=0; i--) {
        if (stars[i].src.endsWith("img/filled-star.png")) {
            stars[i].src = "img/broken-star.png"
            setScaleAnimation(stars[i])
            return
        }
    }
}

function processWrongGuess() {
    console.log(">processWrongGuess")
    deleteStar()
    completeLevel.highlighAnotherLetter()
}

function giveUp(e) {
    if (completeLevel.outOfTries) {
        completeLevel.gaveUp = true
        completeLevel.makeGuess(completeLevel.currentPhrase) // solve it for the user
        processEndGame()
    }
}

document.getElementById("try-status").addEventListener("click", giveUp)
document.getElementById("try-status").addEventListener("touchstart", giveUp)

function processOutOfTries() {
    console.log(">processOutOfTries")
    let tryStatus = document.getElementById("try-status")
    tryStatus.style.backgroundColor = "#f03a47"
    tryStatus.style.cursor = "pointer"

    let tryStatusX = document.getElementById("try-status-x")
    tryStatusX.style.color = "white"
}

function resetGame() {
    round = 0
    streak = 1
}
 
function addCorrectWord(word, wordIndex) {
    const row = document.getElementsByClassName('word')[wordIndex]
    for (let j = 0; j < row.children.length; j++) {
        let letter = row.children[j].getElementsByClassName("letter")[0]
        letter.innerText = word[j].toUpperCase()
        row.children[j].classList.remove("letter-tile-empty")
        row.children[j].classList.add("letter-tile-v2")
    }
    row.style.gap = "0.1rem"
    setScaleAnimation(row)
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

function displayFinishPopup() {
    let endGameView = document.getElementById("endgame-popup")
    endGameView.style.display = "flex"
    setDark()
}

function processEndGame() {
    let afterGameTitle = document.getElementById("aftergame-title")
    afterGameTitle.innerText = completeLevel.getAfterGameTitle()
    let afterGameMsg = document.getElementById("aftergame-msg")
    afterGameMsg.innerText = completeLevel.getAfterGameMsg()

    setTimeout(() => {
        displayFinishPopup()
    }, timeoutBetweenLevels)
}

function handleSubmitChatMessage(message) {
    if (message.length <= 0) {
        return
    }
    
    let messageWords = message.split(" ")
    completeLevel.makeGuess(messageWords)

    if (!completeLevel.isFinished()) {
        if (completeLevel.outOfTries) {
            processOutOfTries()
        }
        processWrongGuess()
    } else {
        processEndGame()
    }

    // console.log("Handle Chat Message")
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


function setScaleAnimation(element) {
    element.style.animationDuration = "0.7s";
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

function setAvailableLetters() {

}

function createPhraseTiles(board) {
    //split into rows
    let rowStrings = []
    let rowString = completeLevel.currentPhrase[0]
    for (let i = 1; i < completeLevel.currentPhrase.length; i++) { // potential issue if there is a word of length 12
        if (rowString.length + completeLevel.currentPhrase[i].length + 1 <= 12) {
            // the +1 is for the " " that we have to add between letters
            rowString += " " + completeLevel.currentPhrase[i]
        } else {
            rowStrings.push(rowString)
            rowString = completeLevel.currentPhrase[i]
        }
        if (i == completeLevel.currentPhrase.length - 1) {
            rowStrings.push(rowString)
        }
    }

    if (rowStrings.length == 0) {
        // one word challenge
        rowStrings.push(rowString)
    }

    // create matching rows
    for (let index = 0; index < rowStrings.length; index++) {
        let rowString = rowStrings[index]
        const row = document.createElement('div')
        row.className = 'line'

        // create row with tiles and spaces
        words = rowString.split(' ')
        CurrentLevelDS.push(words)
        for (let i = 0; i < words.length; i++) {
            const word = document.createElement('div')
            word.className = 'word'
            for (let j = 0; j < words[i].length; j++) {
                word.innerHTML += EMPTY_TILE
            }
            row.appendChild(word)
        }

        board.appendChild(row)
    }

    let view = document.getElementById("picture-view")
    let padd = ""
    switch(rowStrings.length) {
        case 1:
            padd = "21rem"
            break
        case 2:
            padd = "18rem"
            break
        case 3:
            padd = "15rem"
            break
        case 4:
            padd = "12rem"
            break
    }
    view.style.paddingTop = padd
}

function startTodaysPhrase () {
    // var readyPopup = document.getElementById("ready-level-popup")
    // readyPopup.style.display = "none"
    const keyBackground = document.getElementById("main-view")
    if (completeLevel.color.length > 3) {
        keyBackground.style.backgroundColor = completeLevel.color
    } else {
        keyBackground.style.backgroundColor = DEFAULT_BACKGROUND_COLOR
    }
    const titleElement = document.getElementById("current-category")
    titleElement.innerText = completeLevel.title

    const board = document.getElementsByClassName("words-tiles")[0]
    
    //freezeGame = false
    correctlyGuessed = []
    createPhraseTiles(board)
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

function setLevelDS(currentLevel) {
    completeLevel = new CompleteLevel(currentLevel.phrase.split(' '), currentLevel.hints, currentLevel.title, currentLevel.color)
    CurrentImage = currentLevel.imageURL

    // CurrentPhrase = shuffle(Array.from(CurrentPhrase))
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
    
        const board = document.getElementsByClassName("words-tiles")[0]
        board.innerHTML = ''
        startTodaysPhrase()
        // setTimeout(() => {
        //     startTodaysPhrase()
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

function startUp() {
    // let sideView = document.getElementById("players-side-view-id")
    // sideView.style.display = "flex"
    shouldWaitForStartUp = false
    const d = new Date();
    let month = MONTH_NAMES[d.getMonth()];
    let day = d.getDate();

    let dayElement = document.getElementById("current-day");
    dayElement.innerText = day;

    let monthElement = document.getElementById("current-month");
    monthElement.innerText = month;

    resetGame()
    generateNewLevel()
}

function reportAnalytics(eventName, JSONData) {
    // mixpanel.track(eventName, JSONData)
    // fbq('track', eventName, JSONData)
    // gtag('event', eventName, JSONData);
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

    console.log(deviceId)
    // gtag()
    mixpanel.identify(deviceId)
    // window.LogRocket.identify(deviceId, { uuid: deviceId });

    startUp(true)
    
    // Call the function to lock the orientation on page load
    // lockOrientation();
});

// Listen for the orientationchange event and lock the orientation when triggered
window.addEventListener("orientationchange", lockOrientation);


document.getElementById("how-to-button-id").addEventListener("click", (e) => {
    const howtoLabel = document.getElementById("how-to-button-text")
    howtoLabel.innerText = "CONTINUE"
    const howtoPopup = document.getElementById("howto-popup")
    setDark()
    howtoPopup.style.display = "flex"
    
})

document.onclick = function (e) {
    var addToHomeTriggerPopup = document.getElementById('add-to-home-id');
    // var howToTriggerPopup = document.getElementById('how-to-button-id');
    var howToPopup = document.getElementById('how-to-popup');
    
    if (!howToPopup.contains(e.target)) {
        howToPopup.style.display = "none"
    }
}

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

document.getElementById("enterButton").addEventListener("touchstart", (e) => {
    /* When Enter key Pressed */
    // window.LogRocket.track('clickEnter', {});
    handleSubmitChatMessage(chatInput.value)
    chatInput.value = ""
}, {passive: true})

document.getElementById("how-to-play").addEventListener("click", (e) => {
    /* When "how-to" Pressed */
    // window.LogRocket.track('clickQuestionMark', {});
    reportAnalytics("clickQuestionMark", {})
    const welcomPopup = document.getElementById("welcome-popup")
    welcomPopup.style.display = "none"
    const howToPopup = document.getElementById("howto-popup")
    howToPopup.style.display = "flex"
}, {passive: true})

function setDark() {
    const darken = document.getElementById("darken-id")
    darken.style.display = "block"
}


document.getElementById("register-play").addEventListener("click", (e) => {
    const welcomPopup = document.getElementById("welcome-popup")
    
    welcomPopup.style.display = "none"
})

document.getElementById("howto-play-button").addEventListener("click", (e) => {
    const howtoPopup = document.getElementById("howto-popup")
    howtoPopup.style.display = "none"
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

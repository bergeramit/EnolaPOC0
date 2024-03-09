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
const DEFAULT_BACKGROUND_COLOR = "#302238"

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
let backToMain = true
let alreadySolved = false
let savedScore
let currentDateRiddle

/* Sounds */
// let keyboardClickSound

/* ---------------------- /GlobalsDefines ---------------------- */


/* ---------------------- GameLogic ---------------------- */

class CompleteLevel {
    constructor(currentPhrase, hints, title, color) {
        this.currentPhrase = currentPhrase
        this.leftToGuess = this.currentPhrase.length
        this.solvedIndices = []
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
            ["INCREDIBLE!","YOU MADE IT ON FIRST TRY!"],
            ["AMAZING!","YOU MADE IT ON SECOND TRY!"],
            ["WELL DONE!","YOU MADE IT ON THIRD TRY!"],
            ["GOOD!","YOU MADE IT ON FOURTH TRY!"],
            ["NICE!","YOU MADE IT AT THE LAST MINUTE!"],
            ["AT LEAST YOU TRIED!","THERE'S ALWAYS TOMORROW!"]
        ]
    }
    
    guessWord(word) {
        for (let i=0; i< this.currentPhrase.length; i++) {
            if (word == this.currentPhrase[i]) {
                if (this.solvedIndices.includes(i)) {
                    continue
                }
                this.solvedIndices.push(i)
                this.leftToGuess--;
                if (this.leftToGuess == 0) {
                    this.finishedLevel = true;
                    this.tries--;
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
        let tryStatus = document.getElementById("tries-send-button")
        tryStatus.innerText = 5 - this.tries
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
    
    getRiddleTitle() {
        return "\"" + this.currentPhrase.join(" ") + "\"" 
    }
    
    showLetterOnTiles(hintLetter) {
        for (let i=0; i< this.currentPhrase.length; i++) {
            for (let j=0; j< this.currentPhrase[i].length; j++) {
                if (this.currentPhrase[i][j] == hintLetter) {
                    addCorrectLetter(hintLetter, i, j)
                }
            }
        }
    }
    
    giveHint() {
        setShakeAnimation()
        let hintLetter = this.hints[0]
        this.hints = this.hints.slice(1)
        // this.highlighAnotherLetter(hintLetter)
        this.showLetterOnTiles(hintLetter)
    }
    
    highlighAnotherLetter(hintLetter) {
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
        if (this.tries > 5) {
            return this.AFTERGAME_MESSAGE[5][0]
        }
        return this.AFTERGAME_MESSAGE[this.tries][0]
    }
    
    getAfterGameMsg() {
        if (this.tries > 5) {
            return this.AFTERGAME_MESSAGE[5][1]
        }
        return this.AFTERGAME_MESSAGE[this.tries][1]
    }
    
    getStarsLeft() {
        if (this.tries >= 5) {
            return 0
        }
        return 5 - this.tries
    }
    
    getAfterGameStarIMG() {
        return "img/end" + this.getStarsLeft() + ".png"
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
    completeLevel.giveHint()
}

// function giveUp(e) {
//     if (completeLevel.outOfTries) {
//         completeLevel.gaveUp = true
//         completeLevel.makeGuess(completeLevel.currentPhrase) // solve it for the user
//         processEndGame()
//     } else {
//         let notAvElement = document.getElementById("not-available-id")
//         // notAvElement.style.display = "inline-flex"
//         setFadeAnimation(notAvElement, "3s", 3000)
//         setTimeout(() => {
//             notAvElement.style.display = "none"
//         }, 3000)
//     }
// }

async function share() {
    if (!('share' in navigator)) {
        console.log("Share is not supported")
        return;
    }
    
    const imageUrl = 'img/LevelsBackground/bg.png'; // Replace with the actual URL of your image
    
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageUrl;
    
    image.onload = async () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = image.width;
        canvas.height = image.height;
        
        // Set background color
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image onto the canvas
        context.drawImage(image, 0, 0);
        
        canvas.toBlob(async (blob) => {
            const files = [new File([blob], 'Daily Challenge.png', { type: blob.type })];
            const shareData = {
                text: 'Some text',
                title: 'Some title',
                url: "https://picwiz.ai/src/public/img/LevelsBackground/bg.png",
                files,
            };
            
            if (navigator.canShare(shareData)) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.error(err.name, err.message);
                    }
                }
            } else {
                console.warn('Sharing not supported', shareData);
            }
        });
    }
}

document.getElementById("share-daily-pic").addEventListener("touchstart", (e) => {
    // share()
    // shareWhatsapp()
    window.open('whatsapp://send?text='+encodeURIComponent("https://picwiz.ai/img/LevelsBackground/bg.png"));
})

document.getElementById("share-daily-pic").addEventListener("click", (e) => {
    // share()
    // shareWhatsapp()
    window.open('whatsapp://send?text='+encodeURIComponent("https://picwiz.ai/img/LevelsBackground/bg.png"));
})

function processOutOfTries() {
    console.log(">processOutOfTries")
    
    completeLevel.gaveUp = true
    completeLevel.makeGuess(completeLevel.currentPhrase) // solve it for the user
    processEndGame()
    
    // let tryStatusX = document.getElementById("try-status-x")
    // tryStatusX.src = "img/x-on.png"
    // tryStatusX.style.cursor = "pointer"
}

function resetGame() {
    round = 0
    streak = 1
}

function addCorrectLetter(letter, wordIndex, letterIndex) {
    const row = document.getElementsByClassName('word')[wordIndex]
    if (row.children[letterIndex].classList.contains("letter-tile-v2")) {
        return
    }
    let letterElement = row.children[letterIndex].getElementsByClassName("letter")[0]
    letterElement.innerText = letter.toUpperCase()
    letterElement.style.color = "#989898"
    row.children[letterIndex].classList.remove("letter-tile-empty")
    row.children[letterIndex].classList.add("letter-tile-hint")
    row.style.gap = "0.1rem"
    setInverseScaleAnimation(row.children[letterIndex])
}

function addCorrectWord(word, wordIndex) {
    const row = document.getElementsByClassName('word')[wordIndex]
    for (let j = 0; j < row.children.length; j++) {
        let letter = row.children[j].getElementsByClassName("letter")[0]
        letter.innerText = word[j].toUpperCase()
        letter.style.color = "black"
        row.children[j].classList.remove("letter-tile-empty")
        row.children[j].classList.remove("letter-tile-hint")
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
    // setDark()
}

function processEndGame() {
    let afterGameTitle = document.getElementById("aftergame-title")
    let afterGameMsg = document.getElementById("aftergame-msg")
    let endStarsElement = document.getElementById("end-stars")
    // let endScoreElement = document.getElementById("aftergame-score-text")
    let riddleElement = document.getElementById("aftergame-riddle")
    
    if (!alreadySolved) {
        savedScore = {
            "title": completeLevel.getAfterGameTitle(),
            "msg": completeLevel.getAfterGameMsg(),
            "stars": completeLevel.getAfterGameStarIMG(),
            "starsLeft": completeLevel.getStarsLeft() + "/5",
            "riddle": completeLevel.getRiddleTitle()
        }
        localStorage.setItem("savedScore", JSON.stringify(savedScore))
        localStorage.setItem("savedDate", JSON.stringify({"day": currentDateRiddle.getDate(), "month": currentDateRiddle.getMonth()}))
    } else {
        savedScore = JSON.parse(localStorage.getItem("savedScore"))
    }
    
    afterGameTitle.innerText = savedScore.title
    afterGameMsg.innerText = savedScore.msg
    endStarsElement.src = savedScore.stars
    // endScoreElement.innerText = savedScore.starsLeft
    riddleElement.innerText = savedScore.riddle
    
    if (!alreadySolved) {
        setTimeout(() => {
            displayFinishPopup()
        }, timeoutBetweenLevels)
        return
    }
    displayFinishPopup()
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
    
    function setInverseScaleAnimation(element) {
        element.style.animationDuration = "0.7s";
        element.style.animationTimingFunction = "ease";
        element.style.animationName = "zoom-out-zoom-in";
    }
    
    function setShakeAnimation() {
        let element = document.getElementById("stars-row-id")
        element.style.animationDuration = "0.9s";
        element.style.animationTimingFunction = "ease";
        element.style.animationName = "horizontal-shaking";
        setTimeout(function(e) {
            element.style.animationName = "none"
        }, 400)
    }
    
    function setHintShakeAnimation(element) {
        element.style.animationDuration = "2s";
        element.style.animationTimingFunction = "ease";
        element.style.animationName = "skew-x-shake";
        setTimeout(function(e) {
            element.style.animationName = "none"
        }, 400)
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
            padd = "18rem"
            break
            case 2:
            padd = "15rem"
            break
            case 3:
            padd = "12rem"
            break
            case 4:
            padd = "9rem"
            break
        }
        view.style.paddingTop = padd
    }
    
    function startTodaysPhrase () {
        // var readyPopup = document.getElementById("ready-level-popup")
        // readyPopup.style.display = "none"
        const keyBackground = document.getElementById("main-view")
        // if (completeLevel.color.length > 3) {
        //     keyBackground.style.backgroundColor = completeLevel.color
        // } else {
        // }
        keyBackground.style.backgroundColor = DEFAULT_BACKGROUND_COLOR
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
        
        if (alreadySolved) {
            savedScore = JSON.parse(localStorage.getItem("savedScore"))
            processEndGame()
        }
        // let sideView = document.getElementById("players-side-view-id")
        // sideView.style.display = "flex"
        shouldWaitForStartUp = false
        let month = MONTH_NAMES[currentDateRiddle.getMonth()];
        let day = currentDateRiddle.getDate();
        
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
        // deviceId = localStorage.getItem("deviceId");
        currentDateRiddle = new Date()
        const savedDate = JSON.parse(localStorage.getItem("savedDate"));
        if (savedDate 
            && currentDateRiddle.getDate() == savedDate.day 
            && currentDateRiddle.getMonth() == savedDate.month)
            {
                alreadySolved = true
            }
            
            // console.log(deviceId)
            // gtag()
            mixpanel.identify(deviceId)
            // window.LogRocket.identify(deviceId, { uuid: deviceId });
            
            startUp(true)
            
            // Call the function to lock the orientation on page load
            // lockOrientation();
        });
        
        // Listen for the orientationchange event and lock the orientation when triggered
        window.addEventListener("orientationchange", lockOrientation);
        
        
        // document.onclick = function (e) {
        //     var addToHomeTriggerPopup = document.getElementById('add-to-home-id');
        //     // var howToTriggerPopup = document.getElementById('how-to-button-id');
        //     var howToPopup = document.getElementById('how-to-popup');
        
        //     if (!howToPopup.contains(e.target)) {
        //         howToPopup.style.display = "none"
        //     }
        // }
        
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
        
        
        function fixHowToTop() {
            let howtoElement = document.getElementById("howto-fix-id")
            howtoElement.style.marginTop = "0"
        }
        
        function fixHowToFloat() {
            let howtoElement = document.getElementById("howto-fix-id")
            howtoElement.style.marginTop = "2rem"
        }
        
        document.getElementById("how-to-play").addEventListener("click", (e) => {
            /* When "how-to" Pressed */
            // window.LogRocket.track('clickQuestionMark', {});
            
            fixHowToTop()
            
            reportAnalytics("clickQuestionMark", {})
            const welcomPopup = document.getElementById("welcome-popup")
            welcomPopup.style.display = "none"
            const howToPopup = document.getElementById("howto-popup")
            howToPopup.style.display = "flex"
        }, {passive: true})
        
        document.getElementById("how-to-button-id").addEventListener("click", (e) => {
            /* When "how-to" Pressed */
            // window.LogRocket.track('clickQuestionMark', {});
            backToMain = false
            reportAnalytics("clickQuestionMark", {})
            const howToPopup = document.getElementById("howto-popup")
            howToPopup.style.display = "flex"
            setDark()
            fixHowToFloat()
        }, {passive: true})
        
        document.getElementById("x-howto-button").addEventListener("click", (e) => {
            /* When "how-to" Pressed */
            // window.LogRocket.track('clickQuestionMark', {});
            removeDark()
            reportAnalytics("clickQuestionMark", {})
            if (backToMain) {
                const welcomPopup = document.getElementById("welcome-popup")
                welcomPopup.style.display = "flex"
            }
            const howToPopup = document.getElementById("howto-popup")
            howToPopup.style.display = "none"
        }, {passive: true})
        
        function setDark() {
            const darken = document.getElementById("darken-id")
            darken.style.display = "block"
        }
        
        function removeDark() {
            const darken = document.getElementById("darken-id")
            darken.style.display = "none"
        }
        
        
        document.getElementById("register-play").addEventListener("click", (e) => {
            const welcomPopup = document.getElementById("welcome-popup")
            welcomPopup.style.display = "none"
        })
        
        document.getElementById("howto-play-button").addEventListener("click", (e) => {
            removeDark()
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
            
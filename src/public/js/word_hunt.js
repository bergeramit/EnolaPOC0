//var postURL = "http://64.226.100.123/generate_level/";
const postURL = 'http://127.0.0.1:3000/generate_level/'
let levelDataStructure
let correctlyGuessed = {}
let selectedLettersClasses = ["keyboard-button-1", "keyboard-button-2"]
let EMPTY_TILE = `
<article class="tail">
    <div class="tail-1">
        <div class="highlights"><img class="intersect" src="img/intersect-1.svg" alt="Intersect" /></div>
    </div>
</article>
`
let filled_tile = `
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

let difficulty = 'Easy'

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

window.onload = (event) => {
    console.log("page is fully loaded");
    //let word = document.getElementById("test-1")
    let words = document.querySelectorAll(".word")
    words.forEach((word) => {
        //appendFilledTile(word, 'Q')
        //appendEmptyTile(word)
    });
  };

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
    })
    // buttons.forEach((button) => {
    //     button.classList.remove('button-marked')
    //     button.style.color = 'black'
    //     const letterCount = button.getElementsByClassName('letter-count')[0]
    //     if (letterCount) {
    //         letterCount.textContent = ''
    //         if (availableLetters.includes(button.textContent[0])) {
    //             button.classList.add('button-marked')
    //             button.style.color = 'white'
    //             letterCount.textContent = countLetter(button.textContent, levelDataStructure[0])
    //         }
    //     }
    // })
}

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

generateNewLevel ()
/* ---------------------- /Server API ---------------------- */

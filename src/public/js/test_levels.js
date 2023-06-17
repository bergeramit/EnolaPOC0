
//var postURL = "http://64.226.100.123/generate_level/";
var postURL = "http://127.0.0.1:3000/generate_level/";
var difficulty = "Easy";
var levelDataStructure;
var level_number = 0;
var correctly_guessed = {};

toastr.options.timeOut = 1000;

function appendMessage(username, message) {
  const chatMessages = document.getElementById("chat-messages");
  const messageElement = document.createElement("div");
  messageElement.textContent = username + ": " + message;
  chatMessages.appendChild(messageElement);
  messageElement.scrollIntoView();
}


const buttons = document.querySelectorAll('.pagination a');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((btn) => {
          btn.classList.remove('active');
        });

        button.classList.add('active');
        difficulty = button.textContent;
        console.log(difficulty);
      });
    });

function countLetter(letter, str) {
  var letterCount = 0;
  var lowercaseLetter = letter.toLowerCase();
  var lowercaseString = str.toLowerCase();

  for (var i = 0; i < lowercaseString.length; i++) {
    if (lowercaseString[i] === lowercaseLetter) {
      letterCount++;
    }
  }
    
      return letterCount;
    }

function paint_current_level(current_level) {
  levelDataStructure = current_level;
    letters = Array.from(levelDataStructure[0]);
    console.log(letters );
    let board = document.getElementById("game-board");
    board.innerHTML = "";
    
    for (let i = 0; i < levelDataStructure.length; i++) {
        correctly_guessed[i] = false;
        let row = document.createElement("div");
        row.className = "letter-local";
    
        console.log(levelDataStructure[i]);
        for (let j = 0; j < levelDataStructure[i].length; j++) {
            let box = document.createElement("div");
            box.className = "letter-box";
            row.appendChild(box);
        }
        board.appendChild(row);
    }

    const buttons = document.querySelectorAll('.keyboard-button');
    buttons.forEach((button) => {
      button.classList.remove('button-marked');
      button.style.color = "black";
      var letter_count = button.getElementsByClassName("letter-count")[0];
      if (letter_count){
        letter_count.textContent = "";
        if (letters.includes(button.textContent[0])) {
          button.classList.add('button-marked');
          button.style.color = "white";
          letter_count.textContent = countLetter(button.textContent, levelDataStructure[0]);
        }
      }
    })
}

function checkGuess(guess) {
  //console.log("in CheckGuess");
  for (let i = 0; i < levelDataStructure.length; i++) {
    console.log("Checks: levelDataStructure[1][i]: "+levelDataStructure[i]+" == "+guess);
    if (levelDataStructure[i] == guess && !correctly_guessed[i]) {
      correctly_guessed[i] = true;
      console.log("Sucess! at row: " + i+1);
      var row = document.getElementsByClassName("letter-local")[i];
      for (let j = 0; j < row.children.length; j++) {
        // place word correctly!
        row.children[j].textContent = levelDataStructure[i][j];
      }

      for (const key of Object.keys(correctly_guessed)) {
        if (!correctly_guessed[key]) {
          // There are still empty rows
          return;
        }
      }
      // generate new level
      setTimeout(() => {
        geneate_new_level();
      }, 500); // 500ms
    }
  }
  // add to chat instead
  appendMessage("you", guess);
  //toastr.error("Wrong Guess!"); -> can remove toast from requires
}

document.addEventListener("keyup", (e) => {
  let pressedKey = String(e.key);
  addKeyToInput(pressedKey, false); // actual press
});

function addKeyToInput(pressedKey, on_screen) {
  const guess = document.getElementById('input-guess');
  console.log("reached here");
  if (pressedKey === "Backspace") {
    if (on_screen) {
      guess.value = guess.value.substring(0,guess.value.length - 1);
    }
    return;
  }

  if (pressedKey === "Enter") {
    checkGuess(guess.value);
    // add to chat if not a correct guess
    guess.value = "";
    return;
  }
    console.log("rechecd inside letter");
    console.log(pressedKey);
    console.log(guess.value);

    if (on_screen) {
      guess.value = guess.value + pressedKey.toLowerCase()[0];
    }
}

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target;

    if (!target.classList.contains("keyboard-button")) {
      return;
    }

    let key = target.textContent;
    
    if (key == "Generate Level") {
        geneate_new_level();
        return;
    }
  
    if (key === "Del") {
      key = "Backspace";
    }
  
    //document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
    addKeyToInput(key, true); // onscreen press
  });

function geneate_new_level() {
  correctly_guessed = {};
  let level_number_obj = document.getElementById("level-number");
  level_number += 1;
  level_number_obj.textContent = "Level: "+level_number;
  fetch(postURL, {
    method: "POST",
    headers: {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
    }, 
    body: JSON.stringify({"difficulty": difficulty})
  }).then(response => {
    console.log(response.statusText);
    return response.json();
  })
  .then(data => {
          console.log(data);
          paint_current_level(data);
      })
  return;
}

function setup_starting_level() {
  geneate_new_level();
  appendMessage("WordHunt", "Welcome!");
  appendMessage("WordHunt", "Try and guess the words and communicate with your friends!");
}
setup_starting_level();
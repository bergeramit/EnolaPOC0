
var postURL = "http://64.226.100.123/generate_level/";
//var postURL = "http://127.0.0.1:3000/generate_level/";
var difficulty = "Medium";
var level;

toastr.options.timeOut = 1000;

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
    level = current_level;
    letters = Array.from(level[0]);
    console.log(letters );
    let board = document.getElementById("game-board");
    board.innerHTML = "";
    
    for (let i = 0; i < level.length; i++) {
        let row = document.createElement("div");
        row.className = "letter-local";
    
        console.log(level[i]);
        for (let j = 0; j < level[i].length; j++) {
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
          letter_count.textContent = countLetter(button.textContent, level[0]);
        }
      }
    })
}

function checkGuess(guess) {
  //console.log("in CheckGuess");
  for (let i = 0; i < level.length; i++) {
    console.log("Checks: level[1][i]: "+level[i]+" == guess:"+guess);
    if (level[i] == guess) {
      console.log("Sucess! at row: " + i+1);
      var row = document.getElementsByClassName("letter-local")[i];
      for (let j = 0; j < row.children.length; j++) {
        row.children[j].textContent = level[i][j];
      }
      return;
    }
  }

  toastr.error("Wrong Guess!");
}

document.addEventListener("keyup", (e) => {
  let pressedKey = String(e.key);
  const guess = document.getElementById('input-guess');
  console.log("reached here");
  if (pressedKey === "Backspace") {
    guess.textContent = guess.textContent.substring(0,guess.textContent.length - 1);
    return;
  }

  if (pressedKey === "Enter") {
    checkGuess(guess.textContent);
    guess.textContent = "";
    return;
  }

  let found = pressedKey.match(/[a-z]/gi);
  if (!found || found.length > 1) {
    return;
  } else {
    console.log("rechecd inside letter");
    console.log(pressedKey);
    console.log(guess.textContent);
    guess.textContent = guess.textContent + pressedKey.toLowerCase()[0];
  }
});

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target;

    if (!target.classList.contains("keyboard-button")) {
      return;
    }

    let key = target.textContent;
    
    if (key == "Generate Level") {
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
  
    if (key === "Del") {
      key = "Backspace";
    }
  
    document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
  });

function setup_starting_level() {
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
}
setup_starting_level();
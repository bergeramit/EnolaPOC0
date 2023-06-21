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
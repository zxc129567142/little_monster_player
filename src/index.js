import { mPost, mGet, getPVal, getRootVar } from './func.js';
import Player from './player.js';
import "./main.css";

const list_div = document.querySelector("#player_list > div");

const control = document.querySelector("#player_control_panel");
const play = control.querySelector("#play");
const pause = control.querySelector("#pause");

const player = new Player(list_div, control);
player.init();
player.volume(10);
window.player = player

// const progress_bar = control.querySelector(".progress_bar_main")
const skip_previous = control.querySelector("#skip_previous")
const play_and_pause = control.querySelector("#play_and_pause")
const skip_next = control.querySelector("#skip_next")
const volume = control.querySelector("#volume")

skip_next.onclick = () => {
    player.next();
}

skip_previous.onclick = () => {
    player.previous()
}

play_and_pause.onclick = () => {
    switch (player.state) {
        case "playing":
            play.style.display = "block";
            pause.style.display = "none";
            player.pause();
            break;
        case "pause":
            play.style.display = "none";
            pause.style.display = "block";
            player.play();
            break;
        default:
            break;
    }
    // if (player.state !== "playing") player.play();
    // else player.pause();

}

// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
window.onkeyup = (e) => {
    switch (e.code) {
        case "ArrowLeft":
            player.previous()
            break;
        case "ArrowRight":
            player.next();
            break;

        default:
            break;
    }
}

// console.log(player.volume);

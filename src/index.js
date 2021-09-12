// import { mPost, mGet, getPVal, getRootVar } from './func.js';
import Player from './player.js';
import "./main.css";

const list_div = document.querySelector("#player_list > div");

const control = document.querySelector("#player_control_panel");
// const play = control.querySelector("#play");
// const pause = control.querySelector("#pause");

const player = new Player(list_div, control);

// const progress_bar = control.querySelector(".progress_bar_main")
const skip_previous = control.querySelector("#skip_previous")
const play_and_pause = control.querySelector("#play_and_pause")
const skip_next = control.querySelector("#skip_next")
// const volume = control.querySelector("#volume")

skip_next.onclick = () => {
    player.next();
}

skip_previous.onclick = () => {
    player.previous()
}

play_and_pause.onclick = () => {
    switch (player.state) {
        case "playing":
            player.pause();
            break;
        case "pause":
            player.play();
            break;
        default:
            break;
    }
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
window.onload = () => {
    player.init();
    window.player = player;
}

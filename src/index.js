// import 'regenerator-runtime/runtime'
import { mPost, mGet, getPVal, getRootVar } from './func.js';
import Player from './player.js';
import "./main.css";
// import image from './audio/13i0STTSPqI.jpg'

// console.log(image);

// const player_control_panel = document.querySelector("#player_control_panel");
const list_div = document.querySelector("#player_list > div");
// const list_scroll = player_list.querySelector("#player_list_scroll");
// const playlist = CD_DATA.playlist

// const eventCD = () => {

// }

const player = new Player(list_div, document.querySelector("#player_control_panel"));
player.init()
window.player = player

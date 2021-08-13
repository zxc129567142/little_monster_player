// import 'regenerator-runtime/runtime'
import { mPost, mGet, getPVal, getRootVar } from './func.js';
import CD_DATA from "./data.json";
import "./main.css";
import image from './audio/13i0STTSPqI.jpg'

console.log(image);

const player_list = document.querySelector("#player_list > div");
const list_scroll = player_list.querySelector("#player_list_scroll");

const initCD = () => {

    const calcWidthDiff = () => {
        const cd_center = document.querySelector(".player_cd.cd_center");
        const cd = document.querySelector(".player_cd:not(.cd_center)");
        const maxW = getPVal(cd_center,"width").replace(/\D+/, "");
        const minW = getPVal(cd, "width").replace(/\D+/, "");
        console.log("maxW: " + maxW,"minW: " + minW);
        return (maxW - minW)
    }

    const getFS = getPVal(document.body, "font-size").replace(/\D+/, "");

    const player_cd = list_scroll.querySelectorAll(".player_cd");
    if (player_cd.length === 0) return;

    function importAll(r) {
        return r.keys().map(r);
    }

    const images = importAll(require.context('./audio', false, /\.jpg$/));

    console.log(images);

    // const widthDiff = calcWidthDiff();
    // console.log("widthDiff: " + widthDiff);
    const center = player_list.clientWidth / 2;
    const scroll_width = list_scroll.clientWidth / 2;
    // console.log(center);
    // player_list.getBoundingClientRect()

    let cd_pre = list_scroll.querySelector(".player_cd.cd_center");

    let scroll_left = 0


    for (const cd of player_cd) {
        cd.onclick = (e) => {
            console.log(e);
            const _this = e.target
            if (cd_pre === _this) return;
            if (cd_pre) cd_pre.classList.remove("cd_center")
            _this.classList.add("cd_center")
            const rects = _this.getBoundingClientRect()
            const leftToCenter = rects.left + rects.width / 2;
            // const leftToCenterDiff = rects.left + (rects.width + widthDiff) / 2;

            scroll_left = scroll_left + ~(leftToCenter - center )
            // const temp2 = temp1 + ~(temp1 - leftToCenter)
            list_scroll.style.left = `${ scroll_left }px`
            console.log(leftToCenter, leftToCenter - center);
            cd_pre = _this
        }
    }

    player_cd[0].click();

}

const addCD = (data) => {
    const importAll = r => {
        let images = {};
        r.keys().forEach(item => { images[item.replace('./', '')] = r(item); });
        return images
    }
    const images = importAll(require.context('./audio', false, /\.jpg$/));
    console.log(images);

    // list_scroll
    //! center_line
    // const list = data.playlist
    let html = '';
    // console.log(data.playlist[0]);
    for (const item of data.playlist) {
        if (!item.enabled) continue;
        html += `<div class="center_line player_cd" style="background-image: url(${images[item.id + ".jpg"]});"></div>`
        console.log((item.id + ".jpg"),images[item.id + ".jpg"]);
    }

    list_scroll.insertAdjacentHTML("beforeend", html);

    // return;
    // initCD()
}

(async () => {
    addCD(CD_DATA)
})()

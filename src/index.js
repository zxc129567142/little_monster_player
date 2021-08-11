import "./main.css"

// console.log("Hello World!");

const getPVal = (dom,val) => window.getComputedStyle(dom).getPropertyValue(val)
const getRootVar = v => (typeof v === "string") ? getPVal(document.documentElement, '--' + v).trim() : "";

const calcWidthDiff = () => {
    const cd_center = document.querySelector(".player_cd.cd_center");
    const cd = document.querySelector(".player_cd:not(.cd_center)");
    const maxW = getPVal(cd_center,"width").replace(/\D+/, "");
    const minW = getPVal(cd, "width").replace(/\D+/, "");
    console.log("maxW: " + maxW,"minW: " + minW);
    return (maxW - minW)
}

const getFS = getPVal(document.body,"font-size").replace(/\D+/, "")

const player_list = document.querySelector("#player_list > div")
const list_scroll = document.querySelector("#player_list_scroll")
const player_cd = document.querySelectorAll(".player_cd")

const widthDiff = calcWidthDiff();
console.log("widthDiff: " + widthDiff);
const center = player_list.clientWidth / 2
const scroll_width = list_scroll.clientWidth / 2
// console.log(center);
// player_list.getBoundingClientRect()

let cd_pre = document.querySelector(".player_cd.cd_center")

let scroll_left = 0


for (const cd of player_cd) {
    cd.onclick = (e) => {
        const _this = e.target
        if (cd_pre === _this) return;
        if (cd_pre) cd_pre.classList.remove("cd_center")
        _this.classList.add("cd_center")
        const rects = _this.getBoundingClientRect()
        console.log(rects);
        const leftToCenter = rects.left + rects.width / 2;
        const leftToCenterDiff = rects.left + (rects.width + widthDiff) / 2;
        console.log("rects.left: " + rects.left);
        console.log("rects.width: " + rects.width);
        // scroll_left = ~~(rects.left - (leftToCenter - center))

        scroll_left = scroll_left + ~(leftToCenterDiff - center )
        // const temp2 = temp1 + ~(temp1 - leftToCenter)
        list_scroll.style.left = `${ scroll_left }px`
        console.log(leftToCenterDiff, leftToCenterDiff - center);
        cd_pre = _this
    }
}

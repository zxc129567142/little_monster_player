import "./main.css"

// console.log("Hello World!");

const player_list = document.querySelector("#player_list > div")
const list_scroll = document.querySelector("#player_list_scroll")
const player_cd = document.querySelectorAll(".player_cd")

const center = player_list.clientWidth / 2
const scroll_center = list_scroll.clientWidth / 2
// console.log(center);
// player_list.getBoundingClientRect()

let cd_pre = document.querySelector(".player_cd.cd_center")

for (const cd of player_cd) {
    cd.onclick = (e) => {
        const _this = e.target
        if (cd_pre === _this) return;
        if (cd_pre) cd_pre.classList.remove("cd_center")
        _this.classList.add("cd_center")
        const rects = _this.getBoundingClientRect()
        console.log(rects);
        const leftToCenter = rects.left + rects.width / 2;
        const temp1 = ~~(rects.left - (leftToCenter - center))
        // const temp2 = temp1 + ~(temp1 - leftToCenter)
        list_scroll.style.left = `${ temp1 }px`
        console.log(leftToCenter,leftToCenter - center,rects.left,temp1);
        cd_pre = _this
    }
}

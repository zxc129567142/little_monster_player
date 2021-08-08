import "./main.css"

// console.log("Hello World!");

const player_cd = document.querySelectorAll(".player_cd")

let cd_pre = null

for (const cd of player_cd) {
    cd.onclick = (e) => {
        const _this = e.target
        if (cd_pre) cd_pre.classList.remove("cd_center")
        _this.classList.add("cd_center")
        cd_pre = _this
    }
}

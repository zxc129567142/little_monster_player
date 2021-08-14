import data from "./data.json";
const playlist = data.playlist;

// https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Classes
// https://shubo.io/javascript-class/

// https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API
// https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement

export default class Player {
    constructor(list_div, control) {
        this.data = data;
        this.list_div = list_div;
        this.control = control;
    }
    init_list() {
        // 載入列表
        const import_images = (r) => {
            // 載入多圖，須配合 webpack 設定
            let images = {};
            r.keys().forEach(item => { images[item.replace('./', '')] = r(item).default;});
            return images
        }
        const images = import_images(require.context('./audio', false, /\.jpg$/));

        let html = '';
        // console.log(playlist["cIUrS5w9NbM"]);
        for (const id in playlist) {
            if (!Object.hasOwnProperty.call(playlist, id)) continue;
            const item = playlist[id];
            if (!item.enabled) continue;
            html += `<div class="center_line player_cd bg_img" data-id="${item.id}" style="background-image: url('${images[item.id + ".jpg"]}');"></div>`
        }

        this.cd_list.insertAdjacentHTML("beforeend", html);
        this.cds = this.cd_list.querySelectorAll(".player_cd");
        this.max = playlist.length
    }
    init_list_event() {
        // 載入列表後給 CD 加上事件
        if (this.cds && this.cds.length === 0) return;
        let scroll_left = 0;

        // const calcWidthDiff = () => {
        //     const cd_center = document.querySelector(".player_cd.cd_center");
        //     const cd = document.querySelector(".player_cd:not(.cd_center)");
        //     const maxW = getPVal(cd_center,"width").replace(/\D+/, "");
        //     const minW = getPVal(cd, "width").replace(/\D+/, "");
        //     console.log("maxW: " + maxW,"minW: " + minW);
        //     return (maxW - minW)
        // }

        // const getFS = getPVal(document.body, "font-size").replace(/\D+/, "");

        // const widthDiff = calcWidthDiff();
        // console.log("widthDiff: " + widthDiff);
        const center = this.list_div.clientWidth / 2;
        // const scroll_width = list_scroll.clientWidth / 2;

        // let cd_pre = this.cd_list.querySelector(".player_cd.cd_center");

        for (const cd of this.cds) {
            cd.onclick = (e) => {
                const _this = e.target;
                if (this.cd_pre === _this) return;
                if (this.cd_pre) this.cd_pre.classList.remove("cd_center");
                _this.classList.add("cd_center");

                const vID = _this.dataset.id
                console.log(playlist[vID]);

                const rects = _this.getBoundingClientRect()
                console.log(rects);
                const leftToCenter = rects.left + rects.width / 2;
                // const leftToCenterDiff = rects.left + (rects.width + widthDiff) / 2;

                scroll_left = scroll_left + ~(leftToCenter - center )
                this.cd_list.style.left = `${ scroll_left }px`
                console.log(leftToCenter,center, leftToCenter - center);
                this.cd_pre = _this
            }
        }
    }
    // 初始化
    init() {
        this.cd_list = this.list_div.querySelector("#player_list_scroll");
        this.cd_list.innerHTML = "";
        this.cds = null;
        this.cd_pre = null;
        this.min = 0; // cd 最小位置
        this.now = -1; // cd 當前位置
        this.max = 0; // cd 最大位置
        this.init_list();
        this.init_list_event();
    }
    // 播放
    play() { }
    // 暫停
    pause() { }
    // 下一首
    next() {
        this.now += 1
        if (this.now > this.max) this.now = this.max
        this.cd_pre = this.cds[now]
        this.cd_pre.click();
    }
    // 上一首
    previous() {
        this.now -= 1
        if (this.now < this.min) this.now = this.min
        this.cd_pre = this.cds[now]
        this.cd_pre.click();
    }
}


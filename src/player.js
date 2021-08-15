import data from "./data.json";
const playlist = data.playlist;

// https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Classes
// https://shubo.io/javascript-class/

// https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API
// https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement

export default class Player {
    constructor(list_div, control) {
        this.list_div = list_div;
        this.control = control;
        this.prog_bar_bg = control.querySelector(".progress_bar_bg");
        this.prog_bar_main = control.querySelector(".progress_bar_main");

        this.data = data;
        this.cd_list = this.list_div.querySelector("#player_list_scroll");
        this.cd_list.innerHTML = "";
        this.cds = null;
        this.cd_pre = null;
        this.min = 0; // cd 最小位置
        this.now = -1; // cd 當前位置
        this.max = -1; // cd 最大位置
        this.vol = 50;
        this.state = "none"

        this.audio = null;
    }
    mult_import(r) {
        // 載入，須配合 webpack 設定
        let mult = {};
        r.keys().forEach(item => { mult[item.replace('./', '')] = r(item).default;});
        return mult
    }
    init_list() {
        // 載入列表
        const images = this.mult_import(require.context('./audio', false, /\.jpg$/));

        let html = '';
        for (const id in playlist) {
            if (!Object.hasOwnProperty.call(playlist, id)) continue;
            const item = playlist[id];
            if (!item.enabled) continue;
            html += `<div class="center_line player_cd bg_img" data-id="${item.id}" style="background-image: url('${images[item.id + ".jpg"]}');"></div>`
            this.max += 1
        }

        this.cd_list.insertAdjacentHTML("beforeend", html);
        this.cds = this.cd_list.querySelectorAll(".player_cd");
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

        // const mult_import = (r) => {
        //     // 載入多圖，須配合 webpack 設定
        //     let images = {};
        //     r.keys().forEach(item => { images[item.replace('./', '')] = r(item).default;});
        //     return images
        // }
        // const images = mult_import(require.context('./audio', false, /\.jpg$/));


        const sources = this.mult_import(require.context('./audio', false, /\.m4a$/));

        this.cds.forEach((cd,idx) => {
            cd.onclick = (e) => {
                const _this = e.target;
                if (this.cd_pre === _this) return;
                if (this.cd_pre) this.cd_pre.classList.remove("cd_center");
                _this.classList.add("cd_center");
                this.pause();

                // console.log("idx",this.now);

                const vID = _this.dataset.id
                // const file_name = vID + ".m4a"
                // console.log(playlist[vID]);
                this.audio.src = sources[vID + ".m4a"];

                this.now = idx;

                const rects = _this.getBoundingClientRect();
                const leftToCenter = rects.left + rects.width / 2;
                // const leftToCenterDiff = rects.left + (rects.width + widthDiff) / 2;

                scroll_left = scroll_left + ~(leftToCenter - center )
                this.cd_list.style.left = `${ scroll_left }px`
                this.cd_pre = _this

                // this.play();
            }
        })

    }
    init_audio() {
        let audio = new Audio();
        audio.loop = false;

        audio.type = "audio/m4a"
        audio.volume = this.vol / 100 // 0.0 ~ 1.0
        audio.addEventListener("canplaythrough", e => {
            console.log("[canplaythrough]",this.audio.duration);
            this.play();
        });

        audio.addEventListener('loadstart', ()=> {
            console.log("[loadstart]");
            this.progress_bar(0)
        });

        audio.addEventListener('progress', ()=> {
            console.log("[progress]");
        });

        audio.addEventListener("canplay", () => {
            console.log("[canplay]");
        });

        audio.addEventListener('timeupdate', () => {
            // console.log("[timeupdate]",e,audio.currentTime);
            // console.log("[timeupdate]", audio.currentTime);
            this.progress_bar(this.audio.currentTime)
        });

        audio.addEventListener("readyState", () => {
            console.log("[readyState]");
        });

        audio.addEventListener('ended', () => {
            console.log('[ended]', this.audio.ended);
            if (this.audio.ended) return this.next();
        });

        this.audio = audio;
    }
    // 初始化
    init() {
        this.init_audio();
        this.init_list();
        this.init_list_event();
        this.next();
    }
    // 競渡條
    progress_bar(value) {
        value = (typeof value !== "number") ? 0 : value
        const max = this.audio.duration
        // value =
        let pass = value / max * 100
        pass = (pass >= 100) ? 100 : pass
        // this.prog_bar_bg
        this.prog_bar_main.style.width = pass + "%"

    }
    // 播放
    play() {
        if (this.state === "playing") return;
        this.state = "playing";
        this.audio.play();
    }
    // 暫停
    pause() {
        if (this.state === "pause") return;
        this.state = "pause";
        this.audio.pause();
    }
    // 下一首
    next() {
        this.now += 1
        if (this.now > this.max) return this.now = this.max;
        this.cds[this.now].click();
    }
    // 上一首
    previous() {
        this.now -= 1
        if (this.now < this.min) return this.now = this.min;
        this.cds[this.now].click();
    }
    // 音量
    volume(val) {
        if (typeof val !== "number") return;
        if (val < 0) this.audio.volume = 0
        if (val > 100) this.audio.volume = 100
        this.audio.volume = val / 100;
    }

    // get state() { return this.state }
    // get volume() { return this.vol }
    get now_play() { return playlist[(this.cds[this.now].dataset.id)] }
}


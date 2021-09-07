import { getPVal } from './func.js';
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

        this.control_play = control.querySelector("#play");
        this.control_pause = control.querySelector("#pause");

        // this.data = data;
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
    // 需動態載入多項素材
    mult_import(r) {
        // 載入，須配合 webpack 設定
        let mult = {};
        r.keys().forEach(item => { mult[item.replace('./', '')] = r(item).default;});
        return mult
    }
    // 處史話 載入列表
    init_list() {
        // 載入列表
        const images = this.mult_import(require.context('./audio', false, /\.jpg$/));

        let html = '';
        for (const id in playlist) {
            if (!Object.hasOwnProperty.call(playlist, id)) continue;
            const item = playlist[id];
            if (!item.enabled) continue;
            playlist[id].artwork = images[item.id + ".jpg"]
            html += `<div class="player_cd bg_img" data-id="${item.id}" style="background-image: url('${images[item.id + ".jpg"]}');"></div>`
            this.max += 1
        }

        this.cd_list.insertAdjacentHTML("beforeend", html);
        this.cds = this.cd_list.querySelectorAll(".player_cd");
    }
    // 初始化 列表相關事件
    init_list_event() {
        // 載入列表後給 CD 加上事件
        if (this.cds && this.cds.length === 0) return;

        let scroll_left = 0;
        const center = this.list_div.clientWidth / 2;
        const left = this.list_div.offsetLeft;
        const sources = this.mult_import(require.context('./audio', false, /\.m4a$/));

        // ! 不明多偏移了 2px， border width 無關
        // const borderWidth = parseInt(getPVal(this.cds[0],"border-top-width").replace(/[^\d]/g,"")) * 2

        this.cds.forEach((cd, idx) => {

            cd.onclick = (e) => {
                const _this = e.target;
                if (this.cd_pre === _this) return;
                if (this.cd_pre) this.cd_pre.classList.remove("cd_center");
                this.pause();
                this.progress_bar(this.prog_bar_pre, 0);
                this.progress_bar(this.prog_bar_main, 0);
                _this.classList.add("cd_center");

                const vID = _this.dataset.id
                this.audio.src = sources[vID + ".m4a"];

                const drctn = (idx > this.now) ? -1 : 1;
                this.now = idx;

                const rects = _this.getBoundingClientRect();
                const leftToCenter = rects.left + (rects.width + 96 * drctn) / 2;

                // ! 不明多偏移了 2px，還找不到原因
                scroll_left = scroll_left + ~(leftToCenter - center) + left + 2
                this.cd_list.style.left = `${ scroll_left }px`
                this.cd_pre = _this

                this.updateInfo(this.now_play);
            }
        })

    }
    // 初始化 音樂相關
    init_audio() {
        const time_now = this.control.querySelector(".time_now"); // * 當前時長
        const time_ttl = this.control.querySelector(".time_ttl"); // * 總時長

        let audio = new Audio();
        audio.loop = false;

        audio.type = "audio/m4a"
        audio.volume = this.vol / 100 // 0.0 ~ 1.0
        audio.addEventListener("canplay", () => {
            console.log("[canplay]");
        });

        audio.addEventListener("canplaythrough", () => {
            console.log("[canplaythrough]");
            this.play();
            // * 音樂完整長度
            time_ttl.textContent = this.time_format(~~this.audio.duration);
        });

        audio.addEventListener('loadstart', () => {
            console.log("[loadstart]");
            this.progress_bar(this.prog_bar_main, 0);
            this.progress_bar(this.prog_bar_pre, 0);
        });

        audio.addEventListener('progress', () => {
            if (this.audio.readyState === 4) this.progress_bar(this.prog_bar_pre,this.audio.seekable.end(0))
        });

        audio.addEventListener('timeupdate', () => {
            // * 當前播放時間
            this.progress_bar(this.prog_bar_main ,this.audio.currentTime);
            time_now.textContent = this.time_format(~~this.audio.currentTime);
        });

        audio.addEventListener("readyState", () => {
            console.log("[readyState]");
        });

        audio.addEventListener("play", () => {
            this.play();
        });

        audio.addEventListener("pause", () => {
            this.pause();
        });

        audio.addEventListener('ended', () => {
            console.log('[ended]');
            if (this.audio.ended) return this.next();
        });

        this.audio = audio;
    }
    // 初始化 進度條相關
    init_prog_bar() {
        this.prog_bar = this.control.querySelector(".progress_bar");
        this.prog_bar_bg = this.prog_bar.querySelector(".progress_bar_bg");
        this.prog_bar_main = this.prog_bar.querySelector(".progress_bar_main");
        this.prog_bar_pre = this.prog_bar.querySelector(".progress_bar_pre");
        this.prog_bar_hover = this.prog_bar.querySelector(".progress_bar_hover");

        this.time_hint = this.control.querySelector("#time_hint");

        const fs = getPVal(document.documentElement,"font-size").replace("px","")

        const width = this.prog_bar.clientWidth

        this.prog_bar.onmousemove = (e) => {
            const rate = (e.offsetX / width * 100)
            this.prog_bar_hover.style.width = rate + "%"

            time_hint.classList.add("show")

            const time = rate * this.audio.duration / 100
            time_hint.textContent = this.time_format(~~time)

            let posX = e.offsetX - time_hint.offsetWidth / 2
            switch (true) {
                case posX < fs:
                    posX = fs
                    break;
                case posX > (width - time_hint.offsetWidth - fs):
                    posX = width - time_hint.offsetWidth - fs
                    break;
            }

            time_hint.style.left = posX + "px"

        }

        this.prog_bar.onmouseout = (e) => {
            this.prog_bar_hover.style.width = "0%"
            time_hint.classList.remove("show")
        }

        this.prog_bar.onclick = (e) => {
            this.set_time((e.offsetX / width * 100) * this.audio.duration / 100);
        }
    }
    // 初始化
    init() {
        const loading = document.querySelector("#loading")
        const load_prog_bar = loading.querySelector(".progress_bar_main")
        loading.classList.remove("close");
        load_prog_bar.style.width = "0%"
        this.init_prog_bar();
        load_prog_bar.style.width = "30%"
        this.init_audio();
        load_prog_bar.style.width = "60%"
        this.init_list();
        load_prog_bar.style.width = "90%"
        this.init_list_event();
        load_prog_bar.style.width = "100%"
        loading.classList.add("close");
        this.next();
    }
    // 競渡條
    progress_bar(_prog_bar,value) {
        value = (typeof value !== "number") ? 0 : value
        const max = this.audio.duration
        let pass = value / max * 100
        pass = (pass >= 100) ? 100 : pass
        _prog_bar.style.width = pass + "%"
    }
    // 秒數格式化成時間
    time_format (sec) {
        let mine = ~~(sec / 60);
        sec = sec % 60
        return `${mine < 10 ? `0${mine}`:mine}:${sec < 10 ? `0${sec}`:sec}`
    }
    // 跳時間點
    set_time(time) {
        this.progress_bar(this.prog_bar_main, time);
        this.audio.currentTime = time;
    }
    // 播放
    play() {
        if (this.state === "playing") return;
        this.state = "playing";
        play.style.display = "none";
        pause.style.display = "block";
        this.audio.play();
        this.updateMetadata(this.now_play);
    }
    // 暫停
    pause() {
        if (this.state === "pause") return;
        this.state = "pause";
        play.style.display = "block";
        pause.style.display = "none";
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
        if (typeof val !== "number") return this.vol;
        if (val < 0) this.audio.volume = 0;
        if (val > 100) this.audio.volume = 100;
        this.audio.volume = val / 100;
        this.vol = val;
        return val
    }

    updateInfo(info) {
        const info_title = this.control.querySelector(".info_title");
        const info_author = this.control.querySelector(".info_author");
        // const info_type = this.control.querySelector(".info_type");
        info_title.textContent = info.title;
        info_author.textContent = data.username;
        // info_type.textContent = info.type;
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
    updateMetadata(event) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: event.title,
                artist: data.username,
                // album: "Podcast Title",
                artwork: [
                    {src: event.artwork, sizes: "128x128", type: "image/jpeg"},
                    // {src: "podcast_hd.jpg", sizes: "256x256"},
                    // {src: "podcast_hd.png", sizes: "256x256", type: "image/png"},
                    // {src: "podcast.ico", sizes: "128x128 256x256", type: "image/x-icon"}
                ]
            });
        }
    }

    // get state() { return this.state }
    // get volume() { return this.vol }
    get now_play() { return playlist[(this.cds[this.now].dataset.id)] }
}


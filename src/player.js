import { getPVal } from './func.js';
import data from "./data.json";
const playlist = data.playlist;

// https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Classes
// https://shubo.io/javascript-class/

// https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API
// https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement

const sleep = ms => new Promise(done => setTimeout(() => done(), ms));

// 需動態載入多項素材
const mult_import = r => {
    // 載入，須配合 webpack 設定
    let mult = {};
    r.keys().forEach(item => { mult[item.replace('./', '').replace(/\.\w+$/g,"")] = r(item).default;});
    return mult
}

export default class Player {
    constructor(list_div, control, sidebar) {
        this.list_div = list_div;
        this.control = control;
        this.list = sidebar.querySelector("#player_list");
        this.info = sidebar.querySelector("#player_info");

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
    // 初始化 載入列表
    init_list() {
        // 載入列表
        const images = mult_import(require.context('./audio', false, /\.jpg$/));

        let html = '';
        let html2 = '';
        for (const id in playlist) {
            if (!Object.hasOwnProperty.call(playlist, id)) continue;
            const item = playlist[id];
            if (!item.enabled) continue;
            playlist[id].artwork = images[item.id]
            html += `<div class="player_cd bg_img" data-id="${item.id}" style="background-image: url('${images[item.id]}');">
                    <div class="player_cd_info absolute left-0 -bottom-8 py-1 w-full h-8 text-base leading-4 text-white flex items-center justify-center" style="background-color: var(--select-color);">
                        <div class="pointer-events-none mask_img w-full h-full"></div>
                    </div>
                </div>`
            this.max += 1

            html2 +=
            `<div data-id="${item.id}" data-idx="${this.max}" class="h-16 w-full flex flex-nowrap flex-row items-center gap-1 py-1 cursor-pointer">
                <div class="h-full flex items-center justify-center">
                    <svg fill="#FFFFFF" class="w-10 h-10" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"></path></svg>
                </div>
                <div class="h-full w-16">
                    <div class="bg_img w-full h-full" style="background-image: url('${images[item.id]}');"></div>
                </div>
                <div><div class="truncate">${item.title}</div><div class="time_ttl">00:00</div></div>
                <div></div>
            </div>`
        }

        this.cd_list.insertAdjacentHTML("beforeend", html);
        this.cds = this.cd_list.querySelectorAll(".player_cd");

        this.list.insertAdjacentHTML("beforeend", html2);

        this.list.onclick = e => {
            const _this = e.target;
            if (!_this.dataset.id) return;
            const cd = this.cd_list.querySelector(`.player_cd[data-id='${_this.dataset.id}']`);
            cd.click();
        }
    }
    // 初始化 列表相關事件
    init_list_event() {
        // 載入列表後給 CD 加上事件
        if (this.cds && this.cds.length === 0) return;

        let scroll_left = 0;
        const center = this.list_div.clientWidth / 2;
        const left = this.list_div.offsetLeft;
        const sources = mult_import(require.context('./audio', false, /\.m4a$/));

        // ! 不明多偏移了 2px， border width 無關
        // const borderWidth = parseInt(getPVal(this.cds[0],"border-top-width").replace(/[^\d]/g,"")) * 2

        const info_modal = document.querySelector("#info_modal")

        this.cds.forEach((cd, idx) => {

            cd.onclick = (e) => {
                const _this = e.target;
                if (_this.className.indexOf("player_cd_info") >= 0) {
                    // console.log(this.now_play);
                    const data = this.now_play
                    const title = info_modal.querySelector(".modal_title > div");
                    title.textContent = data.title

                    const pubic_date = info_modal.querySelector(".cd_pubic_date .value");
                    pubic_date.textContent = new Date(data.publishedAt).toLocaleString();

                    const view = info_modal.querySelector(".icon_view + .value");
                    const like = info_modal.querySelector(".icon_like + .value");
                    const dislike = info_modal.querySelector(".icon_dislike + .value");
                    const comment = info_modal.querySelector(".icon_comment + .value");
                    view.textContent = data.statistics.view;
                    like.textContent = data.statistics.like;
                    dislike.textContent = data.statistics.dislike;
                    comment.textContent = data.statistics.comment;

                    const open_in_new = info_modal.querySelector(".icon_open_in_new");
                    open_in_new.dataset.id = data.id;

                    const desc = info_modal.querySelector(".cd_desc");
                    let descText = data.description

                    if (descText) {
                        const findTag = descText.match(/\#[^\s\n\t]+/g)
                        if (findTag) {
                            findTag.forEach((tag) => {
                                const tagText = tag.replace("#", "").toLowerCase()
                                descText = descText.replace(tag, `<a href="https//youtube.com/hashtag/${tagText}" target="_blank" rel="noopener noreferrer" class="text-blue-500">${tag}</a>`)
                            })
                        }
                        desc.innerHTML = descText.replace(/\n/g, "<br>")
                    }

                    info_modal.classList.remove("close");
                } else if (_this.className.indexOf("player_cd") >= 0) {

                    if (this.cd_pre === _this) return;
                    let list_cd_pre
                    if (this.cd_pre) {
                        this.cd_pre.classList.remove("now_play");
                        list_cd_pre = this.list.querySelector("[data-id='" + this.cd_pre.dataset.id + "']");
                        if (list_cd_pre) list_cd_pre.classList.remove("now_play");
                    }
                    this.pause();
                    this.progress_bar(this.prog_bar_pre, 0);
                    this.progress_bar(this.prog_bar_main, 0);
                    _this.classList.add("now_play");
                    list_cd_pre = this.list.querySelector("[data-id='" + _this.dataset.id + "']");
                    if (list_cd_pre) list_cd_pre.classList.add("now_play");

                    const vID = _this.dataset.id;
                    this.audio.src = sources[vID];

                    const drctn = (idx > this.now) ? -1 : 1;
                    this.now = idx;

                    const rect = _this.getBoundingClientRect();
                    const leftToCenter = rect.left + (rect.width + 96 * drctn) / 2;

                    // ! 不明多偏移了 2px，還找不到原因
                    scroll_left = scroll_left + ~(leftToCenter - center) + left + 2
                    this.cd_list.style.left = `${scroll_left}px`
                    this.cd_pre = _this

                    this.updateInfo(this.now_play);

                    this.list.querySelector("[data-id='${_this.dataset.id}']")
                }
            }
        });

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
            const time_ttl_pre = this.list.querySelector("[data-id='" + this.cd_pre.dataset.id + "'] .time_ttl");
            if (time_ttl_pre) time_ttl_pre.textContent = time_ttl.textContent
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
            if ( this.now >= this.min ) this.set_time((e.offsetX / width * 100) * this.audio.duration / 100);
        }
    }
    // 初始化 一些資訊
    init_info() {
        const title = this.info.querySelector("#title");
        const links = this.info.querySelector("#links");
        const count = this.info.querySelector(".count");

        title.textContent = data.username

        const icons = mult_import(require.context('./assets/web', false, /\.(png|jpe?g|ico|svg)$/));

        let html = ""
        for (const link of Object.keys(data.links)) {
            html += `<a href="${data.links[link]}" class="bg_img" title="${link}" style="background-image: url(${icons[link]});" target="_blank" rel="noopener noreferrer"></a>`
        }
        links.insertAdjacentHTML("beforeend", html);

        count.textContent = Object.keys(playlist).length;

    }
    // 初始化
    async init() {
        const loading = document.querySelector("#loading")
        const load_prog_bar = loading.querySelector(".progress_bar_main")
        loading.classList.remove("close");
        load_prog_bar.style.width = "0%";
        this.init_prog_bar();
        await sleep(50)
        load_prog_bar.style.width = "25%";
        this.init_audio();
        await sleep(50)
        load_prog_bar.style.width = "55%";
        this.init_list();
        await sleep(50)
        load_prog_bar.style.width = "75%";
        this.init_list_event();
        await sleep(50)
        load_prog_bar.style.width = "90%";
        this.init_metadata();
        await sleep(50)
        load_prog_bar.style.width = "100%";
        this.init_info();
        loading.classList.add("close");
        // this.next(); // chrome 55 以後禁止自動撥放
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
        if (this.audio.readyState < 4) return;
        if (this.state === "pause") return;
        this.state = "pause";
        play.style.display = "block";
        pause.style.display = "none";
        this.audio.pause();
    }
    // 下一首
    next() {
        if (this.now >= this.max) return;
        this.cds[this.now + 1].click();
    }
    // 上一首
    previous() {
        if (this.now <= this.min) return;
        this.cds[this.now - 1].click();
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

    init_metadata() {
        if (!('mediaSession' in navigator)) return;

        navigator.mediaSession.setActionHandler('play', () => {
            navigator.mediaSession.playbackState = "playing";
            this.play();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            navigator.mediaSession.playbackState = "paused";
            this.pause();
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            this.previous();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            this.next();
        });
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
    updateMetadata(event) {
        if (!('mediaSession' in navigator)) return;

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
        // this.init_metadata();

    }

    get now_play() { return (this.now >= this.min || this.now <= this.max) ? playlist[(this.cds[this.now].dataset.id)] : {} }
}


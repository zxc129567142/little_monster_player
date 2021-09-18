var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();
var gainNode = audioCtx.createGain()
// https://www.oxxostudio.tw/articles/201509/web-audio-api.html
// https://ithelp.ithome.com.tw/articles/10204983
var source = audioCtx.createMediaElementSource(player.audio)
source.connect(analyser);
gainNode.connect(audioCtx.destination)

analyser.minDecibels = -90;
analyser.maxDecibels = -10;

analyser.fftSize = 1024;
// var bufferLength = analyser.frequencyBinCount;
// var dataArray = new Uint8Array(bufferLength);
// analyser.getByteTimeDomainData(dataArray);


var canvas = document.getElementById("player_view")
var ctx = canvas.getContext("2d");
var WIDTH = canvas.offsetWidth;
var HEIGHT = canvas.offsetHeight;

ctx.clearRect(0, 0, WIDTH, HEIGHT);

function draw() {

    drawVisual = requestAnimationFrame(draw);

    // analyser.getByteTimeDomainData(dataArray);
    var bufferLength = analyser.fftSize
    var fftArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(fftArray)

    ctx.fillStyle = "rgba(0, 0, 200, 0.1)"; // 透明度越低，越有濕濕的感覺
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0, 0, 0, 1.0)";

    ctx.beginPath();

    var sliceWidth = WIDTH * 1.0 / bufferLength * 2 ;
    var x = 0;

    for (var i = 0; i < bufferLength / 2; i++) {

        var v = fftArray[i] / 128.0 ;
        var y = v * HEIGHT / 4;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
};

draw();

// memo
// https://developer.mozilla.org/ja/docs/Web/API/Web_Audio_API
// http://qiita.com/umisama/items/fd31da94a4ba2ba34add
// http://twilightdve.hatenablog.com/entry/2014/08/12/180221

var context;
var bpm = null;
var beats = null;

var sampling_rate = null;
var drum_length = 0.02;
var drum_source = null;
var last_drum = null;
var interval_time = 1;
var drum_count = 0;
var interval_id = null;

var init = function() {
    try{
        context = new webkitAudioContext();
    } catch(e) {
        console.log(e);
    }
    sampling_rate = parseInt( context.sampleRate);

    // 10秒分のノイズドラムのソースを作る
    drum_source = context.createBuffer(2, sampling_rate * 10, sampling_rate);
    var noise_param = 20;
    for (var c = 0; c < 2;c++)
    {
        var channel = drum_source.getChannelData(c);
        for (var i = 0; i < channel.length; i++) {
            switch(i % noise_param){
                case 0:
                    channel[i] = Math.random() * 2 - 1;
                    break;
                default:
                    channel[i] = channel[i - i % noise_param];
            }
        }
    }

    interval_id = setInterval(update, interval_time / 2 * 1000);
};

var update = function() {
    bpm = document.querySelector('#bpm').value;
    beats = document.querySelector('#beats').value;

    var t = 60.0 / bpm;
    console.log('hoge',  context.currentTime, bpm, beats);

    if(last_drum){
        var dt = last_drum + t - context.currentTime;
    }else{
        var dt = 0;
    }

    for(; dt < interval_time; dt += t ){
        if(dt < 0){
            continue;
        }
        last_drum = context.currentTime + dt;

        var drum_source_node = context.createBufferSource();
        drum_source_node.buffer = drum_source;

        var gain_node = context.createGain();
        gain_node.gain.value =drum_count % beats ==0 ? 1.0 : 0.3;

        drum_source_node.connect(gain_node);
        gain_node.connect(context.destination);
        drum_source_node.start(last_drum, Math.random() * 9.0, drum_length);

        drum_count += 1;
    }
};

document.querySelector("#play").addEventListener("click", function(){init();}, false);
document.querySelector("#stop").addEventListener("click", function(){clearInterval(interval_id)}, false);

document.querySelector("#bpm").addEventListener("input", function(){
    document.querySelector("#bpm_label").innerText = document.querySelector("#bpm").value;
}, false);

document.querySelector("#beats").addEventListener("input", function(){
    document.querySelector("#beats_label").innerText = document.querySelector("#beats").value;
}, false);

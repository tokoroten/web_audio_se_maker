// memo
// https://developer.mozilla.org/ja/docs/Web/API/Web_Audio_API
// http://qiita.com/umisama/items/fd31da94a4ba2ba34add
// http://twilightdve.hatenablog.com/entry/2014/08/12/180221

var context = null;

var sampling_rate = null;
var last_drum = 0;
var interval_time = 1;
var drum_count = 0;
var interval_id = null;

var init = function() {
    try {
        if (context == null) {
            var AudioContext = window.AudioContext || window.webkitAudioContext;
			context = new AudioContext();
        }
    } catch(e) {
        console.log(e);
    }
    sampling_rate = parseInt( context.sampleRate);

    if(interval_id) {
        clearInterval(interval_id);
        interval_id = null;
    }

    //last_drum = context.currentTime;
    interval_id = setInterval(update, interval_time / 2 * 1000);
};

var update = function() {
    var t = 60.0 / rhythm_data.bpm;

    if(last_drum == 0){
        last_drum = context.currentTime;
    }

    for(; last_drum < context.currentTime + interval_time; last_drum += t ){
        var i = drum_count % rhythm_data.beats.length;

        var source_node = generate_source_node(rhythm_data.beats[i].source_node);
        var last_node = source_node;

        rhythm_data.beats[i].node_list.forEach(function(node_data){
            var node = generate_node(node_data);
            last_node.connect(node);
            last_node = node;
        });
        last_node.connect(context.destination);

        // todo factory patten
        switch(rhythm_data.beats[i].source_node.type){
            case "noise":
                source_node.start(
                    last_drum,
                    Math.random() * (10.0 - rhythm_data.beats[i].source_node.length),
                    rhythm_data.beats[i].source_node.length);

                break
        }
        drum_count += 1;
    }
};

var noise_source_cache = {};
var get_noise_source = function(source_obj){
    var continuity_count = source_obj.continuity_count ? source_obj.continuity_count : 10;
    if(continuity_count in noise_source_cache)
        return noise_source_cache[continuity_count];

    var drum_source = context.createBuffer(2, sampling_rate * 10, sampling_rate);
    for (var c = 0; c < 2;c++)
    {
        var channel = drum_source.getChannelData(c);
        for (var i = 0; i < channel.length; i++) {
            switch(i % continuity_count){
                case 0:
                    channel[i] = Math.random() * 2 - 1;
                    break;
                default:
                    channel[i] = channel[i - i % continuity_count];
                    break;
            }
        }
    }

    noise_source_cache[continuity_count] = drum_source;
    return noise_source_cache[continuity_count];
};

var generate_source_node = function(source_obj){
    // todo factory patten
    switch(source_obj.type){
        case 'noise':
            var buffer = get_noise_source(source_obj);
            var source = context.createBufferSource();
            source.buffer = buffer;
            return source;
            break;
    }
};

var generate_node = function(node_param){
    // todo factory pattern
    var node = null;

    switch(node_param.type){
        case 'gain':
            node = context.createGain();
            node.gain.value = node_param.gain;
            break;
    }

    return node;
};

var rhythm_data = null;
var reload = function()
{

    try{
        var json_data = JSON.parse(document.querySelector("#json_drum_pattern").value);
        console.log(json_data);
    }
    catch(e){
        console.log(e);
        return;
    }

    init();

    json_data.beats.forEach(function(bt){
        var source_node = generate_source_node(bt.source_node);
    });

    rhythm_data = json_data;
};

document.querySelector("#stop").addEventListener("click", function(){clearInterval(interval_id);}, false);
document.querySelector("#start").addEventListener("click", function(){reload();}, false);

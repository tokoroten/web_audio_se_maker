// memo
// https://developer.mozilla.org/ja/docs/Web/API/Web_Audio_API
// http://qiita.com/umisama/items/fd31da94a4ba2ba34add
// http://twilightdve.hatenablog.com/entry/2014/08/12/180221

var context;

var init = function() {
    try{
        context = new webkitAudioContext();
    } catch(e) {
        console.log(e);
    }
    context.samplingRate = 48000;
};

var audio = function(){
    var buffer = context.createBuffer( 1, 48000, 48000 );
    var channel = buffer.getChannelData(0);
    for( var i=0; i < channel.length; i++ )
    {
        channel[i] = Math.sin( i / 100 * Math.PI);
    }
    var src = context.createBufferSource();
    src.buffer = buffer;
    src.connect(context.destination);

    // そして再生。
    src.start(context.currentTime);
}

document.querySelector("#play").addEventListener("click", function(){audio();}, false);
init();
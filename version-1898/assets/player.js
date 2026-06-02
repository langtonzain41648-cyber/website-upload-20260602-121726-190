(function(){
function ready(fn){if(document.readyState!=='loading')fn();else document.addEventListener('DOMContentLoaded',fn)}
ready(function(){
  document.querySelectorAll('[data-player]').forEach(function(box){
    var video=box.querySelector('video');
    var layer=box.querySelector('.play-layer');
    var source=box.getAttribute('data-video');
    var loaded=false;
    function start(){
      if(!video||!source)return;
      if(!loaded){
        if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=source}else if(window.Hls&&window.Hls.isSupported()){var hls=new window.Hls();hls.loadSource(source);hls.attachMedia(video)}else{video.src=source}
        loaded=true;
      }
      if(layer)layer.classList.add('hidden');
      var p=video.play();
      if(p&&p.catch)p.catch(function(){})
    }
    if(layer)layer.addEventListener('click',start);
    box.addEventListener('click',function(e){if(e.target===box)start()});
    video.addEventListener('click',function(){if(video.paused&&!loaded)start()});
  })
})
})();
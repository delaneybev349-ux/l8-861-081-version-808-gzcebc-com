import { H as Hls } from './hls-DrU42sTK.js';

export function initPlayer(videoId, coverId, streamUrl) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var prepared = false;

  if (!video || !streamUrl) {
    return;
  }

  function prepare() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    prepare();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    video.controls = true;
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
}

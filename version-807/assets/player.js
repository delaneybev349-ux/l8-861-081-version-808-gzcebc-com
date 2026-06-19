(function () {
    window.initMoviePlayer = function (options) {
        var video = document.querySelector(options.selector);
        var mask = document.querySelector(options.mask);
        var button = document.querySelector(options.button);
        var sourceUrl = options.url;
        var hlsInstance = null;
        var started = false;
        if (!video || !sourceUrl) {
            return;
        }
        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        function start() {
            if (started) {
                playVideo();
                return;
            }
            started = true;
            video.controls = true;
            if (mask) {
                mask.classList.add("is-hidden");
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                return;
            }
            video.src = sourceUrl;
            video.load();
            playVideo();
        }
        if (button) {
            button.addEventListener("click", start);
        }
        if (mask) {
            mask.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
}());

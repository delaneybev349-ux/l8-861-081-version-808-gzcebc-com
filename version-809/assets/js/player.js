document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-player-box]").forEach(function (box) {
        var video = box.querySelector("video");
        var button = box.querySelector("[data-play-button]");

        if (!video) {
            return;
        }

        var source = video.querySelector("source");
        var stream = video.getAttribute("data-stream") || (source ? source.getAttribute("src") : "");
        var prepared = false;
        var hls = null;
        var wantsPlay = false;

        function reveal() {
            if (button) {
                button.classList.add("is-hidden");
            }
        }

        function cover() {
            if (button && video.paused && !video.ended) {
                button.classList.remove("is-hidden");
            }
        }

        function playVideo() {
            wantsPlay = true;
            prepareVideo();
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        function prepareVideo() {
            if (prepared || !stream) {
                return;
            }
            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
                video.src = stream;
                video.load();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (wantsPlay) {
                        var result = video.play();
                        if (result && typeof result.catch === "function") {
                            result.catch(function () {});
                        }
                    }
                });
                return;
            }

            video.src = stream;
            video.load();
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                playVideo();
            });
        }

        box.addEventListener("click", function (event) {
            if (event.target.closest("button") || event.target.closest("video")) {
                return;
            }
            playVideo();
        });

        video.addEventListener("play", reveal);
        video.addEventListener("pause", cover);
        video.addEventListener("ended", function () {
            if (button) {
                button.classList.remove("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
});

export function createHlsPlayer(options) {
    const video = document.getElementById(options.videoId);
    const button = document.getElementById(options.buttonId);
    const streamUrl = options.streamUrl;
    let attached = false;
    let hlsInstance = null;

    if (!video || !button || !streamUrl) {
        return;
    }

    async function attachStream() {
        if (attached) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            attached = true;
            return;
        }

        const module = await import("./hls-dru42stk.js");
        const Hls = module.H;

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            attached = true;
            return;
        }

        video.src = streamUrl;
        attached = true;
    }

    async function playVideo() {
        button.classList.add("is-hidden");
        await attachStream();
        video.controls = true;

        try {
            await video.play();
        } catch (error) {
            button.classList.remove("is-hidden");
        }
    }

    button.addEventListener("click", function () {
        playVideo();
    });

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener("pause", function () {
        if (!video.ended) {
            button.classList.remove("is-hidden");
        }
    });

    video.addEventListener("playing", function () {
        button.classList.add("is-hidden");
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

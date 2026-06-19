import { H as Hls } from './hls.js';

const player = document.querySelector('[data-player]');

if (player) {
    const video = player.querySelector('video');
    const overlay = player.querySelector('.player-overlay');
    const source = player.dataset.src;
    let loaded = false;
    let hls = null;

    const loadVideo = () => {
        if (loaded) {
            return;
        }
        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls.isSupported()) {
            hls = new Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    };

    const startPlayback = () => {
        loadVideo();
        video.controls = true;
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
        }
    };

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', () => {
        if (!loaded || video.paused) {
            startPlayback();
        }
    });

    window.addEventListener('pagehide', () => {
        if (hls) {
            hls.destroy();
        }
    });
}

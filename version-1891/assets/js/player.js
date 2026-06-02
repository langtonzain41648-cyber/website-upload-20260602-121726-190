function initializeMoviePlayer(options) {
    const video = document.getElementById(options.videoId);
    const overlay = document.getElementById(options.overlayId);
    const button = document.getElementById(options.buttonId);
    const source = options.source;
    let hlsInstance = null;
    let hasLoaded = false;

    if (!video || !overlay || !button || !source) {
        return;
    }

    const attachSource = () => {
        if (hasLoaded) {
            return;
        }
        hasLoaded = true;
        video.setAttribute('playsinline', '');
        video.controls = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    };

    const startPlayback = () => {
        attachSource();
        overlay.classList.add('is-hidden');
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                overlay.classList.remove('is-hidden');
            });
        }
    };

    button.addEventListener('click', startPlayback);
    overlay.addEventListener('click', startPlayback);
    video.addEventListener('click', () => {
        if (video.paused) {
            startPlayback();
        }
    });
    video.addEventListener('play', () => {
        overlay.classList.add('is-hidden');
    });
    video.addEventListener('ended', () => {
        overlay.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', () => {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("videoPlayer");
    const audio = document.getElementById("audioPlayer");

    // Récupération des URLs de vidéo et d’audio
    const urlParams = new URLSearchParams(window.location.search);
    const videoUrl = urlParams.get('video');
    const audioUrl = urlParams.get('audio');

    // Chargement de la vidéo M3U8
    if (Hls.isSupported()) {
        const hlsVideo = new Hls();
        hlsVideo.loadSource(videoUrl);
        hlsVideo.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
    }

    // Chargement de l'audio M3U8 localement
    if (Hls.isSupported()) {
        const hlsAudio = new Hls();
        hlsAudio.loadSource(audioUrl);
        hlsAudio.attachMedia(audio);
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        audio.src = audioUrl;
    }

    // Synchronisation audio avec la vidéo
    video.addEventListener("play", () => audio.play());
    video.addEventListener("pause", () => audio.pause());
    video.addEventListener("seeked", () => (audio.currentTime = video.currentTime));
    video.addEventListener("timeupdate", () => {
        if (Math.abs(video.currentTime - audio.currentTime) > 0.3) {
            audio.currentTime = video.currentTime;
        }
    });

    // Initialisation du Cast
    window['__onGCastApiAvailable'] = function (isAvailable) {
        if (isAvailable) {
            const context = cast.framework.CastContext.getInstance();
            context.setOptions({
                receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
            });

            context.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, event => {
                if (event.sessionState === cast.framework.SessionState.SESSION_STARTED) {
                    const castSession = context.getCurrentSession();
                    const mediaInfo = new chrome.cast.media.MediaInfo(videoUrl, 'application/x-mpegURL');
                    const request = new chrome.cast.media.LoadRequest(mediaInfo);

                    // Charge uniquement la vidéo sur le Chromecast
                    castSession.loadMedia(request).then(
                        () => console.log("Casting de la vidéo en cours..."),
                        error => console.error("Erreur de cast :", error)
                    );
                }
            });
        }
    };
});

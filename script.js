document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("videoPlayer");
    const audio = document.getElementById("audioPlayer");

    // URL de la vidéo et de l’audio en fonction des paramètres de l'URL
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

    // Chargement de l'audio M3U8
    if (Hls.isSupported()) {
        const hlsAudio = new Hls();
        hlsAudio.loadSource(audioUrl);
        hlsAudio.attachMedia(audio);
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        audio.src = audioUrl;
    }

    // Synchroniser audio avec la vidéo
    video.addEventListener("play", () => audio.play());
    video.addEventListener("pause", () => audio.pause());
    video.addEventListener("seeked", () => (audio.currentTime = video.currentTime));
    video.addEventListener("timeupdate", () => {
        if (Math.abs(video.currentTime - audio.currentTime) > 0.3) {
            audio.currentTime = video.currentTime;
        }
    });

    // Gestion des événements de cast
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
                    const media = new chrome.cast.media.MediaInfo(videoUrl);
                    const request = new chrome.cast.media.LoadRequest(media);

                    // Charge la vidéo sur le récepteur
                    castSession.loadMedia(request).then(
                        () => {
                            console.log("Casting en cours...");

                            // Synchroniser lecture/pause avec la vidéo
                            castSession.addMessageListener("urn:x-cast:com.google.cast.media", (namespace, message) => {
                                const mediaEvent = JSON.parse(message);
                                if (mediaEvent.type === "PAUSE") {
                                    video.pause();  // Pause seulement sur la vidéo
                                } else if (mediaEvent.type === "PLAY") {
                                    video.play();
                                }
                            });
                        },
                        error => console.error("Erreur de cast :", error)
                    );
                }
            });
        }
    };
});

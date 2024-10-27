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

    // Chargement de l'audio M3U8
    if (Hls.isSupported()) {
        const hlsAudio = new Hls();
        hlsAudio.loadSource(audioUrl);
        hlsAudio.attachMedia(audio);
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        audio.src = audioUrl;
    }

    // Synchronisation audio avec la vidéo
    video.addEventListener("play", () =>

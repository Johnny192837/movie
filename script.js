// Récupérer les URLs des fichiers M3U8 à partir de l'URL du projet
const urlParams = new URLSearchParams(window.location.search);
const videoUrl = urlParams.get('video') || 'https://example.com/path/to/video.m3u8'; // Remplace par l'URL par défaut
const audioUrl = urlParams.get('audio') || 'https://example.com/path/to/audio.m3u8'; // Remplace par l'URL par défaut

const video = document.getElementById('videoPlayer');
const audio = document.getElementById('audioPlayer');

// Charger la vidéo M3U8
if (Hls.isSupported()) {
    const hlsVideo = new Hls();
    hlsVideo.loadSource(videoUrl);
    hlsVideo.attachMedia(video);
    hlsVideo.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play();
    });
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoUrl;
    video.addEventListener('loadedmetadata', function () {
        video.play();
    });
} else {
    alert('Votre navigateur ne supporte pas la lecture de fichiers vidéo M3U8.');
}

// Charger l'audio M3U8
if (Hls.isSupported()) {
    const hlsAudio = new Hls();
    hlsAudio.loadSource(audioUrl);
    hlsAudio.attachMedia(audio);
    hlsAudio.on(Hls.Events.MANIFEST_PARSED, function () {
        audio.play();
    });
} else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
    audio.src = audioUrl;
    audio.addEventListener('loadedmetadata', function () {
        audio.play();
    });
}

// Synchroniser la vidéo et l'audio
video.addEventListener('play', function () {
    if (audio.paused) {
        audio.play();
    }
});

video.addEventListener('pause', function () {
    audio.pause();
});

video.addEventListener('seeked', function () {
    audio.currentTime = video.currentTime;
});

video.addEventListener('timeupdate', function () {
    if (Math.abs(video.currentTime - audio.currentTime) > 0.3) {
        audio.currentTime = video.currentTime;
    }
});

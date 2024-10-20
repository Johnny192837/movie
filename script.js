const urlParams = new URLSearchParams(window.location.search);
const videoUrl = urlParams.get('video') || 'https://example.com/path/to/video.m3u8';
const audioUrl = urlParams.get('audio') || 'https://example.com/path/to/audio.m3u8';

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
  hlsVideo.on(Hls.Events.ERROR, function (event, data) {
    console.error('Erreur de chargement vidéo :', data);
  });
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
  video.src = videoUrl;
  video.addEventListener('loadedmetadata', function () {
    video.play();
  });
  video.addEventListener('error', function () {
    console.error('Erreur de lecture vidéo.');
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
  hlsAudio.on(Hls.Events.ERROR, function (event, data) {
    console.error('Erreur de chargement audio :', data);
  });
} else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
  audio.src = audioUrl;
  audio.addEventListener('loadedmetadata', function () {
    audio.play();
  });
  audio.addEventListener('error', function () {
    console.error('Erreur de lecture audio.');
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

// Gérer le buffering
let isBuffering = false;

video.addEventListener('waiting', function () {
  isBuffering = true;
  if (!audio.paused) {
    audio.pause();
  }
});

video.addEventListener('canplay', function () {
  if (isBuffering) {
    isBuffering = false;
    audio.currentTime = video.currentTime;
    audio.play();
  }
});

// Contrôle du volume
const volumeSlider = document.getElementById('volumeSlider');
volumeSlider.addEventListener('input', function () {
  audio.volume = volumeSlider.value;
});
audio.volume = volumeSlider.value;

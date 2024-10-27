document.addEventListener("DOMContentLoaded", () => {
    // Initialiser Google Cast
    window['__onGCastApiAvailable'] = function(isAvailable) {
        if (isAvailable) {
            initializeCastApi();
        }
    };

    function initializeCastApi() {
        cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
        });

        // Relier le bouton de cast
        const castButton = document.getElementById('castButton');
        castButton.addEventListener('click', () => {
            const castContext = cast.framework.CastContext.getInstance();
            const session = castContext.getCurrentSession();

            if (session) {
                // Charger le contenu sur le cast si une session est active
                loadMedia();
            } else {
                // Démarrer une nouvelle session si aucun appareil n'est connecté
                castContext.requestSession().then(() => {
                    loadMedia();
                }).catch((error) => {
                    console.error("Erreur lors de la demande de session cast:", error);
                });
            }
        });
    }

    function loadMedia() {
        const mediaInfo = new chrome.cast.media.MediaInfo('URL_DE_LA_VIDEO', 'video/mp4');
        const request = new chrome.cast.media.LoadRequest(mediaInfo);

        cast.framework.CastContext.getInstance().getCurrentSession().loadMedia(request)
            .then(() => {
                console.log("Chargement réussi.");
            })
            .catch((error) => {
                console.error("Erreur de chargement:", error);
            });
    }
});

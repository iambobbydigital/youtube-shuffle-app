import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}

export function PlaylistPlayer() {
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if API is already loaded
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                initializePlayer();
            };
        } else {
            initializePlayer();
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        }
    }, []);

    const initializePlayer = () => {
        if (!containerRef.current) return;

        playerRef.current = new window.YT.Player(containerRef.current, {
            height: '100%',
            width: '100%',
            playerVars: {
                listType: 'playlist',
                list: 'PLsN5CCUMECUK_PMx1oAwGoekMnuVwyQA_',
                autoplay: 1,
                mute: 0,
                playsinline: 1,
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
            }
        });
    };

    const onPlayerReady = (event: any) => {
        const player = event.target;
        player.setShuffle(true);
        player.playVideoAt(0);

        // Explicitly set allow attribute to enable PiP
        const iframe = player.getIframe();
        if (iframe) {
            let allow = iframe.getAttribute('allow') || '';
            if (!allow.includes('picture-in-picture')) {
                allow += '; picture-in-picture';
                iframe.setAttribute('allow', allow);
            }
        }

        setupMediaSession(player);
    };

    const onPlayerStateChange = (event: any) => {
        // Update metadata when video changes or state changes
        if (event.data === window.YT.PlayerState.PLAYING) {
            setupMediaSession(event.target);
        }
    };

    const setupMediaSession = (player: any) => {
        if ('mediaSession' in navigator) {
            const videoData = player.getVideoData();

            navigator.mediaSession.metadata = new MediaMetadata({
                title: videoData.title || 'Focus Music',
                artist: videoData.author || 'YouTube Shuffle',
                artwork: [
                    { src: '/brain-icon-processed.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => player.playVideo());
            navigator.mediaSession.setActionHandler('pause', () => player.pauseVideo());
            navigator.mediaSession.setActionHandler('previoustrack', () => player.previousVideo());
            navigator.mediaSession.setActionHandler('nexttrack', () => player.nextVideo());
        }
    };

    return (
        <div className="w-full h-full flex justify-center items-center">
            <div ref={containerRef} className="w-full h-full aspect-video max-w-4xl max-h-[80vh] rounded-xl overflow-hidden shadow-2xl" />
        </div>
    );
}

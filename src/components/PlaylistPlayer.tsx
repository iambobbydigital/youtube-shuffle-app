import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}

export function PlaylistPlayer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const silentAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize silent audio for background keep-alive
        const silentMp3 = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV////////////////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQDkAAAAAAAAAGw9wrNaQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxHYAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
        silentAudioRef.current = new Audio(silentMp3);
        silentAudioRef.current.loop = true;
        silentAudioRef.current.volume = 0; // Ensure it's silent (though the file is silent too)

        // Define the initialization function
        const onYouTubeIframeAPIReady = () => {
            initializePlayer();
        };

        // Load the YouTube IFrame Player API code asynchronously.
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            // Assign global callback
            window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
        } else {
            onYouTubeIframeAPIReady();
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
            if (silentAudioRef.current) {
                silentAudioRef.current.pause();
                silentAudioRef.current = null;
            }
        };
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
        // Update metadata and handlers on every state change to ensure persistence
        // This fixes the issue where iOS reverts to default controls after a track change
        setupMediaSession(event.target);

        // Manage silent audio for background keep-alive
        if (event.data === window.YT.PlayerState.PLAYING) {
            silentAudioRef.current?.play().catch(e => console.log('Silent audio play failed:', e));
        } else {
            silentAudioRef.current?.pause();
        }
    };

    const setupMediaSession = (player: any) => {
        if ('mediaSession' in navigator) {
            const videoData = player.getVideoData();
            const playerState = player.getPlayerState();

            navigator.mediaSession.metadata = new MediaMetadata({
                title: videoData.title || 'Focus Music',
                artist: videoData.author || 'YouTube Shuffle',
                artwork: [
                    { src: '/brain-icon-processed.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            // Update playback state to help iOS know we are active
            if (playerState === window.YT.PlayerState.PLAYING) {
                navigator.mediaSession.playbackState = 'playing';
            } else {
                navigator.mediaSession.playbackState = 'paused';
            }

            navigator.mediaSession.setActionHandler('play', () => player.playVideo());
            navigator.mediaSession.setActionHandler('pause', () => player.pauseVideo());
            navigator.mediaSession.setActionHandler('previoustrack', () => player.previousVideo());
            navigator.mediaSession.setActionHandler('nexttrack', () => player.nextVideo());

            // Explicitly disable seek handlers to force Next/Prev buttons on iOS
            // Re-applying this on every state change is crucial for persistence
            navigator.mediaSession.setActionHandler('seekbackward', null);
            navigator.mediaSession.setActionHandler('seekforward', null);
        }
    };

    return (
        <div className="w-full h-full flex justify-center items-center">
            <div ref={containerRef} className="w-full h-full aspect-video max-w-4xl max-h-[80vh] rounded-xl overflow-hidden shadow-2xl" />
        </div>
    );
}

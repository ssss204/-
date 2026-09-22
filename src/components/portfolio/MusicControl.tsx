import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

const AUDIO_SOURCE = `${import.meta.env.BASE_URL}audio/ifeel.mp3`;
const BACKGROUND_VOLUME = 0.25;

export default function MusicControl() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = BACKGROUND_VOLUME;

    const gestures = ['pointerdown', 'keydown', 'touchstart'] as const;
    const resume = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-music-control]')) return;
      void audio.play().catch(() => undefined);
    };
    const detachGestures = () => {
      gestures.forEach((event) => document.removeEventListener(event, resume));
    };

    // Browsers block audible autoplay until the visitor interacts with the page,
    // so fall back to starting the track on their first gesture.
    void audio.play().catch(() => {
      gestures.forEach((event) => document.addEventListener(event, resume, { passive: true }));
    });

    audio.addEventListener('play', detachGestures);
    return () => {
      detachGestures();
      audio.removeEventListener('play', detachGestures);
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={AUDIO_SOURCE}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        type="button"
        onClick={togglePlayback}
        className="galaxy-btn"
        data-music-control="true"
        aria-label={isPlaying ? '暂停背景音乐' : '播放背景音乐'}
        aria-pressed={isPlaying}
      >
        <span className="galaxy-btn__content">
          <span className="galaxy-btn__text">{isPlaying ? '暂停音乐' : '播放音乐'}</span>
          {isPlaying ? (
            <Pause className="galaxy-btn__icon" aria-hidden="true" />
          ) : (
            <Play className="galaxy-btn__icon" aria-hidden="true" />
          )}
        </span>
        <span className="galaxy-btn__glow" aria-hidden="true" />
        <span className="galaxy-btn__stars" aria-hidden="true" />
      </button>
    </>
  );
}

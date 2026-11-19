import { useEffect, useRef, useState } from "react";

const TRACK = "/audio/conto-tchaikovsky.mp3";
const TARGET_VOLUME = 0.32;

export function useBackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const fadeRef = useRef(null);

  const ensureAudio = () => {
    if (!audioRef.current) {
      const audio = new Audio(TRACK);
      audio.loop = true;
      audio.volume = 0;
      audio.preload = "auto";
      audioRef.current = audio;
    }
    return audioRef.current;
  };

  const fadeTo = (target, done) => {
    const audio = audioRef.current;
    if (!audio) return;
    clearInterval(fadeRef.current);
    const step = 0.04;
    fadeRef.current = setInterval(() => {
      const diff = target - audio.volume;
      if (Math.abs(diff) <= step) {
        audio.volume = Math.max(0, Math.min(1, target));
        clearInterval(fadeRef.current);
        done && done();
      } else {
        audio.volume = Math.max(0, Math.min(1, audio.volume + Math.sign(diff) * step));
      }
    }, 60);
  };

  const start = () => {
    const audio = ensureAudio();
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        fadeTo(TARGET_VOLUME);
      })
      .catch(() => {
        /* autoplay bloqueado até interação */
      });
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    fadeTo(0, () => {
      audio.pause();
      setIsPlaying(false);
    });
  };

  const toggle = () => {
    if (isPlaying) stop();
    else start();
  };

  useEffect(() => {
    return () => {
      clearInterval(fadeRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return { isPlaying, toggle, start };
}

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

// Discuss: little quirks implementation
const DRUMKIT_PRESET = new Map([
  ["clap", { key: "'", path: "audio/drum/clap.wav" }],
  ["rimshot", { key: ",", path: "audio/drum/rimshot.wav" }],
  ["snap", { key: ".", path: "audio/drum/snap.wav" }],
  ["crash", { key: "p", path: "audio/drum/crash.wav" }],
  ["kick", { key: "a", path: "audio/drum/kickG.wav" }],
  ["snare", { key: "o", path: "audio/drum/snareG.wav" }],
  ["hatClosed", { key: "e", path: "audio/drum/hatClosed.wav" }],
  ["hatOpen", { key: "u", path: "audio/drum/hatOpen.wav" }]
]);
export default function Drums() {
  const [loading, setLoading] = useState(false);
  const audioContext = useRef<AudioContext>();
  const audioBuffer = useRef<Record<string, AudioBuffer>>({});

  const loadSound = useCallback(async (soundName: string, { path: soundPath }: Record<string, string>) => {
    // Re-use the same context if it exists
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }

    // Re-use the audio buffer as a source
    // Fetch MP3 from URL
    const resp = await fetch(soundPath);

    // Turn into an array buffer of raw binary data
    const buf = await resp.arrayBuffer();

    // Decode the entire binary MP3 into an AudioBuffer
    audioBuffer.current[soundName] = await audioContext.current.decodeAudioData(buf);
  }, []);

  const loadSounds = useCallback(async () => {
    for (const [soundName, soundProperty] of DRUMKIT_PRESET) {
      await loadSound(soundName, soundProperty);
    }
  }, [loadSound]);

  const playSound = (soundName: string) => {
    if (audioContext?.current) { // Now create a new "Buffer Source" node for playing AudioBuffers
      const source = audioContext.current.createBufferSource();

      // Connect to destination
      source.connect(audioContext.current.destination);

      // Assign the loaded buffer
      source.buffer = audioBuffer.current[soundName];

      // Start (zero = play immediately)
      source.start(0);
    }
  };

  const handleKeyEvents = ({ key }: KeyboardEvent) => {
    DRUMKIT_PRESET.forEach((value, soundName) => {
      if (key == value.key) {
        playSound(soundName);
      }
    });
  };

  const handlePlayMouseDown = (key: string) => () => playSound(key);

  const renderKeys = () => {
    let keys: ReactNode[] = [];
    for (const [key] of DRUMKIT_PRESET) {
      keys.push(
        <button key={key} className="bg-white shadow w-24 h-24 lg:w-64 lg:h-64 rounded"
                onMouseDown={handlePlayMouseDown(key)}>{key}</button>
      );
    }
    return keys;
  };

  useEffect(() => {
    setLoading(true);
    loadSounds().then(() => {
      setLoading(false);
    }).catch(console.error);
  }, [loadSounds]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyEvents);

    return () => {
      document.removeEventListener("keydown", handleKeyEvents);
    };
  });


  return (
    <main>
      <h1>Drum machine</h1>
      <div className="container mx-auto px-8 grid grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4">
        {loading && <p>Loading...</p>}
        {!loading && renderKeys()}
      </div>
    </main>
  );
}
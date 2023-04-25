import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Pad from "./components/Pad";

type BufferType = {
  buffer: AudioBuffer;
  gainValue: number;
}

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
  const audioBuffer = useRef<Record<string, BufferType>>({});

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
    const buffer = await audioContext.current.decodeAudioData(buf);
    const gainValue = 1;

    audioBuffer.current[soundName] = { buffer, gainValue };
  }, []);

  const loadSounds = useCallback(async () => {
    for (const [soundName, soundProperty] of DRUMKIT_PRESET) {
      await loadSound(soundName, soundProperty);
    }
  }, [loadSound]);

  const playSound = (soundName: string) => {
    if (audioContext?.current) {
      // Now create a new "Buffer Source" node for playing AudioBuffers
      const source = audioContext.current.createBufferSource();

      // Initialising gain
      const gainNode = audioContext.current.createGain();
      source.connect(gainNode);

      // Changing gain value according to sound pad's control
      gainNode.gain.value = audioBuffer.current[soundName].gainValue;

      // Here we need to connect gain to destination, but not the source,
      // so the flow would be [Buffer] -> [GainNode] -> [Destination]
      gainNode.connect(audioContext.current.destination);

      // Assign the loaded buffer
      source.buffer = audioBuffer.current[soundName].buffer;

      // Start (zero = play immediately)
      source.start(0);
    }
  };

  const handleKeyboardEvents = ({ key }: KeyboardEvent) => {
    DRUMKIT_PRESET.forEach((value, soundName) => {
      if (key == value.key) {
        playSound(soundName);
      }
    });
  };

  const handlePlayMouseDown = (soundName: string) => () => playSound(soundName);

  const handleGainChange = (soundName: string) => (value: number) => {
    if (audioBuffer.current[soundName]) {
      audioBuffer.current[soundName].gainValue = value;
    }
  };

  const renderPads = () => {
    let pads: ReactNode[] = [];
    for (const [soundName] of DRUMKIT_PRESET) {
      pads.push(
        <Pad
          key={soundName}
          onMouseDown={handlePlayMouseDown(soundName)}
          onGainChange={handleGainChange(soundName)}
          soundName={soundName}
          defaultGainValue={audioBuffer.current[soundName]?.gainValue}
        />
      );
    }
    return pads;
  };

  useEffect(() => {
    setLoading(true);
    loadSounds().then(() => {
      setLoading(false);
    }).catch(console.error);
  }, [loadSounds]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyboardEvents);

    return () => {
      document.removeEventListener("keydown", handleKeyboardEvents);
    };
  });


  return (
    <main
      className="text-gray-900 bg-white dark:bg-gray-900 dark:text-white flex justify-center w-full h-full lg:justify-between xl:justify-center xl:gap-16 -items-stretch lg:px-10 xl:px-0 ">
      <h1
        className="mb-3 text-transparent max-w-[40ch] leading-relaxed text-3xl sm:text-4xl bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text">Drum
        machine</h1>
      <div className="container mx-auto px-8 grid grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4">
        {loading && <p>Loading...</p>}
        {!loading && renderPads()}
      </div>
    </main>
  );
}
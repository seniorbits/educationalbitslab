import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Pad from "./components/Pad";

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
  const [audioContext, setAudioContext] = useState<AudioContext>();

  const renderPads = () => {
    let pads: ReactNode[] = [];
    for (const [audioTitle, audioParams] of DRUMKIT_PRESET) {
      pads.push(
        <Pad
          audioContext={audioContext}
          audioParams={audioParams}
          audioTitle={audioTitle}
          key={audioTitle}
        />
      );
    }
    return pads;
  };

  useEffect(() => {
    if (!audioContext) {
      setAudioContext(new AudioContext());
    }

    // cleanup audio context on unmount
    return () => {
      audioContext?.close();
    }
  }, [audioContext])

  return (
    <main
      className="text-gray-900 bg-white dark:bg-gray-900 dark:text-white flex justify-center w-full h-full lg:justify-between xl:justify-center xl:gap-16 -items-stretch lg:px-10 xl:px-0 ">
      <h1
        className="mb-3 text-transparent max-w-[40ch] leading-relaxed text-3xl sm:text-4xl bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text">Drum
        machine</h1>
      <div className="container mx-auto px-8 grid grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4">
        {renderPads()}
      </div>
    </main>
  );
}
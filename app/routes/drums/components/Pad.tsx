import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEventHandler, MouseEventHandler, FC } from "react";

type PadProps = {
  audioParams: { key: string, path: string },
  audioContext?: AudioContext,
  audioTitle: string,
}

const DEFAULT_GAIN_VALUE = 1;

const Pad: FC<PadProps> = ({
  audioParams,
  audioContext,
  audioTitle,
}) => {
  const audioBuffer = useRef<AudioBuffer>();
  const [loading, setLoading] = useState(false);
  const [gainValue, setGainValue] = useState<number>(DEFAULT_GAIN_VALUE);

  const prepareSound = useCallback(async () => {
    if (audioContext) { // Re-use the audio buffer as a source
      const response = await fetch(audioParams.path);

      // Turn into an array buffer of raw binary data
      const arrayBuffer = await response.arrayBuffer();

      // Decode the entire binary MP3 into an AudioBuffer
      return await audioContext.decodeAudioData(arrayBuffer);
    }
  }, [audioContext, audioParams.path]);


  const playSound = useCallback(() => {
    if (audioContext && audioBuffer.current) {
      // Now create a new "Buffer Source" node for playing AudioBuffers
      const source = audioContext.createBufferSource();

      // Initialising gain
      const gainNode = audioContext.createGain();
      source.connect(gainNode);

      // Changing gain value according to sound pad's control
      gainNode.gain.value = gainValue;

      // Here we need to connect gain to destination, but not the source,
      // so the flow would be [Buffer] -> [GainNode] -> [Destination]
      gainNode.connect(audioContext.destination);

      // Assign the loaded buffer
      source.buffer = audioBuffer.current;

      // Start (zero = play immediately)
      source.start(0);
    }
  }, [audioContext, gainValue]);

  const handleKeyboardEvents = ({ key }: KeyboardEvent) => {
    if (key == audioParams.key) {
      playSound();
    }
  };

  const handlePlayMouseDown: MouseEventHandler = () => playSound();

  const handleGainChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setGainValue(Number(e.currentTarget.value));
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyboardEvents);

    return () => {
      document.removeEventListener("keydown", handleKeyboardEvents);
    };
  });

  useEffect(() => {
    setLoading(true)
    prepareSound().then((decodedAudioBuffer?: AudioBuffer) => {
      audioBuffer.current = decodedAudioBuffer;
      setLoading(false);
    }).catch(console.error);
  }, [prepareSound]);


  return <div>
    <button
      disabled={loading}
      className="bg-white shadow w-24 h-24 lg:w-64 lg:h-64 rounded"
      onMouseDown={handlePlayMouseDown}
    >
      {audioTitle}{loading && ':Loading'}
    </button>
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={gainValue}
      onChange={handleGainChange}
    />
  </div>;
};

export default Pad;
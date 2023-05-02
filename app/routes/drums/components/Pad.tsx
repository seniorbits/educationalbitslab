import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEventHandler, MouseEventHandler, FC } from "react";
import useKeyBinding from "../useKeyBinding.hook";
import fetchFile from "~/routes/drums/fetchFile";

type PadProps = {
  audioParams: { key: string, path: string },
  audioContext?: AudioContext,
  audioTitle: string,
}

const DEFAULT_GAIN_VALUE = 1;

const Pad: FC<PadProps> = ({
 audioParams,
 audioContext,
 audioTitle
}) => {
  // We decide to store decoded audio buffer to ref to avoid unexpected re-renders,
  // Avoid using const in such case to prevent sharing data between component instances
  const audioBuffer = useRef<AudioBuffer>();

  // Using local react state to explicitly show loading progress, if we'd decide
  // to use global loader for this purpose, we might be using react context from
  // parent component
  const [loading, setLoading] = useState(false);

  // Using local react state to store current gain level
  const [gainValue, setGainValue] = useState<number>(DEFAULT_GAIN_VALUE);

  // Using local react state to store if error has occurred
  const [error, setError] = useState<string>();

  // Reusable fetch file function, to abstract fetch function underneath it and
  // provide error handling; can be extracted to single hook


  // Reusable decoding function, can be extracted to single hook
  const decodeAudioBuffer = useCallback(async (response: Response) => {
    try {
      // Turn into an array buffer of raw binary data
      const arrayBuffer = await response.arrayBuffer();

      // Decode the entire binary MP3 into an AudioBuffer
      return audioContext?.decodeAudioData(arrayBuffer);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      throw new Error(message);
    }
  }, [audioContext]);

  // Fetch, decode and assign decoded buffer to ref
  const prepareSound = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchFile(audioParams.path);
      audioBuffer.current = await decodeAudioBuffer(response);
      setLoading(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
    }
  }, [audioParams.path, decodeAudioBuffer]);

  // Initialise playback connecting audio buffer to context and gain node
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

  // Sound pad mouse down handler, using here explicitly, so it can be extended
  const handlePlayMouseDown = useCallback<MouseEventHandler>(() => playSound(), [playSound]);

  // Sound gain level change handler
  const handleGainChange = useCallback<ChangeEventHandler<HTMLInputElement>>((e) => {
    setGainValue(Number(e.currentTarget.value));
  }, []);

  // Bind the key press event to the sound playback
  useKeyBinding(audioParams.key, playSound);

  // Process sound when component gets mounted or prepareSound function gets changed
  useEffect(() => {
    void prepareSound();
  }, [prepareSound]);


  return <div className="pad-container">
    <button
      disabled={loading || Boolean(error)}
      className="bg-white shadow w-24 h-24 lg:w-64 lg:h-64 rounded"
      onMouseDown={handlePlayMouseDown}
    >
      {audioTitle}{loading ? ":Loading" : `: key "${audioParams.key}"`}
    </button>
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={gainValue}
      onChange={handleGainChange}
    />
    {Boolean(error) && <div className="error">{error}</div>}
  </div>;
};

export default Pad;
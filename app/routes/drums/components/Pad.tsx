import { useState } from "react";
import type { ChangeEventHandler, FC } from "react";

type PadProps = {
  soundName: string,
  onMouseDown: () => void,
  defaultGainValue: number,
  onGainChange: (value: number) => void,
}

const Pad: FC<PadProps> = ({
  soundName,
  onMouseDown,
  defaultGainValue,
  onGainChange,
}) => {
  const [value, setValue] = useState<number>(defaultGainValue);

  const handleGainChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(Number(e.currentTarget.value));
    onGainChange(Number(e.currentTarget.value));
  };


  return <div>
    <button
      className="bg-white shadow w-24 h-24 lg:w-64 lg:h-64 rounded"
      onMouseDown={onMouseDown}
    >
      {soundName}
    </button>
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={value}
      onChange={handleGainChange}
    />
  </div>;
};

export default Pad;
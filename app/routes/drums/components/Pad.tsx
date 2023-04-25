import type { FC } from "react";

type PadProps = {
  onMouseDown: () => void,
  soundName: string,
}

const Pad: FC<PadProps> = ({ soundName,onMouseDown }) => {
  return <div>
    <button
      className="bg-white shadow w-24 h-24 lg:w-64 lg:h-64 rounded"
      onMouseDown={onMouseDown}
    >
      {soundName}
    </button>
  </div>;
};

export default Pad;
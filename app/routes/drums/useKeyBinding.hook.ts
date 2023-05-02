import { useEffect } from "react";

export const KEYBOARD_CODE_PREFIX = "Key";

const useKeyBinding = (key: string, callback: () => any) => {
  useEffect(() => {
    const handleKeyboardEvent = ({ code }: KeyboardEvent) => {
      if (code.replace(KEYBOARD_CODE_PREFIX, "").toLowerCase() == key) {
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyboardEvent);

    return () => {
      window.removeEventListener("keydown", handleKeyboardEvent);
    };
  }, [key, callback]);
};

export default useKeyBinding;
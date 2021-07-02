import copy from "copy-to-clipboard";
import React, { useCallback, useEffect, useRef, useState } from "react";

export const useCopyButton = (
  copySource: string | (() => string) | React.RefObject<HTMLTextAreaElement>
) => {
  const [copied, setCopied] = useTemporaryState(false);

  const onClick = useCallback(() => {
    let value: string | undefined;
    switch (typeof copySource) {
      case "string": {
        value = copySource;
        break;
      }
      case "function": {
        value = copySource();
        break;
      }
      case "object": {
        value = copySource.current?.value;
      }
    }
    if (!value) return;
    if (copy(value)) {
      setCopied(true, 2500);
    }
  }, [copySource, setCopied]);

  return { copied, onClick };
};

function useTemporaryState<S>(initialValue: S | (() => S)) {
  const mountedRef = useRef<boolean>(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const timerRef = useRef<any>();
  const [state, setState] = useState(initialValue);

  const wrappedSetState = useCallback(
    (v: React.SetStateAction<S>, duration: number) => {
      timerRef.current && clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setState(initialValue);
      }, duration);
      return setState(v);
    },
    [initialValue]
  );

  return [state, wrappedSetState] as const;
}

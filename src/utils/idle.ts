export type CancelScheduledTask = () => void;

const noop = () => undefined;

export const scheduleWhenPageIdle = (
  callback: () => void,
  timeout = 1500
): CancelScheduledTask => {
  if (typeof window === "undefined") {
    callback();
    return noop;
  }

  let cancelled = false;
  let cancelScheduledWork: CancelScheduledTask = noop;

  const runCallback = () => {
    if (cancelled) {
      return;
    }
    callback();
  };

  const scheduleIdleWork = () => {
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(() => runCallback(), { timeout });
      cancelScheduledWork = () => {
        if (typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(handle);
        }
      };
      return;
    }

    const handle = window.setTimeout(runCallback, 1);
    cancelScheduledWork = () => window.clearTimeout(handle);
  };

  if (document.readyState === "complete") {
    scheduleIdleWork();
  } else {
    const handleLoad = () => {
      window.removeEventListener("load", handleLoad);
      scheduleIdleWork();
    };

    window.addEventListener("load", handleLoad, { once: true });
    cancelScheduledWork = () => window.removeEventListener("load", handleLoad);
  }

  return () => {
    cancelled = true;
    cancelScheduledWork();
  };
};

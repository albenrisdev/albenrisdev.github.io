// Runs in a dedicated worker: worker timers keep firing every 200 ms while the
// window is minimised, where the page's own timers are throttled to once a minute.
let id = null;
self.onmessage = (e) => {
  if (e.data === "start" && id === null) id = setInterval(() => self.postMessage("tick"), 200);
  if (e.data === "stop" && id !== null) { clearInterval(id); id = null; }
};

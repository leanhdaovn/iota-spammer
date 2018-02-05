const port = chrome.extension.connect({
  name: "Sample Communication"
});

const spamStartBtn = document.getElementById('spam-start-btn');
spamStartBtn.onclick = e => {
  port.postMessage({ type: 'START_SPAM'});
};

const spamStopBtn = document.getElementById('spam-stop-btn');
spamStopBtn.onclick = e => {
  port.postMessage({ type: 'STOP_SPAM'});
};

port.onMessage.addListener(msg => {
  console.log("message received", msg);
});
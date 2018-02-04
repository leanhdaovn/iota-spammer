const port = chrome.extension.connect({
  name: "Sample Communication"
});

const spamStartBtn = document.getElementById('spam-start-btn');
spamStartBtn.onclick = e => {
  port.postMessage({ command: 'startSpam'});
};

const spamStopBtn = document.getElementById('spam-stop-btn');
spamStopBtn.onclick = e => {
  port.postMessage({ command: 'stopSpam'});
};


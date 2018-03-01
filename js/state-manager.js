const DEFAULT_PROMOTE_STATE = {
  working: false,
  originalTransaction: null,
  transactions: [],
  errorMessage: null
};

const getPromoteState = (callback) => {
  chrome.storage.local.get({ promoteState: DEFAULT_PROMOTE_STATE }, function ({ promoteState }) {
    callback(promoteState);
  });
};

const updatePromoteState = update => {
  chrome.storage.local.get({ promoteState: DEFAULT_PROMOTE_STATE }, function ({ promoteState }) {
    update(promoteState);
    chrome.storage.local.set({ promoteState })
  });
};

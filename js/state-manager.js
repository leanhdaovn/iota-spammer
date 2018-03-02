const DEFAULT_PROMOTE_STATE = {
  working: false,
  originalTransaction: null,
  transactions: [],
  errorMessage: null
};

const DEFAULT_REATTACH_STATE = {
  working: false,
  originalTransaction: null,
  createdTransaction: null,
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

const getReattachState = (callback) => {
  chrome.storage.local.get({ reattachState: DEFAULT_REATTACH_STATE }, function ({ reattachState }) {
    callback(reattachState);
  });
};

const updateReattachState = update => {
  chrome.storage.local.get({ reattachState: DEFAULT_REATTACH_STATE }, function ({ reattachState }) {
    update(reattachState);
    chrome.storage.local.set({ reattachState })
  });
};


// importScripts('./scripts/say-hi');

// chrome.action.onClicked.addListener((tab) => {
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     files: ["scripts/content-script.js"],
//   });
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.for == "get-user-data") {
    getRandomUserData().then((userJson) => {
      sendResponse(userJson?.results);
    });
  } else if (message.for == "get-scripts") {
    getScripts()
      .then((dirEntry) => {
        sendResponse(dirEntry);
      })
      .catch((err) => {
        sendResponse(err);
      });
  } else if (message.for == "run-script") {
    executeScript(message.path, message.frames).then((response) => {
      sendResponse(response);
    });
  } else if (message.for == "get-all-frames") {
    getFramesOnactiveTab().then((frs) => {
      sendResponse(frs);
    });
  }
  else if(message.for == "activeTabId"){
    getTabId().then(tabId => {
      sendResponse(...tabId);
    })
  }
  else{
    sendResponse(true);
  }

  return true;
});

async function getRandomUserData() {
  return (await fetch("https://randomuser.me/api/")).json();
}

function getScripts() {
  return new Promise((resolve) => {
    chrome.runtime.getPackageDirectoryEntry(function (dir) {
      resolve(dir);
    });
  });
}

async function getLastFocusedWindow() {
  return chrome.windows.getLastFocused({
    populate: true,
    windowTypes: ["normal"],
  });
}

function getTabId() {
  return new Promise((resolve, reject) => {
    getLastFocusedWindow().then((w) => {
      let tabIds = w.tabs
        .filter((v, i) => {
          if (v.active) {
            return true;
          }
        })
        .map((v, i) => {
          return v.id;
        });
      resolve(tabIds);
    });
  });
}

function getFramesOnactiveTab() {
  return new Promise((resolve) => {
    getTabId().then(([tabId]) => {
      chrome.webNavigation.getAllFrames({ tabId: tabId }, function (frs) {
        resolve(frs)
      });
    });
  });
}

async function executeScript(scr, frameIds) {
  console.log(frameIds);
  return chrome.scripting.executeScript({
    target: { tabId: (await getTabId())[0], ...(frameIds && {frameIds: [parseInt(...frameIds)]}) },
    files: [scr],
  });
}

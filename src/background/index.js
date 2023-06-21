chrome.runtime.onMessage.addListener(function (url, sender, sendResponse) {
    fetch(url).then((res) => res.json().then((json) => sendResponse(json)));
    
    return true;
});

// Save nicknames to chrome.storage.local
function getNicknames(){
    fetch('https://raw.githubusercontent.com/carltonnorthern/nickname-and-diminutive-names-lookup/master/names.csv')
    .then(response => response.text())
    .then(text => {
        text = text.trim();
        const parsed = Papa.parse(text).data
        var nicknames = {};
        for (var i = 0; i < parsed.length; i++)
        {
            nicknames[parsed[i][0]] = parsed[i].slice(1);
        }

        chrome.storage.local.set({'nicknames': nicknames});
        chrome.storage.local.set({'nicknamesRetrievalTime': new Date().getTime()});
      })
}

chrome.runtime.onInstalled.addListener(function() {
    getNicknames();
});

// Refresh saved nicknames every month
chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
    const thirtydays = 2592000000; // ms in 30 days
    chrome.storage.local.get(['nicknamesRetrievalTime'], function(result) {
    if (new Date().getTime() - result.nicknamesRetrievalTime > thirtydays) {
         getNicknames();
     }
    })
});

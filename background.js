chrome.runtime.onMessage.addListener(function (url, sender, sendResponse) {
    fetch(url).then((res) => res.json().then((json) => sendResponse(json)));
    
    return true;
});

// Save nicknames to localstorage
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

        localStorage.setItem("nicknames", JSON.stringify(nicknames));
        localStorage.setItem("nicknames-retrieval-date", JSON.stringify(new Date()));
    })
}

chrome.runtime.onInstalled.addListener(function() {
    getNicknames();
});

chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
    const thirtydays = 2592000000; // ms in 30 days
    const retrievalDate = JSON.parse(localStorage["nicknames-retrieval-date"]);
    // Refresh saved nicknames every month
    if (new Date().getTime() - new Date(retrievalDate).getTime() >= thirtydays) {
        getNicknames();
    }
    // Send saved nicknames to content script
    chrome.tabs.sendMessage(tabId, { nicknames: JSON.parse(localStorage.getItem("nicknames")) });
});

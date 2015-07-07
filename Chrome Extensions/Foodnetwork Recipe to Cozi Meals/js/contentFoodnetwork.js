//var m = "Foodnetwork Recipe to Cozi Meals: ";
var m = "FRtoCM: ";
console.info(m + "contentFoodnetwork.js script was loaded");

function waitUntilNotNull(action, done, interval, timeout) {
    if (interval === undefined || typeof interval != 'number')
        interval = 500;
    if (timeout === undefined || typeof timeout != 'number')
        timeout = 15000;
    var timer = setInterval(function() {
        if (timeout <= 0) {
            clearInterval(timer);
        }
        timeout -= interval;
        if (action() != null) {
            clearInterval(timer);
            done();            
        }
    }, interval);
}

var title;
var titleElem = function() {
    var title = "";
    try {
        var title = document.getElementsByTagName("h1")[0];
        title = title.innerHTML;
    } catch(e) {
    }
    return title;
}

waitUntilNotNull(function() {
    return title = titleElem();
}, function() {
    chrome.extension.sendRequest({ set: "title", value: title }, function() {
        chrome.extension.sendRequest({ get: "title" }, function(r){
            console.info(r);
        });
    });
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var out = m; 
        if (sender.tab) {
            out += "A new message was received from a content script: ";
            console.info(out + sender.tab.url);
            //if message came from an extension        
        } else {
            out += "A new message was received from the extension: ";
            if (request.get == "pageHTML") {
                console.info(out + "request.get = " + request.get);
                sendResponse(document.body.innerHTML);
            } else if (request.console != undefined) {
                console.info(out + "(INFO): " + request.console);
                sendResponse("printed");
            }
        }
    });
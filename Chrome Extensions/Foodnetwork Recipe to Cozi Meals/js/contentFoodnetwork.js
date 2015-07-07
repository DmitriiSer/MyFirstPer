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
            done(false);
        }
        timeout -= interval;
        if (action() != null) {
            clearInterval(timer);
            done(true);            
        }
    }, interval);
}

var title = "",
    ingredients = "",
    directions = "";

var titleElem = function() {
    try {
        title = document.getElementsByTagName("h1")[0];
        title = title.innerHTML;        
    } catch(e) {
    }
    return title;
},
    ingredientsElem = function() {
        try {
            var items = document.getElementsByClassName("ingredients")[0];
            items = items.getElementsByTagName("ul")[0];
            items = items.getElementsByTagName("li");
            for (var i = 0; i < items.length; i++) {
                var ingr = items[i].innerHTML;
                while (ingr.includes("<")) {
                    ingr = ingr.substr(0, ingr.indexOf("<")) + 
                        ingr.substr(ingr.indexOf(">") + 1);
                }
                ingredients += ingr.trim() + "\r\n";
            }
        } catch(e) {
        }
        return ingredients;
    },
    directionsElem = function() {
        try {
            var items = document.getElementsByClassName("directions")[0];
            items = items.getElementsByTagName("p");
            for (var i = 0; i < items.length; i++) {
                var dir = items[i].innerHTML;
                while (dir.includes("<")) {
                    dir = dir.substr(0, dir.indexOf("<")) + 
                        dir.substr(dir.indexOf(">") + 1);
                }
                directions += dir.trim() + "\r\n";
            }
        } catch(e) {
        }
        return directions;
    }

//set all the fields of a meal in to variables in background.js
//wait for 'title' to be filled
waitUntilNotNull(
    // try to obtain 'title' from the page
    function() { return title = titleElem(); },
    // done obtaining the 'titile'
    function(result) { 
        if (result) // there is 'titile'
            chrome.extension.sendRequest({ set: "title", value: title });
        else // timeout happened and still no 'title' got
            console.error(m + "Cannot get 'title' from the page"); 
    });
//wait for 'ingredients' to be filled
waitUntilNotNull(
    // try to obtain 'ingredients' from the page
    function() { return ingredients = ingredientsElem(); },
    // done obtaining the 'ingredients'
    function(result) {
        if (result) // there is 'ingredients'
            chrome.extension.sendRequest({ set: "ingredients", value: ingredients });
        else // timeout happened and still no 'ingredients' got
            console.error(m + "Cannot get 'ingredients' from the page");
    });
//wait for 'directions' to be filled
waitUntilNotNull(
    // try to obtain 'directions' from the page
    function() { return directions = directionsElem(); },
    function(result) { // done obtaining the 'directions'
        if (result) // there is 'directions'
            chrome.extension.sendRequest({ set: "directions", value: directions });
        else // timeout happened and still no 'directions' got
            console.error(m + "Cannot get 'directions' from the page");
    });
//
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
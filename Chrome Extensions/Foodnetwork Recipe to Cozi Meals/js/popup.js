//variables
foodnetworkAddress = null;
//log messages in tab's console
function window_log(message, completed) {
    chrome.tabs.query({active: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {console: message}, completed);
    });
}
//reload icons in popup page
function reloadIcons() {
    var icons = document.getElementsByClassName("icon");
    [].forEach.call(icons, function(icon) {
        var hasIconName = false;
        var icon_name = "";
        [].forEach.call(icon.classList, function(className) {
            if (className.includes("i_")) {
                hasIconName = true;
                icon_name = "icons/" + className.substring(2) + ".png";
            }
        });
        if (hasIconName)
            icon.style.backgroundImage = "url(" + icon_name + ")";        
    });
}
//parse foodnetwork page and find recipe title
function parseTitle(pageHTML) {
    var title = "";
    try {
        var page = document.createElement('body');
        page.innerHTML = pageHTML;
        title = page.getElementsByTagName("h1")[0];
        title = title.innerHTML;
    } catch(e) {
        console.error(e);
    }
    return title;
}
//parse foodnetwork page and find all the ingredients
function parseIngredients(pageHTML) {
    var ingredients = "";
    try {
        var page = document.createElement('body');
        page.innerHTML = pageHTML;
        var items = page.getElementsByClassName("ingredients")[0];
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
        console.error(e);
    }
    return ingredients;
}
//parse foodnetwork page and find recipe directions
function parseDirections(pageHTML) {
    var directions = "";
    try {
        var page = document.createElement('body');
        page.innerHTML = pageHTML;
        var items = page.getElementsByClassName("directions")[0];
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
        console.error(e);
    }
    return directions;
}

function btnClick() {
    chrome.tabs.query({ active: true }, function(tabs) {
        if (
            foodnetworkAddress.includes("www.foodnetwork.com/recipes") ||
            foodnetworkAddress.includes(".html")
        ) {
            chrome.tabs.sendMessage(tabs[0].id, { get: "pageHTML" }, function(response) {
                //send fields of a meal to background.js script
                chrome.extension.sendRequest({ set: "title", value: parseTitle(response) });
                chrome.extension.sendRequest({ set: "link", value: foodnetworkAddress });
                chrome.extension.sendRequest({ set: "ingredients", value: parseIngredients(response) });
                chrome.extension.sendRequest({ set: "directions", value: parseDirections(response) });
                //create Cozi Meals tab
                var newURL = "https://my.cozi.com/meals/?box";
                //newURL = "http://www.yandex.ru";
                chrome.tabs.create({ url: newURL });
            });
        }
    });
}
//extension PopUp
document.addEventListener("DOMContentLoaded", function() {    
    //add button listener
    var checkPageButton = document.getElementById("btn");
    checkPageButton.addEventListener('click', btnClick);
    reloadIcons();
    //
    chrome.tabs.query({ active: true }, function(tabs) {
        foodnetworkAddress = tabs[0].url;
        var table = document.getElementsByTagName("table")[0];
        var stripes = document.getElementById("stripes");
        if (
            foodnetworkAddress.includes("www.foodnetwork.com/recipes/") &&
            foodnetworkAddress.includes(".html")
        ) {
            checkPageButton.disabled = false;            
            table.classList.remove("btnDisabled");
            stripes.classList.remove("striped");
        } else {
            checkPageButton.disabled = true;
            table.classList.add("btnDisabled");
            stripes.classList.add("striped");
        }
        //
        //btnClick();
    });
});
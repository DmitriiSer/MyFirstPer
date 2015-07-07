// variables
foodnetworkAddress = null;
// log messages in tab's console
function window_log(message, completed) {
    chrome.tabs.query({active: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {console: message}, completed);
    });
}
// reload icons in popup page
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
// button click handler
function btnClick() {
    chrome.tabs.query({ active: true }, function(tabs) {
        if (
            foodnetworkAddress.includes("www.foodnetwork.com/recipes") ||
            foodnetworkAddress.includes(".html")
        ) {
            //create Cozi Meals tab
            chrome.tabs.create({ url: "https://my.cozi.com/meals/?box" });
        }
    });
}
// extension PopUp
document.addEventListener("DOMContentLoaded", function() {    
    //add button listener
    var checkPageButton = document.getElementById("btn");
    checkPageButton.addEventListener('click', btnClick);
    //reload icons in popup page
    reloadIcons();
    //
    chrome.tabs.query({ active: true }, function(tabs) {
        foodnetworkAddress = tabs[0].url;
        //set 'link' field of a meal into a variable in background.js
        chrome.extension.sendRequest({ set: "link", value: foodnetworkAddress });
        // check if popup was shown in a page with a recipe
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
    });
});
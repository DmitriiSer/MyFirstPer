//var m = "Foodnetwork Recipe to Cozi Meals: ";
var m = "FRtoCM: ";
console.info(m + "'contentCozi.js' script was loaded");

function insertTextAtCursor(text) {
    var el = document.activeElement;
    var val = el.value;
    var endIndex;
    var range;
    var doc = el.ownerDocument;
    if (typeof el.selectionStart === 'number' &&
        typeof el.selectionEnd === 'number') {
        endIndex = el.selectionEnd;
        el.value = val.slice(0, endIndex) + text + val.slice(endIndex);
        el.selectionStart = el.selectionEnd = endIndex + text.length;
    } else if (doc.selection !== 'undefined' && doc.selection.createRange) {
        el.focus();
        range = doc.selection.createRange();
        range.collapse(false);
        range.text = text;
        range.select();
    }
}

//variables for ingredients and directions
var title = null,
    description = null,
    link = null,
    ingredients = null,
    directions = null;
var buttonNewElem = function() { return document.getElementById("buttonNew"); },
    buttonSaveElem = function() { return document.getElementById("buttonSave"); },
    titleElem = function(props) {
        var elem = document.getElementById("RecipeViewForm_name");
        elem = elem.getElementsByTagName("input")[0];
        if (props.selected)
            elem.select();
        return elem;
    },
    linkElem = function(props) {
        var elem = document.getElementById("RecipeViewForm_url");
        elem = elem.getElementsByTagName("input")[0];
        if (props.selected)
            elem.select();
        return elem;
    },
    ingredientsElem = function(props) {
        var elem = document.getElementById("RecipeViewForm_ingredients");
        elem = elem.getElementsByClassName("AutoSizeTextBox")[0];
        elem = elem.getElementsByTagName("textarea")[0];
        if (props.selected)
            elem.select();
        return elem;
    },
    directionsElem = function(props) {
        var elem = document.getElementById("RecipeViewForm_preparation");
        elem = elem.getElementsByClassName("AutoSizeTextBox")[0];
        elem = elem.getElementsByTagName("textarea")[0];
        if (props.selected)
            elem.select();
        return elem;
    }

//function waitUntilNotNull(request, setWhat, interval, timeout) {
function waitUntilNotNull(do, interval, timeout) {
    if (interval === undefined || typeof interval != 'number')
        interval = 500;
    if (timeout === undefined || typeof timeout != 'number')
        timeout = 15000;
    var timer = setInterval(function() {
        if (timeout <= 0) {
            clearInterval(timer);
        }
        timeout -= interval;
        var response = do();
        if (response != null)
            clearInterval(timer);
        /*chrome.extension.sendRequest(request, function(response) {
            if (response != null) {
                console.info(request + " => " + response);
                setWhat(response);
                clearInterval(timer);
            };
        });*/
    }, interval);
}

//send requests for all the fields of a meal
//wait for 'title' to be filled
//waitUntilNotNull({ get: "title" }, function(r) { title = r; });
waitUntilNotNull(function() {
    chrome.extension.sendRequest({ get: "title" }, function(response) {
        if (response != null) {
            console.info("{ get: 'title' } => " + response);
            title = response;
            return response;
        }
    });
});
//wait for 'link' to be filled
/*waitUntilNotNull({ get: "link" }, function(r) { link = r; });
//wait for 'ingredients' to be filled
waitUntilNotNull({ get: "ingredients" }, function(r) { ingredients = r; });
//wait for 'directions' to be filled
waitUntilNotNull({ get: "directions" }, function(r) { directions = r; });*/

//timer timeouts
var timerTimeout = 15000;
//wait for all the fields would be filled
var timer = setInterval(function() {
    if (timerTimeout <= 0)
        clearInterval(timer);
    timerTimeout -= 500;
    var button = buttonNewElem();
    //check if all the fields are not null
    if ((title != null) &&
        (link != null) &&
        (ingredients != null) &&
        (directions != null) &&
        (button != undefined)) {
        try {
            //
            button.click();
            //insert title
            titleElem({ selected : true});
            insertTextAtCursor(title);
            //insert link
            linkElem({ selected : true});
            insertTextAtCursor(link);
            //insert ingredients
            ingredientsElem({ selected : true});
            insertTextAtCursor(ingredients);
            //insert directions
            directionsElem({ selected : true});
            insertTextAtCursor(directions);
            //press Save button
            button = buttonSaveElem();
            //button.click();
            //clear waiting timer
            clearInterval(timer);
        } catch(e) {
            console.error(e);
            clearInterval(timer);
        }
    }
}, 500);


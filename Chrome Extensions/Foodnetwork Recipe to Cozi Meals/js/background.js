//variables for 'ingredients' and 'directions'
var title = null,
    link = null,
    ingredients = null,
    directions = null;

//listener for requests
chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
    if (request.get == "title") { sendResponse(title); }
    else if (request.get == "link") { sendResponse(link); }
    else if (request.get == "ingredients") { sendResponse(ingredients); }
    else if (request.get == "directions") { sendResponse(directions); }
    else if (request.set == "title") { title = request.value; }
    else if (request.set == "link") { link = request.value; }
    else if (request.set == "ingredients") { ingredients = request.value; }
    else if (request.set == "directions") { directions = request.value; }
});
/*jslint strict: true, vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

(function( $ ) {
    $.fn.carousel = function(params) {
        // Properties
        var viewportWidth = params.width;
        var viewportHeight = params.height;
        var imageWidth = params.imageWidth;
        var dragable = params.dragable;
        var scrollbar = params.scrollbar;
        var cyclic = params.cyclic;
        // Default values for properties
        if (!viewportWidth) { viewportWidth = "100%"; }
        if (!viewportHeight) { viewportHeight = 200; }
        if (!imageWidth) { imageWidth = "100%"; }
        if (dragable === undefined || dragable === null) { dragable = true; }
        if (scrollbar === undefined || scrollbar === null) { scrollbar = false; }
        if (cyclic === undefined || cyclic === null) { cyclic = true; }
        // Variables
        var obj = this;
        //check if viewport has a class. If not add a style to a viewport
        if (!obj.hasClass("carousel")) { obj.addClass("carousel"); }
        //check if there is an element with a class 'scrollable'. If not then create one and fill it with images
        var scrollable;
        if ( !$(".scrollable").length ) {
            obj.append("<div class='scrollable'></div>");
            $("img").each(function(number, element) { $(".scrollable").append(element); });
        }
        scrollable = $(".scrollable");
        // show a scrollbar if scrollbar == true
        if (scrollbar) { obj.css({ "overflow-y": "hidden", "overflow-x": "scroll" }); }
        else { obj.css("overflow", "hidden"); }        
        //check if there is an element with a class 'arrow'. If not then create one
        var arrow;
        if ( !$(".arrow").length ) { obj.prepend("<div class='arrow'></div>"); }
        arrow = $(".arrow");
        // set unicode arrow symbol to arrow div
        arrow.html("&#x27bb");
        // check if there is a canvas object. If not then create one
        var canvas = $("carousel canvas");
        if ( !$("carousel canvas").length ) { obj.prepend("<canvas style='display: none'></canvas>"); }        
        // set variables for images
        var img = $(".carousel img");
        var imgCount = $(".carousel img").length;        
        //
        var mouseDown = false;
        var dragged = false;
        var mouseDownDragPosition;
        var currentImg = 0;
        var currentImgFract = 0.0;
        var nextOrPrevImgAreaWidth = "25px";
        var moveDirectionAfterMouseDown = 0;
        //
        // Set width to viewport (.carousel) and exclude borders
        obj.width(viewportWidth);
        // Set heigth to viewport (.carousel)
        if (viewportHeight.indexOf("%") != -1) {
            obj.height($(window).height() * viewportHeight.replace("%", "") / 100);
        } else {
            obj.height(viewportHeight);
        }
        // Set widths to scrollable area (.scrollable) and exclude borders    
        //   If image width contains percantage than translate it to px
        if (imageWidth.indexOf("%") != -1) {
            imageWidth = innerWidth(obj) * imageWidth.replace("%", "") / 100;
            imageWidth = imageWidth -
                border(scrollable).left - border(scrollable).right -
                border(img).left - border(img).right;            
        }
        scrollable.width(imgCount * (imageWidth + border(img).left + border(img).right) + 1);
        // Set widths to images (.carousel img)
        img.width(imageWidth);
        // Set heigth to images (.carousel img)
        img.height(innerHeight(scrollable) - border(img).top - border(img).bottom);
        //
        //--Carousel event attaching
        //----Prevent dragging        
        obj.on("dragstart", function (e) { e.preventDefault(); });
        //----Mouse events
        obj.on("mousedown", function(e) {
            mouseDown = true; if (dragable) { mouseDownDragPosition = e.pageX - left(scrollable); }
        });
        obj.on("mouseup", carouselMouseUp);
        obj.on("mouseleave", function() {
            mouseDown = false;
            //RETURN: backToBorders();
        });
        //----Dragging and scrolling
        obj.on("mousemove scroll", carouselMouseMove);
        /*obj.on("scroll", function(e) {
            log("this.scrollWidth: " + this.scrollWidth, 1);
            log("this.offsetWidth: " + this.offsetWidth);
            //this.scrollLeft = 0;
        });*/
        //----Window resizes
        $(window).on("resize", function() {
            obj.width(viewportWidth);
            if (viewportHeight.indexOf("%") != -1) {
                obj.height($(window).height() * viewportHeight.replace("%", "") / 100);
            } else {
                obj.height(viewportHeight);
            }
        });

        // Carousel event handlers
        function carouselMouseUp(e) {
            //console.log("carouselMouseUp");
            try {
                //TODO: show/hide blended scrollbar
                // Check if arrow is visible then hide it
                if (arrow.css("display") == "table") {
                    arrow.velocity("stop")
                        .velocity({ left: 0, opacity: 0 }, "slow", function (){ arrow.css("display", "none"); });
                }
                // Move scrollable area back to the borders if it was moved
                //RETURN:
                if (mouseDown && dragged) { backToBorders(); /*dragged = false;*/ }
                mouseDown = false;
                moveDirectionAfterMouseDown = 0;
                // Set up a clicking area width in %
                var clickingAreaWidth = 0.20;
                // Calculate ending position for left clicknig area to go to prev elem
                var leftClickingAreaEnds = innerLeft(obj) + (innerWidth(obj) * clickingAreaWidth);
                // Calculate starting position for right clicknig area to go to next elem
                var rightClickingAreaStarts = innerRight(obj) - (innerWidth(obj) * clickingAreaWidth);
                // If cursor is located on the area that allows to move to the previous image
                if ((innerLeft(obj) < e.pageX) && (e.pageX < leftClickingAreaEnds)) {
                    // check if mouve is still moving and leaving viewport's area
                    if (dragged) { dragged = false; return; }
                    // check if button was pressed
                    if (e.which > 0) { goTo("prev"); }
                }
                // If cursor is located on the area that allows to move to the next image
                if ((rightClickingAreaStarts < e.pageX) && (e.pageX < innerRight(obj))) {
                    // check if mouve is still moving and leaving viewport's area
                    if (dragged) { dragged = false; return; }
                    // check if button was pressed
                    if (e.which > 0) { goTo("next"); }
                }
            } catch(e) {
                console.error("carouselMouseUpAndLeave" + e);
            }
        }        
        function carouselMouseMove(e) {
            try {                
                // Check if scrollable area has grabbed
                if (mouseDown) {
                    dragged = true;
                    log("carouselMouseMove::drag", 1); log(scrollable.offset().left);                    
                    moveDirectionAfterMouseDown = e.pageX - left(scrollable) - mouseDownDragPosition;
                    if (moveDirectionAfterMouseDown < 0) { moveDirectionAfterMouseDown = -1; }
                    else if (moveDirectionAfterMouseDown > 0) { moveDirectionAfterMouseDown = 1; }
                    else { moveDirectionAfterMouseDown = 0; }
                    // Calculate a shift from the position where the mouse was pressed
                    var shift = e.pageX - mouseDownDragPosition;
                    var scrollShift = 213 - shift;
                    //TODO: make scrollbar work
                    // Drag scrollable area
                    //console.log(shift);

                    //scrollable.offset({ left : shift });
                    
                    //obj[0].scrollLeft = scrollShift;

                    //console.log("" + scrollable.offset().left);
                    //console.log(obj[0].scrollLeft);
                    //obj.scrollLeft(-shift);

                    // Change scrollbar position
                    //obj.scrollLeft(left(obj) - shift);
                    // Check if arrow is not appeared then make it visible
                    if (arrow.css("display") == "none") {
                        arrow.css("display", "table");
                    }
                    var arrowShift = null;
                    var arrowDirection = 0;
                    // Check if scrollable area has crossed the left border then show the arrow
                    if ( left(scrollable) > innerLeft(obj) ) {
                        var fontSize = arrow.css('font-size').replace("px","");
                        arrowDirection = 180;
                        arrowShift = left(scrollable) - innerLeft(obj) - fontSize;
                    }
                    // Check if scrollable area has crossed the right border
                    else if ( right(scrollable) < innerRight(obj) ) {
                        arrowDirection = 0;
                        arrowShift = right(scrollable) - innerLeft(obj);
                    }
                    if (arrowShift != null) {                        
                        //Change left property of the arrow while moving the scrollable area
                        arrow.css("left", arrowShift);
                        // if the arrow is not animating then animate it to show
                        if (!arrow.hasClass("velocity-animating") && arrow.css("opacity") < 1) {
                            arrow.velocity("stop").velocity({ rotateZ: arrowDirection + "deg" }, 0).velocity({ opacity: 1 }, "slow");
                        }
                    }
                    // Change currentImg
                    currentImgFract = (innerLeft(obj) - shift) / width(img);
                    currentImg = Math.floor(currentImgFract);
                    //TODO: make it cyclic
                    //Check if a carousel is cyclic
                    if (cyclic) {
                        //log();
                        //log(innerRight(scrollable));
                        /*
                        log("in cyclic", 1);
                        //Prepend the last image before image #1
                        var firstImg = $(".scrollable > img:first");
                        var lastImg = $(".scrollable > img:last");
                        log("before prependImg");
                        scrollable.prepend(lastImg);//.clone());
                        scrollable.width(innerWidth(scrollable) + width(lastImg));
                        imgCount++;
                        //if (currentImgFract < 0) {
                        log("in prependImg");
                        //goTo(currentImg + 2);
                        //}
                        log("after prependImg");
                        //$(".scrollable > img:last").prependTo(scrollable);
                        //log(img.length, 1);
                        cyclic = true;
                        //cyclic = false;
                        log("cyclic false");
                        mouseDown = false;
                        goTo("next");*/
                    }
                }
            } catch(e) {
                console.error("carouselMouseMove: " + e);
            }
            //log("carouselMouseMove", 1); log("currentImg: " + currentImg); log("currentImgFract: " + currentImgFract);
        }
        // Helper methods
        function afterBackToBorders() {
            try {
                currentImgFract = (innerLeft(obj) - innerLeft(scrollable)) / width(img);
                currentImg = Math.round(currentImgFract);
            } catch(e) {
                console.log("afterBackToBorders: " + e);
            }
        }
        function backToBorders(speed) {
            try {
                scrollable.velocity("stop");
                if (!speed) { speed = "fast"; }
                var nextOrPrevImgAreaWidthPercentage = 0.05;
                /*if (nextOrPrevImgAreaWidth.indexOf("px") != -1) {
                    nextOrPrevImgAreaWidthPercentage = nextOrPrevImgAreaWidth.replace("px","") / width(img);
                }*/
                var currentImgViwportPosition = currentImgFract - currentImg;
                console.log("currentImgViwportPosition: " + currentImgViwportPosition);
                console.log("moveDirectionAfterMouseDown: " + moveDirectionAfterMouseDown);
                // If scrollable area goes out of the left border
                if ( left(scrollable) > innerLeft(obj) ) {
                    console.log("backToBorders::outOfTheLeft");
                    // Slide back to the left border
                    scrollable.velocity({ left: 0 }, speed, afterBackToBorders);
                }
                // If scrollable area goes out of the right border
                else if ( right(scrollable) < innerRight(obj) ) {
                    console.log("backToBorders::outOfTheRight");
                    // Slide back to the right border
                    scrollable.velocity({
                        left: width(img) + border(scrollable).left + border(scrollable).right - width(scrollable) + 1
                    }, speed, afterBackToBorders);
                }
                //
                /*TODO: does it need it?
                else if (where == "next") {
                    // Slide to the next image
                    scrollable.velocity({ left: -width(img) * (1 + currentImg) }, speed, afterBackToBorders);
                }*/
                // If scrollable area crosses the inner border between images
                // If scrollable area drags to the left
                else if (moveDirectionAfterMouseDown == -1) {
                    if (currentImgViwportPosition >= nextOrPrevImgAreaWidthPercentage) {
                        console.log("backToBorders::goToNext");
                        // Slide to the next image
                        //TODO: leave this or next
                        goTo("next", speed);
                        //scrollable.velocity({ left: -width(img) * (1 + currentImg) }, speed, afterBackToBorders);
                    }
                    if (currentImgViwportPosition < nextOrPrevImgAreaWidthPercentage) {
                        console.log("backToBorders::StayAtTheCurrentImage");
                        // Back to current image border
                        goTo("current", speed);
                        //scrollable.velocity({ left: -width(img) * (currentImg) }, speed, afterBackToBorders);
                    }
                }
                // If scrollable area drags to the right
                else if (moveDirectionAfterMouseDown == 1) {
                    if (currentImgViwportPosition <= (1 - nextOrPrevImgAreaWidthPercentage)) {
                        console.log("backToBorders::goToPrev");
                        // Slide to the previous image
                        //TODO: leave this or next
                        goTo("prev", speed);
                        //scrollable.velocity({ left: -width(img) * (currentImg) }, speed, afterBackToBorders);
                    }
                    if (currentImgViwportPosition > (1 - nextOrPrevImgAreaWidthPercentage)) {
                        console.log("backToBorders::StayAtTheCurrentImage");
                        // Back to current image border
                        goTo("current", speed);
                        //scrollable.velocity({ left: -width(img) * (currentImg + 1) }, speed, afterBackToBorders);
                    }
                }
            } catch(e) {
                console.error("backToBorders: " + e);
            }
        }
        function afterGoTo() {
            currentImgFract = (innerLeft(obj) - innerLeft(scrollable)) / width(img);
            currentImg = Math.round(currentImgFract);
            //console.log("innerLeft(obj): " + innerLeft(obj) + ", innerLeft(scrollable): " + innerLeft(scrollable) + ", width(img): " + width(img));
            console.log("afterGoTo: currentImg: " + currentImg);
        }
        function goTo(where, speed) {
            if (!speed) { speed = "fast"; }
            if (!where) { where = "next"; }
            console.log("goTo " + where + " " + speed);
            var pos, scrollPos;
            if (where == "next") {
                scrollPos = width(img);// * (currentImg + 1) - (innerLeft(obj) - left(scrollable));
                console.log("scrollPos: " + scrollPos);
                //pos = -width(img) * (currentImg + 1);
            } else if (where == "prev") {
                scrollPos = -width(img);// * (currentImg + 1) - (innerLeft(obj) - left(scrollable));;
                //pos = -width(img) * (currentImg - 1);
            } else if (where == "current") {
                scrollPos = -width(img);
            } else { throw "ERROR::goTo::where == " + where; }
            //if scrollable area is not animating
            if (true) {//!scrollable.hasClass("velocity-animating")) {
                // if current image is not the first one and the last one
                if ((currentImg < imgCount - 1 && where == "next") ||
                    (currentImg >= 0 && where == "prev")) {
                    /*console.log("scrollable.width(): " + scrollable.width());
                    //obj[0].scrollLeft += (scrollable.width() / imgCount);
                    console.log("obj[0].scrollLeft: " + obj[0].scrollLeft);
                    console.log("pos: " + pos);
                    console.log("scrollable.offset().left: " + scrollable.offset().left);*/
                    //scrollable.offset().left += pos;
                    //console.log("currentImg: " + currentImg + ", pos: " + pos + ", scrollPos: " + scrollPos);
                    //console.log(img[scrollPos]);
                    //$("#img" + scrollPos)
                    obj.velocity("scroll", {
                        duration: speed,
                        container: obj,
                        offset: scrollPos,
                        axis: "x",
                        complete: afterGoTo,
                    });
                    //obj.dequeue("goTo");
                    //scrollable.velocity("stop").velocity({ left : pos }, speed, /*[500, 20],*/ afterGoTo);
                }
            }
        }
        /*function createScrollbar() {
            var img = $("img:first")[0];
            var carousel = $(".carousel");
            //
            var canvas = $("canvas")[0];
            var ctx = canvas.getContext("2d");
            var pixelsFromBelow = 18;
            var naturalPixelsFromBelowY = (img.naturalHeight / img.height ) * pixelsFromBelow;
            canvas.width = carousel.width();
            canvas.height = pixelsFromBelow;
            ctx.translate(0, pixelsFromBelow);
            ctx.scale(1, -1);
            ctx.drawImage(img,
                          0, img.naturalHeight - naturalPixelsFromBelowY, img.naturalWidth, naturalPixelsFromBelowY,
                          0, 0, img.width, pixelsFromBelow );
            //carousel.css("background", "white");
            var scr = $(".scrollbar");
            carousel.addClass("scrollbar");
            carousel.css("background", "url(" + canvas.toDataURL("image/png")+ ") no-repeat left bottom, url(images/bg.JPG) repeat left top");
            updateScrollbar(carousel);
            //
            function updateScrollbar(elem) {
                elem.css('overflow', 'hidden').height();
                elem.css({ "overflow-y": "hidden", "overflow-x": "scroll"});
            }
        }*/
    }

    function log(message, clear) {
        if (clear == 1) { $(".console").html(""); }
        if (!message) { $(".console").html(""); } else { $(".console").append(message + "</br>"); }
    }
    // Outer left position (including left border)
    function left(elem) { return elem[0].getBoundingClientRect().left; }
    // Inner left position (without left border)
    function innerLeft(elem) { return left(elem) + border(elem).left; }
    // Outer right position (including right border)
    function right(elem) { return elem[0].getBoundingClientRect().right; }
    // Inner right position (without right border)
    function innerRight(elem) { return right(elem) - border(elem).left; }
    // Outer top position (including top border)
    function top(elem) { return elem[0].getBoundingClientRect().top; }
    // Inner top position (without top border)
    function innerTop(elem) { return top(elem) - border(elem).top; }
    // Outer bottom position (including bottom border)
    function bottom(elem) { return elem[0].getBoundingClientRect().bottom; }
    // Inner bottom position (without bottom border)
    function innerBottom(elem) { return bottom(elem) - border(elem).bottom; }
    // Outer width (including left and right borders)
    function width(elem) { return right(elem) - left(elem); }
    // Inner width (without left and right borders)
    function innerWidth(elem) { return width(elem) - border(elem).left - border(elem).right; }
    // Outer height (including top and bottom borders)
    function height(elem) { return bottom(elem) - top(elem); }
    // Inner height (without top and bottom borders)
    function innerHeight(elem) { return height(elem) - border(elem).top - border(elem).bottom; }
    function border(elem) {
        var border = { left: parseInt(elem.css("border-left-width")),
                      top: parseInt(elem.css("border-top-width")),
                      right: parseInt(elem.css("border-right-width")),
                      bottom: parseInt(elem.css("border-bottom-width")) };
        return border;
    }
}) ( jQuery );
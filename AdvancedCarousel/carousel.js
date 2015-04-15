/*jslint strict: true, vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

(function( $ ) {
    $.fn.carousel = function(params) {
        //return;
        // Properties
        var viewportWidth = params.width;
        var viewportHeight = params.height;
        var imageWidth = params.imageWidth;
        var dragable = params.dragable;
        var cyclic = params.cyclic;
        // Default values for properties
        if (!viewportWidth) { viewportWidth = "100%"; }
        if (!viewportHeight) { viewportHeight = 200; }
        if (!imageWidth) { imageWidth = "100%"; }
        if (dragable === undefined || dragable === null) { dragable = true; }
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
        var outOfScrollable;
        //check if there is an element with a class 'out-of-scrollable'. If not then create one
        if ( !$(".out-of-scrollable").length ) { obj.prepend("<div class='out-of-scrollable'></div>"); }
        outOfScrollable = $(".out-of-scrollable");
        // set an arrow to outOfScrollable div
        outOfScrollable.html("&#x27bb");
        // check if there is a canvas object. If not then create one
        var canvas = $("carousel canvas");
        log(canvas.width());
        if ( !$("carousel canvas").length ) { obj.prepend("<canvas style='display: none'></canvas>"); }        
        log(canvas.width());
        // set variables for images
        var img = $(".carousel img");
        var imgCount = $(".carousel img").length;        
        //
        var mouseDown = false;
        var mouseMoved = false;
        var mouseDownDragPosition;
        var currentImg = 0;
        var currentImgFract = 0.0;
        var nextOrPrevImgAreaWidth = "25px";
        var moveDirectionAfterMouseDown = 0;
        //
        // Set width to viewport (.carousel) and exclude borders
        obj.width(viewportWidth);
        obj.width(innerWidth(obj) - border(obj).left - border(obj).right);
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
        // Set heigth to viewport (.carousel)
        obj.height(viewportHeight);
        // Set heigth to images (.carousel img)
        img.height(innerHeight(scrollable) - border(img).top - border(img).bottom);
        //
        //--Carousel event attaching
        //----Prevent dragging        
        obj.on("dragstart", function (e) { e.preventDefault(); });
        //----Mouse events
        obj.on("mousedown", carouselMouseDown);
        obj.on("mouseup", carouselMouseUp);
        obj.on("mouseleave", carouselMouseLeave);
        obj.on("mousemove", carouselMouseMove);
        /*obj.on("dblclick", function(){ log("dblclick"); });//carouselMouseDblClick);*/

        // Carousel event handlers
        function carouselMouseDown(e) {
            try {
                //log("carouselMouseDown", 1);
                mouseDown = true;
                if (dragable) {
                    mouseDownDragPosition = e.pageX - left(scrollable);
                }
            } catch(e) {
                console.error("carouselMouseDown" + e);
            }
        }
        function carouselMouseUp(e) {
            try {
                //TODO: show/hide blended scrollbar
                mouseDown = false;
                // Hide the arrow
                outOfScrollable.velocity("stop").velocity({ left: 0, opacity: 0 }, 0 );
                // Move scrollable area back to the borders
                backToBorders();
                //
                // Set up a clicking area width in %
                var clickingAreaWidth = 0.20;
                // Calculate ending position for left clicknig area to go to prev elem
                var leftClickingAreaEnds = innerLeft(obj) + (innerWidth(obj) * clickingAreaWidth);
                // Calculate starting position for right clicknig area to go to next elem
                var rightClickingAreaStarts = innerRight(obj) - (innerWidth(obj) * clickingAreaWidth);
                // If cursor is located on the area that allows to move to the previous image
                if ((innerLeft(obj) < e.pageX) && (e.pageX < leftClickingAreaEnds)) {
                    // check if mouve is still moving and leaving viewport's area
                    if (mouseMoved) { mouseMoved = false; return; }
                    // check if button was pressed
                    if (e.which > 0) { goTo("prev"); }
                }
                // If cursor is located on the area that allows to move to the next image
                if ((rightClickingAreaStarts < e.pageX) && (e.pageX < innerRight(obj))) {
                    // check if mouve is still moving and leaving viewport's area
                    if (mouseMoved) { mouseMoved = false; return; }
                    // check if button was pressed
                    if (e.which > 0) { goTo("next"); }
                }
            } catch(e) {
                console.error("carouselMouseUpAndLeave" + e);
            }
        }
        function carouselMouseLeave(e) {
            mouseDown = false;
            backToBorders();
        }
        function carouselMouseMove(e) {
            try {
                // Check if scrollable area has grabbed
                if (mouseDown) {
                    mouseMoved = true;
                    moveDirectionAfterMouseDown = e.pageX - left(scrollable) - mouseDownDragPosition;
                    if (moveDirectionAfterMouseDown < 0) { moveDirectionAfterMouseDown = -1; }
                    else if (moveDirectionAfterMouseDown > 0) { moveDirectionAfterMouseDown = 1; }
                    else { moveDirectionAfterMouseDown = 0; }
                    // Calculate a shift from the position where the mouse was pressed
                    var shift =  e.pageX - mouseDownDragPosition;
                    // Check if scrollable area has crossed the left border then show the arrow
                    if ( left(scrollable) > innerLeft(obj) ) {
                        var fontSize = outOfScrollable.css('font-size').replace("px","");
                        //Change css properties of the arrow while moving the scrollable area
                        outOfScrollable.css({
                            display : "table",
                            left: left(scrollable) - innerLeft(obj) - fontSize,
                            opacity: "+=0.01"
                        });
                        outOfScrollable.velocity("stop").velocity({ rotateZ: "0deg)" }, 0);
                    }
                    // Check if scrollable area has crossed the right border
                    else if ( right(scrollable) < innerRight(obj) ) {
                        var fontSize = outOfScrollable.css('font-size').replace("px","");
                        outOfScrollable.css({
                            display : "table",
                            left: right(scrollable) - innerLeft(obj),
                            opacity: "+=0.01"
                        });                    
                        //outOfScrollable.width("-=" + 1);
                        outOfScrollable.velocity("stop").velocity({ rotateZ: "180deg)" }, 0);
                    }
                    // Drag scrollable area
                    scrollable.offset({left : shift});
                    // Change currentImg
                    currentImgFract = (innerLeft(obj) - shift) / width(img);
                    currentImg = Math.floor(currentImgFract);
                    //Check if a carousel is cyclic
                    if (cyclic) {
                        //log();
                        //log(innerRight(scrollable));
                        var x = 0;
                        if (x==0) {
                            //log("yuck");
                        }
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
        function backToBorders(speed, where) {
            try {
                //log("backToBorders", 1);
                scrollable.velocity("stop");
                if (!speed) { speed = "fast"; }
                var nextOrPrevImgAreaWidthPercentage = 0.05;
                /*if (nextOrPrevImgAreaWidth.indexOf("px") != -1) {
                    nextOrPrevImgAreaWidthPercentage = nextOrPrevImgAreaWidth.replace("px","") / width(img);
                }*/
                var currentImgViwportPosition = currentImgFract - currentImg;
                // If scrollable area goes out of the left border
                if ( left(scrollable) > innerLeft(obj) ) {
                    // Slide back to the left border
                    scrollable.velocity({ left: 0 }, speed, afterBackToBorders);
                }
                // If scrollable area goes out of the right border
                else if ( right(scrollable) < innerRight(obj) ) {
                    // Slide back to the right border
                    scrollable.velocity({
                        left: width(img) + border(scrollable).left + border(scrollable).right - width(scrollable) + 1
                    }, speed, afterBackToBorders);
                }
                //
                else if (where == "next") {
                    // Slide to the next image
                    scrollable.velocity({ left: -width(img) * (1 + currentImg) }, speed, afterBackToBorders);
                }
                // If scrollable area crosses the inner border between images
                else if (moveDirectionAfterMouseDown == -1) {
                    if (currentImgViwportPosition >= nextOrPrevImgAreaWidthPercentage) {
                        // Slide to the next image
                        scrollable.velocity({ left: -width(img) * (1 + currentImg) }, speed, afterBackToBorders);
                    }
                    if (currentImgViwportPosition < nextOrPrevImgAreaWidthPercentage) {
                        // Back to current image border
                        scrollable.velocity({ left: -width(img) * (currentImg) }, speed, afterBackToBorders);
                    }
                }
                else {//if (moveDirectionAfterMouseDown == 1) {
                    if (currentImgViwportPosition <= (1 - nextOrPrevImgAreaWidthPercentage)) {
                        // Slide to the previous image
                        scrollable.velocity({ left: -width(img) * (currentImg) }, speed, afterBackToBorders);
                    }
                    if (currentImgViwportPosition > (1 - nextOrPrevImgAreaWidthPercentage)) {
                        // Back to current image border
                        scrollable.velocity({ left: -width(img) * (currentImg + 1) }, speed, afterBackToBorders);
                    }
                }
            } catch(e) {
                console.error("backToBorders: " + e);
            }
        }
        function afterGoPrevOrNext() {
            currentImgFract = (innerLeft(obj) - innerLeft(scrollable)) / width(img);
            currentImg = Math.round(currentImgFract);
        }
        var c;
        $.Velocity.Easings.myCustomEasing = function (p, opts, tweenDelta) {
            return 0.5 - Math.cos( p * Math.PI ) / 2;
        };
        function goTo(where, speed) {
            //log("goTo");
            if (!speed) { speed = "fast"; }
            if (!where) { where = "next"; }
            var shift;
            if (where == "next") {
                shift = -width(img) * (currentImg + 1);
            } else if (where == "prev") {
                shift = -width(img) * (currentImg - 1);
            }
            else {
                throw err;
            }
            // if current image is not the first one and the last one
            if ((currentImg < imgCount - 1 && where == "next") ||
                (currentImg > 0 && where == "prev")) {
                scrollable.velocity("stop").velocity({ left : shift }, speed, /*[100, 10],*/ afterGoPrevOrNext);
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
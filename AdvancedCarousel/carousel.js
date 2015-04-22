/*jslint strict: true, vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

(function( $ ) {
    $.fn.carousel = function(params) {
        // Properties
        var viewportWidth = params.width;
        var viewportHeight = params.height;
        var imageWidth = params.imageWidth;
        var draggable = params.draggable;
        var cyclic = params.cyclic;
        // Default values for properties
        if (!viewportWidth) { viewportWidth = "100%"; }
        if (!viewportHeight) { viewportHeight = 200; }
        if (!imageWidth) { imageWidth = "100%"; }
        if (draggable === undefined || draggable === null) { draggable = true; }
        if (cyclic === undefined || cyclic === null) { cyclic = true; }
        // Variables
        // set viewport variable to this
        var viewport = this;
        //check if viewport has a class. If not add a style to a viewport
        if (!viewport.hasClass("carousel")) { viewport.addClass("carousel"); }
        //check if there is an element with a class 'scrollable'. If not then create one and fill it with images
        var scrollable;
        if ( !$(".scrollable").length ) {
            viewport.append("<div class='scrollable'></div>");
            $("img").each(function(number, element) { $(".scrollable").append(element); });
        }
        scrollable = $(".scrollable");
        // set variables for images
        var img = $(".carousel img");
        var imgCount = $(".carousel img").length;
        //check if there is an element with a class 'arrow'. If not then create one
        var arrow;
        if ( !$(".arrow").length ) { viewport.prepend("<div class='arrow'></div>"); }
        arrow = $(".arrow");
        // set unicode arrow symbol to arrow div
        arrow.html("&#x27bb");
        // check if there is a controls DOM
        // If not then create one
        var controls;
        if ( !$(".controls").length ) { viewport.prepend("<div class='controls'></div>"); }
        var controls = $(".controls");
        // check if there is a <nav> DOM indode controls
        var nav;
        if ( !$(".controls > nav").length ) {
            controls.prepend("<nav><ul></ul></nav>");
            $(".carousel img").each(function(n, e) { $(".controls > nav > ul").append("<li></li>"); });
        }
        var nav = $(".controls > nav");
        var navItems = $(".controls > nav > ul > li");
        // check if there is a nav-prev DOM. If not then create one
        var navPrev;
        if ( !$(".controls > .nav-prev").length ) { controls.prepend("<div class='nav-prev'><a class='nav-a'></a></div>"); }    
        var navPrev = $(".controls > .nav-prev");
        var navPrevA = $(".controls > .nav-prev a");
        // check if there is a nav-next DOM. If not then create one
        var navNext;
        if ( !$(".controls > .nav-next").length ) { controls.prepend("<div class='nav-next'><a class='nav-a'></a></div>"); }
        var navNext = $("controls > .nav-next");
        var navNextA = $("controls > .nav-next a");
        //
        var mouseDown = false;
        var dragged = false;
        var mouseDownDragPosition;
        var currentImgFract = 0.0;
        var currentImg = 0;
        var nextOrPrevImgAreaWidth = "25px";
        var moveDirectionAfterMouseDown = 0;
        //
        // Set width to viewport (.carousel) and exclude borders
        viewport.width(viewportWidth);
        // Set heigth to viewport (.carousel)
        if (viewportHeight.indexOf("%") != -1) {
            viewport.height($(window).height() * viewportHeight.replace("%", "") / 100);
        } else {
            viewport.height(viewportHeight);
        }
        // Set widths to scrollable area (.scrollable) and exclude borders    
        //   If image width contains percantage than translate it to px
        if (imageWidth.indexOf("%") != -1) {
            imageWidth = innerWidth(viewport) * imageWidth.replace("%", "") / 100;
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
        viewport.on("dragstart", function (e) { e.preventDefault(); });
        //----Mouse events
        viewport.on("mousedown", carouselMouseDown);
        viewport.on("mouseup", carouselMouseUp);
        viewport.on("mouseleave", function() {
            //console.log("viewport.mouseleave");
            mouseDown = false;
            //RETURN: backToBorders();
        });        
        //----Dragging and scrolling
        viewport.on("mousemove", carouselMouseMove);
        viewport.on("scroll", function(e) { e.preventDefault(); });
        /*viewport.on("scroll", function(e) {
            log("this.scrollWidth: " + this.scrollWidth, 1);
            log("this.offsetWidth: " + this.offsetWidth);
            //this.scrollLeft = 0;
        });*/
        //navPrev.on("mouseup", function(e) { viewport.off("mouseup"); });
        navPrevA.on("click", function(e) { console.log("navPrevA.mouseup"); goTo("prev"); });
        //navNext.on("mouseup", function(e) { viewport.off("mouseup"); });
        navNextA.on("click", function(e) { console.log("navNextA.mouseup"); goTo("next"); });
        navItems.on("click", function(e) {
            console.log("navItems.mouseup");
            goTo($(this).index());
        });
        //----Window resizes
        $(window).on("resize", function() {
            log("resize");
            viewport.width(viewportWidth);
            if (viewportHeight.indexOf("%") != -1) {
                viewport.height($(window).height() * viewportHeight.replace("%", "") / 100);
            } else {
                viewport.height(viewportHeight);
            }
        });

        // Carousel event handlers
        function carouselMouseDown(e) {
            //console.log("viewport.mousedown");
            mouseDown = true;
            if (draggable) { mouseDownDragPosition = e.pageX - left(scrollable); }
        }
        function carouselMouseUp(e) {
            console.log("viewport.mouseup");
            try {
                //TODO: show/hide blended scrollbar
                // Check if arrow is visible then hide it
                if (arrow.css("display") == "table") {
                    arrow.velocity("stop")
                        .velocity({ left: 0, opacity: 0 }, "slow", function (){ arrow.css("display", "none"); });
                }
                // Move scrollable area back to the borders if it was moved
                if (mouseDown && dragged) {
                    console.log("viewport.mouseup.backToBorders()");
                    backToBorders(); /*dragged = false;*/
                }
                mouseDown = false;
                moveDirectionAfterMouseDown = 0;
            } catch(e) {
                console.error("carouselMouseUp" + e);
            }
        }        
        function carouselMouseMove(e) {
            try {                
                // Check if scrollable area has grabbed
                if (mouseDown) {
                    dragged = true;
                    log("viewport.mousemove::drag", 1);
                    log("scrollable.offset().left: " + scrollable.offset().left);
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
                    viewport[0].scrollLeft = left(viewport) - shift;
                    //
                    navPrev.css("left", viewport[0].scrollLeft);
                    navNext.css("right", -viewport[0].scrollLeft);

                    //viewport[0].scrollLeft = scrollShift;

                    //console.log("" + scrollable.offset().left);
                    //console.log(viewport[0].scrollLeft);
                    //viewport.scrollLeft(-shift);

                    // Change scrollbar position
                    //viewport.scrollLeft(left(viewport) - shift);
                    // Check if arrow is not appeared then make it visible
                    if (arrow.css("display") == "none") {
                        arrow.css("display", "table");
                    }
                    var arrowShift = null;
                    var arrowDirection = 0;
                    // Check if scrollable area has crossed the left border then show the arrow
                    console.log("left(scrollable): " + left(scrollable) + ",innerLeft(viewport): " + innerLeft(viewport));
                    if ( innerLeft(viewport) <= left(scrollable)) {
                        console.log("// Check if scrollable area has crossed the left border then show the arrow");
                        //TODO: fix this
                        //scrollable.offset({ left : shift });                        
                        var fontSize = arrow.css('font-size').replace("px","");
                        arrowDirection = 180;
                        arrowShift = left(scrollable) - innerLeft(viewport) - fontSize;
                    }
                    // Check if scrollable area has crossed the right border then show the arrow
                    else if ( right(scrollable) < innerRight(viewport) ) {
                        console.log("// Check if scrollable area has crossed the right border then show the arrow");
                        arrowDirection = 0;
                        arrowShift = right(scrollable) - innerLeft(viewport);
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
                    //RETURN:
                    currentImgFract = (innerLeft(viewport) - shift) / width(img);
                    //RETURN: currentImg = Math.floor(currentImgFract);
                    currentImg = Math.round(viewport.scrollLeft() / width(img));
                    log("currentImgFract: " + currentImgFract, 1);
                    log("currentImg: " + currentImg);
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
                console.error("viewport.mousemove: " + e);
            }
            //log("carouselMouseMove", 1); log("currentImg: " + currentImg); log("currentImgFract: " + currentImgFract);
        }
        // Helper methods
        function afterBackToBorders() {
            try {
                currentImgFract = (innerLeft(viewport) - innerLeft(scrollable)) / width(img);
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
                if ( left(scrollable) > innerLeft(viewport) ) {
                    console.log("backToBorders::outOfTheLeft");
                    // Slide back to the left border
                    scrollable.velocity({ left: 0 }, speed, afterBackToBorders);
                }
                // If scrollable area goes out of the right border
                else if ( right(scrollable) < innerRight(viewport) ) {
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
                        console.log("backToBorders::goTo.next");
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
                        console.log("backToBorders::goTo.prev");
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
            currentImgFract = (innerLeft(viewport) - innerLeft(scrollable)) / width(img);
            currentImg = Math.round(currentImgFract);
            console.log("afterGoTo: currentImg: " + currentImg);
            viewport.on("mouseup", carouselMouseUp);
        }
        function goTo(where, speed) {
            if (where === undefined || where === null) { where = "next"; }
            if (speed === undefined || speed === null) { speed = "fast"; }            
            var pos, scrollPos, scrollOffset = 0;
            if (where == "next") {
                //scrollPos = width(img);// * (currentImg + 1) - (innerLeft(viewport) - left(scrollable));
                var offset = (innerLeft(viewport) - left(scrollable)) % width(img);
                console.log("offset: " + offset);
                scrollOffset = width(img) - offset;                
                //pos = -width(img) * (currentImg + 1);
            } else if (where == "prev") {
                //scrollPos = -width(img);// * (currentImg + 1) - (innerLeft(viewport) - left(scrollable));;
                scrollOffset = -width(img);
                //pos = -width(img) * (currentImg - 1);
            } else if (where == "current") {
                scrollPos = -width(img);
            } else if (parseInt(where) != NaN) {
                scrollPos = where * width(img);
                console.log("scrollPos: " + scrollPos);
            } else { throw "ERROR::goTo::where == " + where; }
            //if scrollable area is not animating
            if (!viewport.hasClass("velocity-animating")) { 
                // if current image is not the first one and the last one
                /*if ((where == "prev" && currentImg > 0) ||
                    (where == "next" && currentImg < imgCount - 1)) {*/
                if (currentImg > 0 || currentImg < imgCount - 1) {
                    console.log("goTo." + where + "(" + speed + ")");
                    console.log("currentImg: " + currentImg);
                    console.log("scrollPos: " + scrollPos);
                    console.log("scrollOffset: " + scrollOffset);
                    /*console.log("scrollable.width(): " + scrollable.width());
                    //viewport[0].scrollLeft += (scrollable.width() / imgCount);
                    console.log("viewport[0].scrollLeft: " + viewport[0].scrollLeft);
                    console.log("pos: " + pos);
                    console.log("scrollable.offset().left: " + scrollable.offset().left);*/
                    //scrollable.offset().left += pos;                    
                    //console.log(img[scrollPos]);
                    //$("#img" + scrollPos)
                    
                    viewport.velocity("scroll", {
                        duration: speed, container: viewport, offset: scrollOffset, axis: "x",
                        complete: afterGoTo, queue: "move"
                    });
                    controls.velocity({
                        left: scrollPos,
                        /*rigth: "+=" + width(img),*/
                    }, speed, "move");
                    viewport.dequeue("move");
                    //scrollable.velocity("stop").velocity({ left : pos }, speed, /*[500, 20],*/ afterGoTo);
                }
            }
        }
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
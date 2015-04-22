/*jslint strict: true, vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

(function( $ ) {
    $.fn.carousel = function(params) {
        // Variables
        // set viewport variable to this
        var viewport = this;
        var scrollable;
        var img,
            imgCount;
        var arrow;
        var controls;
        var nav,
            navItems,
            navPrev,
            navPrevA,
            navNext,
            navNextA;
        var mouseDown,
            mouseDownDragPosition,
            currentImgFract,
            currentImg,
            nextOrPrevImgAreaWidth,
            moveDirectionAfterMouseDown,
            interv;
        // Properties
        var viewportWidth = params.width,
            viewportHeight = params.height,
            imageWidth = params.imageWidth,
            draggable = params.draggable,            
            cyclic = params.cyclic,
            timer = params.timer;
        // Initialize carousel
        init();
        //--Carousel event attaching
        //----Prevent dragging        
        viewport.on("dragstart", function (e) { e.preventDefault(); });
        //----Mouse events
        viewport.on("mousedown", carouselMouseDown);
        viewport.on("mouseup", carouselMouseUp);
        viewport.on("mousemove", carouselMouseMove);
        viewport.on("mouseleave", function() { /*log("viewport.mouseleave");*/ mouseDown = false; backToBorders(); });
        //----Enable/Disable viewport mouse down/up events while on top of controls
        navItems.on("mouseenter", function(){viewport.off("mousedown mouseup");});
        navItems.on("mouseleave", function(){viewport.on("mousedown", carouselMouseDown); viewport.on("mouseup", carouselMouseUp);});
        navPrevA.on("mouseenter", function(){viewport.off("mousedown mouseup");});
        navPrevA.on("mouseleave", function(){viewport.on("mousedown", carouselMouseDown); viewport.on("mouseup", carouselMouseUp);});
        navNextA.on("mouseenter", function(){viewport.off("mousedown mouseup");});
        navNextA.on("mouseleave", function(){viewport.on("mousedown", carouselMouseDown); viewport.on("mouseup", carouselMouseUp);});        
        //----Controls clicking events
        navItems.on("click", function(e) { /*log("navItems.click");*/ goTo($(this).index()); });
        navPrevA.on("click", function(e) { /*log("navPrevA.click");*/ goTo("prev"); });
        navNextA.on("click", function(e) { /*log("navNextA.click");*/ goTo("next"); });
        //----Window resizes
        //TODO: fix some issues
        $(window).on("resize", function() {
            log("window.resize");
            viewport.width(viewportWidth);
            if (viewportHeight.indexOf("%") != -1) {
                viewport.height($(window).height() * viewportHeight.replace("%", "") / 100);
            } else {
                viewport.height(viewportHeight);
            }
        });
        //check if timer is not 0
        if (timer > 0) { interv = setInterval(function() { goTo("next"); }, timer); }

        //Initialization
        function init() {
            // Default values for properties
            if (viewportWidth === undefined || viewportWidth === null) { viewportWidth = "100%"; }
            if (viewportHeight === undefined || viewportHeight === null) { viewportHeight = 200; }
            if (imageWidth === undefined || imageWidth === null) { imageWidth = "100%"; }
            if (draggable === undefined || draggable === null) { draggable = false; }
            if (cyclic === undefined || cyclic === null) { cyclic = false; }
            if (timer === undefined || timer === null) { timer = 0; }
            // Default values for variables
            mouseDown = false;
            mouseDownDragPosition;
            currentImgFract = 0.0;
            currentImg = 0;
            nextOrPrevImgAreaWidth = "25px";
            moveDirectionAfterMouseDown = 0;
            //check if viewport has a class. If not add a style to a viewport
            if (!viewport.hasClass("carousel")) { viewport.addClass("carousel"); }
            img = viewport.find("img");
            //check if there is an element with a class 'scrollable'. If not then create one and fill it with images
            if ( !viewport.has(".scrollable").length ) {
                viewport.append("<div class='scrollable'></div>");
                img.each(function(number, element) { viewport.find(".scrollable").append(element); });
            }
            scrollable = viewport.find(".scrollable");
            imgCount = img.length;
            //check if there is an element with a class 'arrow'. If not then create one
            if ( !viewport.has(".arrow").length ) { viewport.prepend("<div class='arrow'></div>"); }
            arrow = viewport.find(".arrow");
            // check if there is a controls DOM. If not then create one
            if ( !viewport.find(".controls").length ) { viewport.prepend("<div class='controls'></div>"); }
            controls = viewport.find(".controls");
            // check if there is a <nav> DOM indode controls            
            if ( !controls.find("nav").length ) {
                controls.prepend("<nav><ul></ul></nav>");
                //$(".carousel img").each(function(n, e) { $(".controls > nav > ul").append("<li></li>"); });
                img.each(function(n, e) {
                    if(n == 0) { controls.find("nav > ul").append("<li class='current'></li>"); }
                    else { controls.find("nav > ul").append("<li></li>"); }
                });
            }
            nav = controls.find("nav");
            navItems = nav.find("ul > li");            
            // check if there is a nav-prev DOM. If not then create one
            if (!controls.find(".nav-prev").length) { controls.prepend("<div class='nav-prev'><a class='nav-a'></a></div>"); }
            navPrev = controls.find(".nav-prev");
            navPrevA = navPrev.find("a");
            // check if there is a nav-next DOM. If not then create one
            if (!controls.find(".nav-next").length) { controls.prepend("<div class='nav-next'><a class='nav-a'></a></div>"); }
            navNext = controls.find(".nav-next");
            navNextA = navNext.find("a");
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
        }
        // Carousel event handlers
        function carouselMouseDown(e) {
            /*log("viewport.mousedown");*/
            mouseDown = true;            
            if (draggable) { mouseDownDragPosition = e.pageX - left(scrollable); }
            // pause caousel rotation
            //clearInterval(interv);
        }
        function carouselMouseUp(e) {
            /*log("viewport.mouseup");*/
            try {
                // Check if arrow is visible then hide it
                if (arrow.css("display") == "table") {
                    arrow.velocity({left: 0, opacity: 0}, "slow", function(){ arrow.css("display", "none"); });
                    navPrev.velocity({left : 0}, 100);
                    navNext.velocity({right : 0}, 100);
                }
                // Move scrollable area back to the borders if it was moved
                if (mouseDown) { backToBorders(); }
                mouseDown = false;
                moveDirectionAfterMouseDown = 0;
                // unpause carousel rotation
                //interv = setInterval(function() { goTo("next"); }, timer);
            } catch(e) {
                console.error("carouselMouseUp" + e);
            }
        }        
        function carouselMouseMove(e) {
            try {                
                // Check if scrollable area has grabbed
                if (draggable && mouseDown) {
                    /*log("viewport.mousemove::drag", 1);*/
                    moveDirectionAfterMouseDown = e.pageX - left(scrollable) - mouseDownDragPosition;
                    if (moveDirectionAfterMouseDown < 0) { moveDirectionAfterMouseDown = -1; }
                    else if (moveDirectionAfterMouseDown > 0) { moveDirectionAfterMouseDown = 1; }
                    else { moveDirectionAfterMouseDown = 0; }
                    // Calculate a shift from the position where the mouse was pressed
                    var shift = e.pageX - mouseDownDragPosition;
                    // Drag scrollable area
                    scrollable.offset({ left : shift });
                    // Check if arrow is not appeared then make it visible
                    if (arrow.css("display") == "none") {
                        arrow.css("display", "table");
                    }
                    var arrowShift = null;
                    var arrowDirection = 0;
                    // Check if scrollable area has crossed the left border then show the arrow
                    if ( innerLeft(viewport) <= left(scrollable)) {
                        var fontSize = arrow.css('font-size').replace("px","");
                        arrowDirection = 180;
                        arrowShift = left(scrollable) - innerLeft(viewport) - fontSize;
                        // Hide nav-prev DOM
                        if (!navPrev.hasClass("velocity-animating"))
                            navPrev.velocity({left : -width(navPrev) }, 100);
                    }
                    // Check if scrollable area has crossed the right border then show the arrow
                    else if ( right(scrollable) < innerRight(viewport) ) {
                        arrowDirection = 0;
                        arrowShift = right(scrollable) - innerLeft(viewport);
                        // Hide nav-next DOM
                        if (!navNext.hasClass("velocity-animating"))
                            navNext.velocity({right : -width(navPrev) }, 100);
                    }
                    if (arrowShift != null) {                        
                        //Change left property of the arrow while moving the scrollable area
                        arrow.css("left", arrowShift);
                        // if the arrow is not animating then animate it to show
                        if (!arrow.hasClass("velocity-animating") && arrow.css("opacity") < 1) {
                            arrow.velocity({ rotateY: arrowDirection + "deg" }, 0).velocity({ opacity: 1 }, "slow");
                        }
                    }
                    // Change currentImg
                    currentImgFract = (innerLeft(viewport) - innerLeft(scrollable)) / width(img);
                    /*log("currentImgFract: " + currentImgFract);
                    log("currentImg: " + currentImg);*/
                    //TODO: make it cyclic
                    //Check if a carousel is cyclic
                    if (cyclic) {
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
        }
        // Helper methods
        function backToBorders(speed) {
            try {
                if (speed === undefined || speed === null) { speed = "fast"; }
                var nextOrPrevImgAreaWidthPercentage = 0.05;
                var currentImgViwportPosition = currentImgFract - currentImg;
                // If scrollable area goes out of the left border
                if ( left(scrollable) > innerLeft(viewport) ) {
                    /*log("backToBorders::outOfTheLeft");*/
                    // Slide back to the first image
                    goTo(0);
                }
                // If scrollable area goes out of the right border
                else if ( right(scrollable) < innerRight(viewport) ) {
                    /*log("backToBorders::outOfTheRight");*/
                    // Slide back to the last image
                    goTo(imgCount - 1);
                }
                // If scrollable area crosses the inner border between images
                // If scrollable area goes to the left direction
                else if (moveDirectionAfterMouseDown == -1) {
                    if (currentImgViwportPosition >= nextOrPrevImgAreaWidthPercentage) {
                        /*log("backToBorders::goTo.next");*/
                        // Slide to the next image
                        goTo("next", speed);
                    }
                    if (currentImgViwportPosition < nextOrPrevImgAreaWidthPercentage) {
                        /*log("backToBorders::StayAtTheCurrentImage");*/
                        // Back to current image border
                        goTo("current", speed);
                    }
                }
                // If scrollable area goes to the right direction
                else if (moveDirectionAfterMouseDown == 1) {
                    if (currentImgViwportPosition <= (1 - nextOrPrevImgAreaWidthPercentage)) {
                        /*log("backToBorders::goTo.prev");*/
                        // Slide to the previous image
                        goTo("prev", speed);
                    }
                    if (currentImgViwportPosition > (1 - nextOrPrevImgAreaWidthPercentage)) {
                        /*log("backToBorders::StayAtTheCurrentImage");*/
                        // Back to current image border
                        goTo("current", speed);
                    }
                }
            } catch(e) {
                console.error("backToBorders: " + e);
            }
        }
        function setCurrentImage() {
            currentImgFract = (innerLeft(viewport) - innerLeft(scrollable)) / width(img);
            currentImg = Math.round(currentImgFract);
            /*log("setCurrentImage::currentImg: " + currentImg);*/
        }
        function goTo(where, speed) {
            if (where === undefined || where === null) { where = "next"; }
            if (speed === undefined || speed === null) { speed = "fast"; }
            /*log("goTo(" + where + "), speed = " + speed);*/
            var scrollablePos = 0;
            // set where to a concrete image index
            if (where == "next") { where = currentImg + 1; }
            else if (where == "prev") { where = currentImg - 1; }
            else if (where == "current") { where = currentImg; }
            // if "where" is a number
            if (parseInt(where) != NaN) {
                // if where is less than 0 then "where" = 0
                if (where < 0) {
                    //if cyclic then make an arrangement
                    cyclic ? (where = imgCount - 1) : (where = 0);
                }
                // if where is greater than (imgCount - 1) then "where" = (imgCount - 1)
                if (where > (imgCount - 1)) {
                    //if cyclic then make an arrangement
                    cyclic ? (where = 0) : (where = (imgCount - 1));
                }
                scrollablePos = -width(img) * where;
            }
            // else we have a wrong "where" argument
            else { throw "ERROR::goTo::where == " + where; }
            //if scrollable area is not animating
            if (!viewport.hasClass("velocity-animating")) {
                // move scrollable area to "where" image
                navItems.each(function(n,e){ if($(e).hasClass("current")) { $(e).removeClass("current"); } });
                $(navItems[where]).addClass("current");
                scrollable.velocity({ left: scrollablePos }, speed, /*[500, 20], */setCurrentImage);
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
$(function() {
    var bdgContainer = $(".badge-container"),
        bdgs = $(".badge"),
        sections = $("section");
    var defaultInterval = 1000,
        defaultAnimDuration = "slow",
        defaultAnimDelay = 1000;
    //variable that described count of squares in a row
    var $tCountInARow = 50;
    //variable indicates triagle size
    var $tSize = 0;
    //get a random number
    function rnd(from, to) { return from + Math.floor(Math.random() * (to + 1)); }
    //get a random color
    var backgroundColors = ["#FCFFF5", "#D1DBBD", "#91AA9D", "#3E606F", "#193441"];
    function rndColor(){ return "rgb(" + rnd(0, 255) + ", " + rnd(0, 255) + ", " + rnd(0, 255) + ")"; }
    function rndBgndColor(){ return backgroundColors[rnd(0,4)]; }
    function rgbToHex(r,g,b) { return "#" + r.toString(16) + g.toString(16) + b.toString(16); }
    //animate a background with triangles
    var trianglesHaveBeenAnimated = false;
    // draw a squares on canvas
    function drawSquare(obj, p1, colors, alpha) {
        // p1----p2
        // |--p5--|
        // p4----p3
        var p2 = { x: p1.x + $tSize, y: p1.y },
            p3 = { x: p1.x + $tSize, y: p1.y + $tSize },
            p4 = { x: p1.x, y: p1.y + $tSize },
            p5 = { x: p1.x + $tSize / 2, y: p1.y + $tSize / 2 };
        if (colors === undefined || colors.length != 4) {
            colors = [rndBgndColor(),
                      rndBgndColor(),
                      rndBgndColor(),
                      rndBgndColor()];
        }
        //get objects drawing context
        var c2d = $("canvas")[0].getContext('2d');
        if (c2d === null || c2d === undefined || c2d.length == 0)
            return;
        if (alpha != undefined)
            c2d.globalAlpha = alpha;
        //top triangle
        c2d.beginPath();
        c2d.moveTo(p1.x, p1.y);
        c2d.lineTo(p2.x, p2.y);
        c2d.lineTo(p5.x, p5.y);
        c2d.closePath();
        c2d.fillStyle = colors[0];
        c2d.fill();
        //right triangle
        c2d.beginPath();
        c2d.moveTo(p2.x, p2.y);
        c2d.lineTo(p3.x, p3.y);
        c2d.lineTo(p5.x, p5.y);
        c2d.closePath();
        c2d.fillStyle = colors[1];
        c2d.fill();
        //bottom triangle
        c2d.beginPath();
        c2d.moveTo(p3.x, p3.y);
        c2d.lineTo(p4.x, p4.y);
        c2d.lineTo(p5.x, p5.y);
        c2d.closePath();
        c2d.fillStyle = colors[2];
        c2d.fill();
        //left triangle
        c2d.beginPath();
        c2d.moveTo(p4.x, p4.y);
        c2d.lineTo(p1.x, p1.y);
        c2d.lineTo(p5.x, p5.y);
        c2d.closePath();
        c2d.fillStyle = colors[3];
        c2d.fill();
    }
    // animate (popping) a square before drawing it
    function popSquare(obj, i, j) {
        //animation parameter variables
        var duration = "slow",//2000,
            queue = obj.attr("id"),
            sizeMultiplier = 1.2;
        //get objects drawing context
        var c2d = $("canvas")[0].getContext('2d');
        if (c2d === null || c2d === undefined || c2d.length == 0)
            return;
        var x = i * $tSize,
            y = j * $tSize;
        var c1 = c2d.getImageData(x + $tSize / 2, y + $tSize / 4, 1, 1).data,
            c2 = c2d.getImageData(x + $tSize*0.75, y + $tSize/2, 1, 1).data,
            c3 = c2d.getImageData(x + $tSize/2, y + $tSize*0.75, 1, 1).data,
            c4 = c2d.getImageData(x + $tSize*0.25, y + $tSize/2, 1, 1).data;
        c1 = rgbToHex(c1[0], c1[1], c1[2]);
        c2 = rgbToHex(c2[0], c2[1], c2[2]);
        c3 = rgbToHex(c3[0], c3[1], c3[2]);
        c4 = rgbToHex(c4[0], c4[1], c4[2]);
        var newTSize = sizeMultiplier * $tSize,
            cX = x - (newTSize - $tSize) / 2,
            cY = y - (newTSize - $tSize) / 2;
        obj.velocity({
            borderWidth: newTSize / 2,
            left: cX,
            top: cY,
            opacity: 1
        }, {
            duration: duration,
            easing: "easeOut",
            queue: queue,
            begin: function() {                
                obj.css({
                    left: x,
                    top: y,
                    borderStyle: "solid",
                    borderWidth: $tSize / 2,
                    borderTopColor: c1,
                    borderRightColor: c2,
                    borderBottomColor: c3,
                    borderLeftColor: c4,
                    opacity: 0
                });
            },
            complete: function() {
                //obj.css("opacity", 0);
                drawSquare(obj, {x: x, y: y}, [c1, c2, c3, c4], 1);        
            }
        });
        obj.velocity({
            borderWidth: $tSize / 2,
            left: x,
            top: y,
            //opacity: 0
        }, {
            duration: duration,
            easing: "easeOut",
            queue: queue
        });
        obj.dequeue(queue);
    }
    // draw field of square on canvas
    function drawFielOfSquares(obj, rows, columns) {
        for (var i = 0; i < rows; i++)
            for (var j = 0; j < columns; j++)
                drawSquare(obj, { x: j * $tSize, y: i * $tSize }, [], 0.2);
    }

    function drawPopingSquares(obj, rows, columns) {
        //var popSquareDivCount = rows * columns / 10;
        var popSquareDivCount = 5;
        for (var id = 0; id < popSquareDivCount; id++) {
            $("div.canvas").append("<div class='popSquare' id='ps" + id +"'></div>");
        }
        var squares = [];
        for (var i = 0; i < rows * columns; i++)
            squares[i] = i;
        //console.log("drawPopingSquares(r, c): {" + rows + ", " + columns + "}");
        while (squares.length != 0) {
            for (var id = 0; id < popSquareDivCount; id++) {
                var popSquareDiv = $("#ps" + id);
                var posInSquares = rnd(0, squares.length - 1);
                var pos = squares[posInSquares];
                var j = Math.floor(pos / columns),
                    i = pos - (j * columns);
                squares.splice(posInSquares, 1);
                popSquare(popSquareDiv, i, j);
                //console.log("drawPopingSquares: i_j = " + i + " " + j);
            }            
        }
        for (var id = 0; id < popSquareDivCount; id++) 
            $("#ps" + id).dequeue("ps");
        //$("#ps" + id).dequeue("ps" + id);
        /*var popSquareDiv = $("#ps0");
        popSquare(popSquareDiv, 0, 0);
        popSquare(popSquareDiv, 1, 1);
        popSquare(popSquareDiv, 2, 2);
        $("#ps0").dequeue("ps0");*/
    }
    function animateBackground() {
        //create field of triangles on canvas
        $("html").prepend("<div class='canvas'>");
        $("div.canvas").append("<canvas>");
        $c2d = $("canvas")[0].getContext('2d');
        //set canvas width
        if ($c2d != null) {
            //set canvas width to fit screen
            var ratio = window.devicePixelRatio || 1;
            var screenWidth = screen.width * ratio;
            var screenHeight = screen.height * ratio;
            $c2d.canvas.width = screenWidth;
            $c2d.canvas.height = screenHeight;
            console.log("screen: {" + screen.width + ", " + screen.height + "} (ratio:" + ratio + ")");
            //set square size
            $tSize = $c2d.canvas.width / $tCountInARow;
            var tRows = Math.ceil($("body").height() / $tSize);
            // draw field of squares on canvas
            drawFielOfSquares($("canvas"), tRows, $tCountInARow);
            drawPopingSquares($("canvas"), tRows, $tCountInARow);
        }
    }
    function animateSection(s) {
        s.velocity({ opacity: 1 }, {
            duration: defaultAnimDuration,
            complete: function() { animateSection(s.next()); }
        });
    }
    function introAnimation() {
        //animate triangles
        animateBackground(trianglesHaveBeenAnimated);
        return;
        //wait until triangles have been animated
        trianglesHaveBeenAnimated = true;
        var int = setInterval(function() {
            if (trianglesHaveBeenAnimated) {
                //hide sections and set teir entry 'width'
                sections.each(function(n,e) {
                    $(this).css("opacity", 0);
                    //$(this).css("width", $("body").width());
                });
                //make body visible
                $("body").css("display", "");
                //animate all the sections
                animateSection(sections.first());
                clearInterval(int);
                //console.log("introAnimation: body height = " + $("body").height());
            }
        }, defaultInterval);
    }

    $(window).load(function() {
        console.log("window.load()");
        //Intro animations
        introAnimation();
        resize();
    }); //Window OnLoad event
    $(window).on("resize", resize); //Window Resize event
    $("html").on("resize", resize);
    //Badge mouse enter
    var imgSize = Math.sin(Math.PI / 4) * 100;
    bdgs.on("mouseenter", function(e) {
        //console.log("bdgs.mouseenter");
        var background = $(this).find(".background"),
            img = $(this).find("img"),
            text = $(this).find("span").parent();
        //$(this).css("position", "absolute");
        //$(this).velocity({ left : "90"}, 5000);
        if (!img.hasClass("velocity-animating")) {
            //img.css("margin", "0");
            //img.css("position", "absolute");
            background.velocity({ blur: 0 }, "fast");
            img.velocity({ width: "100%", height : "100%", opacity: 0 }, "fast");
            if (img.length != 0) {
                text.velocity({ opacity: 0 }, "fast");
            } else {
                text.velocity({
                    width: $(this).width(),
                    height: $(this).height()
                }, {
                    duration: "fast",
                    progress: function() { text.textfill({maxFontPixels : 1000}); } });
            }
        } else {
            img.velocity("stop");
            text.velocity("stop");
        }
    });
    bdgs.on("mouseleave", function(e) {
        //console.log("bdgs.mouseleave");
        var background = $(this).find(".background"),
            img = $(this).find("img"),
            text = $(this).find("span").parent();
        background.velocity("stop");
        img.velocity("stop");
        text.velocity("stop");
        background.velocity({ blur: "8px" }, "fast");
        img.velocity({ width: imgSize + "%", height : imgSize + "%", opacity: 1 }, "fast");
        if (img.length != 0) {
            text.velocity({ opacity: 1 }, "fast");
        } else {
            text.velocity({
                width: "100%",
                height: "100%"
            }, {
                duration: "fast",
                progress: function() { text.textfill({maxFontPixels : 1000}); } });
        }
    });
    //Window Resize event handler
    function resize(){
        return;
        console.log("window.resize()");
        //Badge font size calculation
        //bdgs.width("10px");
        //bdgs.height(bdgs.width());
        //bdgContainer
        //bdgs.css("margin", "30px");
        console.log("resize: body height = " + $("body").height());
        //
        bdgs.each(function(n,e){
            var inner = $(this).find(".inner");
            var innerDiv = inner.find("div");
            var img = inner.find("img");
            var spanTextHeight = inner.innerHeight() - img.outerHeight();
            var spans = inner.find("span");
            var height = spanTextHeight / spans.length + "px";
            innerDiv.css("width", inner.innerWidth());
            innerDiv.css("height", height);
            innerDiv.textfill();
        });
    }
});
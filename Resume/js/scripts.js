$(function(){
    var bdgCont = $(".badge-container"),
        bdgs = $(".badge");
    resize();
    //console.log($bdgs);
    //bdgs.velocity({ rotateZ : 360 }, "slow").velocity({ rotateZ : 0 }, 0);
    bdgCont.css("height", bdgCont.height());
    //bdgs.css("position", "absolute");
    //bdgs.css("left", bdgCont.width() / 2 - bdgs.width() / 2);
    //bdgs.css("top", bdgCont.height() / 2 - bdgs.height() / 2);
    //
    $(window).on("resize", resize); 
    bdgs.on("mouseenter", function(e){
        bdgCont.css("height", bdgCont.height());
        //$(this).css("position", "absolute");
        //$(this).velocity({ left : "90"}, 5000);
        if (!$(this).hasClass("velocity-animating"))
            $(this).velocity({ rotateZ : 360 }, "slow").velocity({ rotateZ : 0 }, 0, function(){
                $(this).removeClass("hover");
            });
    });
    bdgs.on("mouseleave", function(e){
        bdgCont.removeAttr( 'style' );
        //$(this).velocity("stop");
    });
    //Intro animations
    //$("#heading").css("opacity", 0);
    /*$("#heading")
        .velocity({ opacity: 1 }, "slow")
        .velocity({ position: relative, left: 1000, width: "50%" }, 5000);*/
    
    function resize(){
        //Badge font size calculation
        //console.log($bdgs);
        bdgs.each(function(n,e){
            //console.log(this);
            var inner = $(this).find(".inner");
            var img = inner.find("img");
            var spanTextHeight = inner.height() - img.height();
            var spans = inner.find("span");
            //console.log(spanTextHeight / spans.length + "px");
            spans.css("font-size", spanTextHeight / spans.length + "px");
            spans.css("line-height", spanTextHeight / spans.length + "px");
            //$("span").each(function(n,e){
            //$(e).addClass("hover").delay(2000).removeClass("hover");
            //});
        });
    }
});
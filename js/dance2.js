var elements = [];
var bodies = [];
var properties = [];
var world;
var worldAABB;
var stage = [];
var mouseOnClick = [];
var edgeBounce;
var iterations = 10;
var timeStep = 1000 / 10000;
var constraints;
var isMouseDown = false;
var mouseJoint;
var mouse = {
    x: 0,
    y: 0
};
var tilecolors = ["#5c8afc", "#3bc445", "#ba77f5", "#ff9933"];
var currentsecond = 0;
var timerthread = false;
var synonyms = [];
var nextid = 0;
var renderer;
var maxquantity = 70;
var step = 0,
    radius = 200,
    speed = 1;
var isPaused = true;
var maxwordcounts = 10;
var ismagnet = false;
var createnewword = true;
var attractorbehaviorbodies = [];
$(document).ready(function() {
    $(".inputkeyword").val("");
    if ($(window).width() < 600) {

        maxquantity = 20;
    }

    $("#dance-floor").height($(window).height() - $("#dance-floor").offset().top - 20);
    $(".dance-btn").height($(".dance-btn").width());



    $("#dance-floor").css("width", "100%");

    if ($("#dance-floor").width() < $("#dance-floor").height()) {

        $("#dance-floor").height($("#dance-floor").width());
    }



    $('.panel-collapse').on('show.bs.collapse', function() {
        $(this).siblings('.panel-heading').addClass('active').find("a");
        $("#headingOne").find('a').text("Hide Input Panel");

    });

    $('.panel-collapse').on('hide.bs.collapse', function() {
        $(this).siblings('.panel-heading').removeClass('active');
        $("#headingOne").find('a').text("Show Input Panel");
    });




    $("#pausebutton").click(function() {
        world.pause();


    });
    $("#playbutton").click(function() {
        world.unpause();

    });



    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    document.addEventListener('keyup', onDocumentKeyUp, false);


    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);
    document.addEventListener('touchend', onDocumentTouchEnd, false);

    window.addEventListener('deviceorientation', onWindowDeviceOrientation, false);
    window.addEventListener('blur', function() {

        isPaused = true;

    }, true);

    window.addEventListener('focus', function() {

        isPaused = false;

    }, true);




    window.addEventListener('resize', function() {

        if ($(window).height() >= 800) {
            //  $("#dance-floor").css("width","100%");
            //   $("#dance-floor").css("height",$("#dance-floor").css("width"));
            $(".dance-btn").height($(".dance-btn").width());
            $("#dance-floor").height($(window).height() - $("#dance-floor").offset().top - 20);

            $("#dance-floor").css("width", "100%");

            if ($("#dance-floor").width() < $("#dance-floor").height()) {

                $("#dance-floor").height($("#dance-floor").width());
            }
        }

    }, true);




    // Physics.util.ticker.subscribe( loop );


    // start the ticker




});

function magnet_effect() {


    for (var k = 0; k < attractorbehaviorbodies.length; k++) {

        world.removeBehavior(attractorbehaviorbodies[k]);
    }
    attractorbehaviorbodies = [];

    try {
        var tempbodies = world.getBodies();

        var words1 = tempbodies.filter(function(a) {
            return a["wordtype"] == 0;
        });
        var words2 = tempbodies.filter(function(a) {
            return a["wordtype"] == 1;
        });
        var words3 = tempbodies.filter(function(a) {
            return a["wordtype"] == 2;
        });
        var words4 = tempbodies.filter(function(a) {
            return a["wordtype"] == 3;
        });



        var attractorbehavior1 = Physics.behavior('attractor', {
            pos: mouse,
            order: 0,
            strength: 1
        }).applyTo(words1);
        var attractorbehavior2 = Physics.behavior('attractor', {
            pos: mouse,
            order: 0,
            strength: 1
        }).applyTo(words2);
        var attractorbehavior3 = Physics.behavior('attractor', {
            pos: mouse,
            order: 0,
            strength: 1
        }).applyTo(words3);
        var attractorbehavior4 = Physics.behavior('attractor', {
            pos: mouse,
            order: 0,
            strength: 1
        }).applyTo(words4);



        attractorbehaviorbodies.push(attractorbehavior1);
        attractorbehaviorbodies.push(attractorbehavior2);
        attractorbehaviorbodies.push(attractorbehavior3);
        attractorbehaviorbodies.push(attractorbehavior4);

        world.add(attractorbehaviorbodies[0]);
        world.add(attractorbehaviorbodies[1]);
        world.add(attractorbehaviorbodies[2]);
        world.add(attractorbehaviorbodies[3]);

    } catch (ex) {
        console.log(ex);
    }


}

function initworld() {

    stage = [0, 0, $("#dance-floor").width(), $("#dance-floor").height()];
    worldAABB = Physics.aabb.apply(null, stage);


    world = Physics({
        timestep: timeStep + (speed / 500),
        maxIPF: iterations
    });


    var viewWidth = $("#dance-floor").width();
    var viewHeight = $("#dance-floor").height();




    renderer = Physics.renderer('dom', {
        el: document.getElementById('dance-floor'),
        width: viewWidth,
        height: viewHeight,
    });


    world.add(renderer);


    edgeBounce =

        Physics.behavior('edge-collision-detection', {
            aabb: worldAABB,
            restitution: 1,
            cof: 0
        })


    world.add(edgeBounce);

    world.add(Physics.behavior('body-collision-detection', {
        checkAll: true
    }));
    world.add(Physics.behavior('sweep-prune'));
    world.add(Physics.behavior('body-impulse-response'), {
        mtvThreshold: 0,
        bodyExtractDropoff: 0,
        forceWakeupAboveOverlapThreshold: false
    });
    world.add(Physics.behavior('interactive', {
        el: renderer.el
    }));




    world.on('step', function() {


        if (getBrowserDimensions()) {
            setWalls();
        }




        if (!world.isPaused()) {
            world.render();
        }




    });

    Physics.util.ticker.on(function(time, dt) {




        world.step(time);

        // only render if not paused



    });


    Physics.util.ticker.start();

}

function create_physics_body(i, wordtype) {



    var element = document.getElementById("physics-" + i);

    properties[i] = getElementProperties(element);




    element.style.position = 'absolute';
    element.style.left = (-properties[i][2] / 2) + 'px'; // will be set by renderer
    element.style.top = (-properties[i][3] / 2) + 'px';

    //	element.style.left = ( - 10) + 'px'; // will be set by renderer
    //	element.style.top = ( - 10) + 'px';

    //	element.style.width = properties[i][2] + 'px';
    element.addEventListener('mousedown', onElementMouseDown, false);
    element.addEventListener('mouseup', onElementMouseUp, false);
    element.addEventListener('click', onElementClick, false);




    var xposition = stage[2] / 1.5;
    var yposition = 0;
    var xdirection = 1;
    var ydirection = 1;
    if (wordtype == 0) {
        xposition = stage[2] / 1.5;
        yposition = 0;
        xdirection = 1;
        ydirection = 1;
    }
    if (wordtype == 1) {
        xposition = stage[2];
        yposition = stage[3] / 1.5;
        xdirection = -1;
        ydirection = 1;
    } else if (wordtype == 2) {
        xposition = stage[2] / 1.5;
        yposition = stage[3];
        xdirection = -1;
        ydirection = -1;
    } else if (wordtype == 3) {
        xposition = 0;
        yposition = stage[3] / 1.5;
        xdirection = 1;
        ydirection = -1;
    }



    var word = Physics.body('rectangle', {
        x: xposition, //properties[i][0] + properties[i][2]/2,
        y: yposition, // properties[i][1] + properties[i][3]/2,
        vx: xdirection,
        vy: ydirection,
        "wordtype": wordtype,
        width: properties[i][2],
        height: properties[i][3]

    });




    word.view = element;

    bodies.push(word);

    world.add(word);




}


function onDocumentMouseDown(event) {

    isMouseDown = true;

}

function onDocumentMouseUp(event) {

    isMouseDown = false;

}

function onDocumentMouseMove(event) {



    mouse.x = event.clientX;
    mouse.y = event.clientY;

    if (ismagnet) {
        try {
            for (var i = 0; i < attractorbehaviorbodies.length; i++) {

                attractorbehaviorbodies[i].position(mouse);

            }
        } catch (ex) {}

    }

}

function onDocumentKeyUp(event) {

    if (event.keyCode == 13) search();

}

function onDocumentTouchStart(event) {

    if (event.touches.length == 1) {


        mouse.x = event.touches[0].pageX;
        mouse.y = event.touches[0].pageY;
        isMouseDown = true;
    }
}

function onDocumentTouchMove(event) {

    if (event.touches.length == 1) {

        event.preventDefault();

        mouse.x = event.touches[0].pageX;
        mouse.y = event.touches[0].pageY;


        if (ismagnet) {
            try {
                for (var i = 0; i < attractorbehaviorbodies.length; i++) {

                    attractorbehaviorbodies[i].position(mouse);

                }
            } catch (ex) {}

        }


    }

}

function onDocumentTouchEnd(event) {

    if (event.touches.length == 0) {

        isMouseDown = false;
    }

}

function onWindowDeviceOrientation(event) {



}

function mouseDrag() {

    // mouse press
    if (isMouseDown && !mouseJoint) {

        var body = getBodyAtMouse();

        if (body) {

            var md = Physics.body('point', {
                x: mouse.x,
                y: mouse.y
            });
            mouseJoint = constraints.distanceConstraint(md, body, 0.2);
        }
    }

    // mouse release
    if (!isMouseDown) {

        if (mouseJoint) {

            constraints.remove(mouseJoint);
            mouseJoint = null;
        }
    }

    // mouse move
    if (mouseJoint) {

        mouseJoint.bodyA.state.pos.set(mouse.x, mouse.y);
    }
}




function getBodyAtMouse() {
    var body = world.findOne({
        $at: Physics.vector(mouse.x, mouse.y)
    });
    console.log(body.width + " : " + body.height);
    return body;
}

function getNearestBodyAtMouse(x, y) {

    //	for(var j=mouse.x)

    return world.findOne({
        $at: Physics.vector(x, y)
    });
}

function setWalls() {

    worldAABB = Physics.aabb.apply(null, stage);
    edgeBounce.setAABB(worldAABB);

}

function getElementsByClass(searchClass) {

    var classElements = [];
    var els = document.getElementsByTagName('*');
    var elsLen = els.length

    for (i = 0, j = 0; i < elsLen; i++) {

        var classes = els[i].className.split(' ');
        for (k = 0; k < classes.length; k++)
            if (classes[k] == searchClass)
                classElements[j++] = els[i];
    }

    return classElements;
}

function getElementProperties(element) {

    var x = 0;
    var y = 0;
    var width = element.offsetWidth;
    var height = element.offsetHeight;

    do {

        x += element.offsetLeft;
        y += element.offsetTop;

    } while (element = element.offsetParent);

    return [x, y, width, height];
}



function onElementMouseDown(event) {

    event.preventDefault();

    mouseOnClick[0] = event.clientX;
    mouseOnClick[1] = event.clientY;

}

function onElementMouseUp(event) {

    event.preventDefault();

}

function onElementClick(event) {


    try {
        // var bodyid=parseInt($(event.target).attr("id").toString().replace("physics-","").trim());
        $(event.target).remove();
        console.log(bodies[bodyid]);
        //world.remove(bodies[bodyid]);
        //bodies.splice(bodyid,1);
    } catch (ex) {}




    var range = 5;

    if (mouseOnClick[0] > event.clientX + range || mouseOnClick[0] < event.clientX - range &&
        mouseOnClick[1] > event.clientY + range || mouseOnClick[1] < event.clientY - range) {

        event.preventDefault();

    }


    //	var mousebody=getNearestBodyAtMouse(mouse.x,mouse.y);
    //	console.log(mouse);
    //	console.log(mousebody);




}

function getBrowserDimensions() {




    var changed = false;

    if (stage[0] != $("#dance-floor").position().left) {

        // delta[0] = (window.screenX - stage[0]) * 50;
        stage[0] = 0; //$("#dance-floor").position().left;
        changed = true;
    }

    if (stage[1] != $("#dance-floor").position().top) {

        // delta[1] = (window.screenY - stage[1]) * 50;
        stage[1] = 0; //$("#dance-floor").position().top;
        changed = true;
    }

    if (stage[2] != $("#dance-floor").width()) {

        stage[2] = $("#dance-floor").width();
        changed = true;
    }

    if (stage[3] != $("#dance-floor").height()) {

        stage[3] = $("#dance-floor").height();
        changed = true;
    }


    return changed;
}



$(document).ready(function() {




    $('#ex23').slider({
        formatter: function(value) {
            return value;

        }

    }).on("slide", function(slideEvt) {

        if (slideEvt.value >= 100) {

            speed = 100;
            //jQuery("#speed").val(1);

        } else {
            speed = slideEvt.value;



        }
        try {
            world.timestep(timeStep + (speed / 500));

        } catch (ex) {}



    }).on("slideStop", function(slideEvt) {


        if (!isPaused) {
            try {
                clearInterval(timerthread);
                dance();
                timerthread = setInterval(dance, 3000 - (speed * 28));
            } catch (ex) {}
        }




    });



    $('#ex24').slider({
        max: maxquantity,
        formatter: function(value) {
            return value;

        }

    }).on("slide", function(slideEvt) {

        if (slideEvt.value <= 1) {
            maxwordcounts = 1;
            //jQuery("#speed").val(1);

        } else {
            maxwordcounts = slideEvt.value;
            //jQuery("#speed").val(slideEvt.value);

        }




    });


    $(".motionselection .selected-display").click(function() {
        $(this).parent().find(".no-display").toggle(0);


    });

    $(".motionselection .no-display").click(function() {
        $(this).parent().find(".selected-display").addClass("no-display");
        $(this).parent().find(".selected-display").removeClass("selected-display");
        $(this).removeClass("no-display");
        $(this).addClass("selected-display");
        $(this).parent().find(".no-display").hide();
    });



    $(".inputkeyword").blur(function() {



        if (synonyms.length < 1) {
            $(".dance-btn").hide();
            $(".synonymsstatus").show();

        }

        $.post("/synonym", {
                word1: jQuery("#word1").val(),
                word2: jQuery("#word2").val(),
                word3: jQuery("#word3").val(),
                word4: jQuery("#word4").val()
            })
            .done(function(data) {

                synonyms = [];

                for (var j = 0; j < 4; j++) {
                    var synonymid = "word" + (j + 1);
                    if (data[synonymid + "_synonyms"][1].length > 0) {
                        synonyms.push({
                            "id": $("#word" + (j + 1)).attr("id"),
                            "pattern": 1,
                            "serial": 0,
                            "words": [$("#word" + (j + 1)).val()].concat(data[synonymid + "_synonyms"][1])
                        });


                        $("#word" + (j + 1)).next().hide(); //.css("border","1px solid red");


                        //	synonyms[j]["words"]=synonyms[j]["words"].concat(data[synonymid+"_synonyms"][1]);
                    } else {


                        if ($("#word" + (j + 1)).val() != "") {
                            $("#word" + (j + 1)).next().show(); //.css("border","1px solid red");
                        } else {
                            $("#word" + (j + 1)).next().hide(); //.css("border","1px solid red");
                        }



                    }

                }
                console.log(synonyms);

                $(".synonymsstatus").hide();
                $(".dance-btn").show();

            }).fail(function() {

                $(".synonymsstatus").hide();
                $(".dance-btn").show();
            });


    });

    $("#pauseplaybutton").click(function() {

        if ($(this).hasClass("pausestate")) {
            world.pause();
            //world.warp(.001);
            isPaused = true;
            $(this).removeClass("pausestate");
            $(this).attr("src", "img/dancing/Play.svg");
            $(this).addClass("playstate");

        } else {
            world.unpause();
            isPaused = false;
            $(this).removeClass("playstate");
            $(this).attr("src", "img/dancing/Pause.svg");
            $(this).addClass("pausestate");

        }

    });

    $("#closeanimation").click(function() {
        $(".panel-collapse").collapse("show");
        $(".error").hide();
        isPaused = true;
        world.destroy();

        clearInterval(timerthread);
        timerthread = false;
        //nextId = 0;
        wordData = [];
        globalData = {};
        var maxwordcounts = 10;

        $(".dance-btn").attr("magnet-status", false);
        $("#pauseplaybutton").removeClass("playstate");
        $("#pauseplaybutton").attr("src", "img/dancing/Pause.svg");
        $("#pauseplaybutton").addClass("pausestate");
        $(".dance-btn").find("img").attr("src", "img/dancing/DanceButtonIcon.png").css("margin", "0 0 0 5%");;
        $("#pauseplaybutton").hide();
        createnewword = false;
        $(this).hide();

        $("#dance-floor").html("");
        $("#prompt").show();
        $("#word-entry").show();
        $("#word1").css("border", "");

    });

    $(".inputkeyword").click(function() {

        if ($(window).height() < 600) {

            $('html, body').animate({
                scrollTop: $(this).offset().top - 50
            }, 500);
        }




    });

    $(".dance-btn").click(function() {

        $('html, body').animate({
            scrollTop: $("#dance-floor").offset().top - 100
        }, 500);

        var thisbutton = this;




        if ($("#word1").val().trim() == "" && $("#word2").val().trim() == "" && $("#word3").val().trim() == "" && $("#word4").val().trim() == "") {

            $("#word1").css("border", "1px solid red");
            return;
        }




        if (!timerthread) {


            $.post("/synonym", {
                    word1: jQuery("#word1").val(),
                    word2: jQuery("#word2").val(),
                    word3: jQuery("#word3").val(),
                    word4: jQuery("#word4").val()
                })
                .done(function(data) {

                    synonyms = [];



                    for (var j = 0; j < 4; j++) {
                        var synonymid = "word" + (j + 1);
                        if (data[synonymid + "_synonyms"][1].length > 0) {
                            synonyms.push({
                                "id": $("#word" + (j + 1)).attr("id"),
                                "pattern": 1,
                                "serial": 0,
                                "words": [$("#word" + (j + 1)).val()].concat(data[synonymid + "_synonyms"][1])
                            });

                            $("#word" + (j + 1)).next().hide(); //.css("border","1px solid red");

                        } else {


                            if ($("#word" + (j + 1)).val() != "") {
                                $("#word" + (j + 1)).next().show(); //.css("border","1px solid red");
                            } else {
                                $("#word" + (j + 1)).next().hide(); //.css("border","1px solid red");
                            }



                        }

                    }
                    console.log(synonyms);

                    $(".synonymsstatus").hide();
                    $(".dance-btn").show();




                    if (synonyms.length < 1) {

                        alert("No synonyms are available. Please update words");
                        return;

                    }

                    initworld();

                    $(".panel-collapse").collapse("hide");
                    $("#pauseplaybutton").removeClass("playstate");
                    $("#pauseplaybutton").attr("src", "img/dancing/Pause.svg");
                    $("#pauseplaybutton").addClass("pausestate");
                    $(thisbutton).find("img").attr("src", "img/dancing/magnetPNG.png").css("margin", "8% 0 0 5%");;
                    //nextId = 0;
                    $("#word1").css("border", "");

                    isPaused = false;
                    $("#pauseplaybutton").show();
                    $("#closeanimation").show();
                    createnewword = true;
                    $("#prompt").hide();
                    $("#dance-floor").show();

                    //clear the dance floor
                    // nextId = 0
                    wordData = [];
                    globalData = {};


                    dance();
                    timerthread = setInterval(dance, 3000 - (speed * 28));




                }).fail(function() {
                    $(".synonymsstatus").hide();
                    $(".dance-btn").show();


                });




        } else {
            var magnet_status = ($(thisbutton).attr("magnet-status") === 'true')

            magnet_status = !magnet_status;
            ismagnet = magnet_status;

            $(thisbutton).attr("magnet-status", magnet_status);

            if (magnet_status) {

                $(thisbutton).find("img").attr("src", "img/dancing/DanceButtonIcon.png").css("margin", "0 0 0 5%");
            } else {

                $(thisbutton).find("img").attr("src", "img/dancing/magnetPNG.png").css("margin", "8% 0 0 5%");
            }


            if (ismagnet) {
                $(".nomagnetcontainer").removeClass("nomagnetcontainer").addClass("magnetcontainer");
                magnet_effect();


            } else {
                $(".magnetcontainer").removeClass("magnetcontainer").addClass("nomagnetcontainer");

                for (var k = 0; k < attractorbehaviorbodies.length; k++) {
                    try {
                        world.removeBehavior(attractorbehaviorbodies[k]);
                    } catch (ex) {}
                }
                attractorbehaviorbodies = [];
            }




        }




    });




});

function dance() {

    if (!isPaused) {
        try {
            var synonymkind = parseInt(Math.random() * synonyms.length);
            //var choosesynonym=synonyms[synonymkind]["words"][parseInt(Math.random()*synonyms[synonymkind]["words"].length)];


            var choosesynonym = synonyms[synonymkind]["words"][synonyms[synonymkind]["serial"]++];
            console.log(choosesynonym);




            while (bodies.length > maxwordcounts) {
                world.remove(bodies[0]);
                bodies.splice(0, 1);
            }



            if (choosesynonym != null) {
                $("#dance-floor").append('<span style="background-color:' + tilecolors[synonymkind] + '" class="physics-element" id="physics-' + nextid + '">&nbsp;' + choosesynonym + '&nbsp;</span>');
                var element = document.getElementById("physics-" + nextid);

                var offsets = $("#physics-" + nextid).offset();
                var top = offsets.top;
                var left = offsets.left;


                create_physics_body(nextid, synonymkind);

                nextid++;
                //  console.log("next id: "+nextid);
            }


            if (ismagnet) {
                // console.log("magnet----------");
                magnet_effect();

            }

        } catch (ex) {
            console.log(ex);
            console.log(synonyms);
        }

    }

}
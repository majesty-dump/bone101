/* 
 * Canvas provides the drawing surfaces.
 *
 * Use 'var canvas = Canvas.get();' to fetch the canvas.
 * canvas is an object keyed by the layer names.
 * canvas[layer].e is the layer element.
 * canvas[layer].ctx is the layer context.
 */
var Canvas = (function() {
    var canvas;

    function init() {
        canvas = {};

        var layers = {
            'Base': 'layer1', // canvas with bb and other unchanging elements
            'BTN': 'layer2', // canvas that draws buttons and corresponding elements
            'Active': 'layer3', // active canvas, constantly being cleared and redrawn by UI
            'LED0': 'layer4', // separate canvases for LEDs so they can redraw at different rates
            'LED1': 'layer5',
            'LED2': 'layer6',
            'LED3': 'layer7',
            'Bar': 'layer8', // canvas for slider bars
            'Graph': 'layer9' // canvas for base drawings of graph (axis, labels, etc)
        };

        for (var layer in layers) {
            canvas[layer] = {};
            canvas[layer].e = document.getElementById(layers[layer]);
            canvas[layer].ctx = canvas[layer].e.getContext("2d");
        }

        return (canvas);
    }

    function add(id, zIndex) {
        var canvasdiv = document.getElementById('canvasdiv');
        canvas[id] = {};
        canvas[id].e = document.createElement('canvas');
        canvas[id].e.width = canvas.Base.e.width;
        canvas[id].e.height = canvas.Base.e.height;
        canvas[id].e.style.zIndex = zIndex;
        canvas[id].e.style.left = 0;
        canvas[id].e.style.right = 0;
        canvas[id].e.style.top = 0;
        canvas[id].e.style.bottom = 0;
        canvas[id].e.style.margin = 'auto';
        canvas[id].e.style.position = "absolute";
        canvas[id].ctx = canvas[id].e.getContext("2d");
        canvasdiv.appendChild(canvas[id].e);
    }

    return {
        'get': function() {
            if (!canvas) {
                canvas = init();
            }
            return canvas;
        },
        'add': add
    };
})();

var Hardware = (function() {
    var hw;

    function init() {
        hw = {};
        return hw;
    }

    function add(pin, mode, state) {

    }

    function write(pin, state) {

    }

    return {
        'get': function() {
            if (!hw) {
                hw = init();
            }
            return hw;
        },
        'add': add,
        'write': write
    };
})();

/* 
 * UI provides the user interface drawing and interaction logic.
 * The events are registered, removed and transitioned by Events to help
 * make it clear what events are currently registered and active.
 *
 * Use 'var ui = UI.get();' to fetch the user interface object.
 */
var UI = (function() {
    var ui;

    function init() {
        ui = {};
        var hw = Hardware.get();
        var canvas = Canvas.get();

        // initialize global positions of some elements, all other elements based on these 
        // positions
        var BBposX = 283;
        var BBposY = 120;
        var axisStartY = BBposY + 65;
        var axisStartX = BBposX + 240;
        var rect = {
            x: 0,
            y: BBposY - 70,
            w: canvas.Base.e.width,
            h: 523
        };
        var rectInner = {
            x: rect.x + 20,
            y: rect.y + 15,
            w: 420,
            h: 510
        };
        var snapProbe = {
            x: rect.x + 28,
            y: rect.y + 25
        };
        var graphLinePos = BBposY - 60;

        // mousedown on a button state
        ui.down = false;

        // major buttons
        ui.button = (function() {
            var button = {};

            // global buttons
            var btnX = BBposX - 250;
            var btnY = BBposY - 90;

            var buttons = {
                analog: {
                    x: btnX,
                    y: btnY,
                    endX: btnX + 75,
                    endY: btnY + 15,
                    color: 'rgb(51,153,255)',
                    text: "analog",
                    s: 19,
                    offColor: 'rgb(0,51,102)',
                    article: "an analog pin",
                    graphColors: ['rgb(0,0,255)', 'rgb(0,01,53)', 'rgb(0,102,204)', 'rgb(0,51,102)'],
                    category: "main"
                },
                digital: {
                    x: btnX + 78,
                    y: btnY,
                    endX: btnX + 153,
                    endY: btnY + 15,
                    color: 'rgb(102,204,51)',
                    text: "digital",
                    s: 19,
                    category: "main"
                },
                ground: {
                    x: btnX + 156,
                    y: btnY,
                    endX: btnX + 231,
                    endY: btnY + 15,
                    color: 'rgb(64,64,64)',
                    text: "ground",
                    s: 19,
                    category: "main"
                },
                power: {
                    x: btnX + 234,
                    y: btnY,
                    endX: btnX + 309,
                    endY: btnY + 15,
                    color: 'rgb(255,51,51)',
                    text: "power",
                    s: 19,
                    category: "main"
                },
                led: {
                    x: btnX + 312,
                    y: btnY,
                    endX: btnX + 387,
                    endY: btnY + 15,
                    color: 'rgb(255,153,51)',
                    text: "usr leds",
                    s: 15,
                    offColor: 'rgb(102,0,0)',
                    barColor: 'rgb(255,204,153)',
                    article: "a user led",
                    graphColors: ['rgb(255,128,0)', 'rgb(164,60,0)', 'rgb(255,99,71)', 'rgb(255,69,0)'],
                    category: "main"
                },
                input: {
                    x: btnX + 78,
                    y: btnY + 20,
                    endX: btnX + 153,
                    endY: btnY + 35,
                    color: 'rgb(0,153,0)',
                    text: "input",
                    s: 22,
                    offColor: 'rgb(0,81,36)',
                    article: "a digital pin",
                    graphColors: ['rgb(0,51,0)', 'rgb(0,204,0)', 'rgb(51,102,0)', 'rgb(0,255,0)', 'rgb(128,255,0)'],
                    category: "digital"
                },
                output: {
                    x: btnX + 78,
                    y: btnY + 40,
                    endX: btnX + 153,
                    endY: btnY + 55,
                    color: 'rgb(0,153,153)',
                    text: "output",
                    s: 19,
                    offColor: 'rgb(0,85,85)',
                    barColor: 'rgb(153,255,255)',
                    article: "a digital pin",
                    graphColors: ['rgb(60,179,113)', 'rgb(0,153,153)', 'rgb(0,255,255)', 'rgb(0,102,102)'],
                    category: "digital"
                },
                pwm: {
                    x: btnX + 78,
                    y: btnY + 60,
                    endX: btnX + 153,
                    endY: btnY + 75,
                    color: 'rgb(153,0,153)',
                    text: "pwm",
                    s: 23,
                    offColor: 'rgb(51,0,102)',
                    barColor: 'rgb(229,204,255)',
                    article: "a pwm pin",
                    graphColors: ['rgb(102,0,102)', 'rgb(204,0,204)', 'rgb(255,102,255)', 'rgb(51,0,51)'],
                    category: "digital"
                },
                onOff: {
                    x: snapProbe.x + 85,
                    y: snapProbe.y,
                    endX: snapProbe.x + 135,
                    endY: snapProbe.y + 15,
                    s: 6,
                    e: 28
                },
                plus: {
                    x: axisStartX + 54,
                    y: axisStartY + 240,
                    endX: axisStartX + 66,
                    endY: axisStartY + 252 + 2,
                    text: "+",
                    category: "graph"
                },
                minus: {
                    x: axisStartX + 36,
                    y: axisStartY + 240,
                    endX: axisStartX + 48,
                    endY: axisStartY + 252 + 3,
                    text: "-",
                    category: "graph"
                },
                stop: {
                    x: axisStartX + 18,
                    y: axisStartY + 240,
                    endX: axisStartX + 30,
                    endY: axisStartY + 252,
                    status: "none",
                    text:"stop",
                    category: "graph"
                },
                play: {
                    x: axisStartX,
                    y: axisStartY + 240,
                    endX: axisStartX + 12,
                    endY: axisStartY + 252,
                    status: "none",
                    text: "play",
                    category: "graph"
                },
                exit: {
                    x: canvas.Base.e.width / 2 + 250,
                    y: canvas.Base.e.height / 4 + 13,
                    endX: canvas.Base.e.width / 2 + 258,
                    endY: canvas.Base.e.height / 4 + 25,
                    category: "welcome"
                },
                digitalMenu: {
                    // in the range of the digital buttons, but not on one
                    x: btnX + 78,
                    y: btnY,
                    endX: btnX + 153,
                    endY: btnY + 75,
                    category: "digitalMenu"
                }
            };

            button.test = function(event) {
                var coords = Position(event);
                var x = coords[0];
                var y = coords[1];
                //console.log("x: " + x , ", y: " + y );

                for (var b in buttons) {
                    var minX = buttons[b].x;
                    var minY = buttons[b].y;
                    var maxX = buttons[b].endX;
                    var maxY = buttons[b].endY;
                    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                        //console.log("button = " + b);
                        return b;
                    }
                }
                //console.log("button = none");
                return ("none");
            };

            button.highlight = function(highlightButton) {
                canvas.Active.ctx.fillStyle = 'rgba(255,255,255,0.7)';
                for (var b in buttons) {
                    if (buttons[b].category == "main") {
                        button.draw(b, canvas.Active.ctx, (highlightButton == b));
                    }
                }
            };

            button.highlightDigital = function(highlightButton) {
                canvas.Active.ctx.fillStyle = 'rgba(255,255,255,0.7)';
                for (var b in buttons) {
                    if (buttons[b].category == "digital") {
                        button.draw(b, canvas.Active.ctx, (highlightButton == b));
                    }
                }
            };

            button.highlightPlus = function() {
                canvas.Graph.ctx.fillStyle = "#FF4500";
                canvas.Graph.ctx.font = 'bold 20pt Lucinda Grande';
                canvas.Graph.ctx.fillText("+", buttons.plus.x, buttons.plus.endY);
            };

            button.highlightMinus = function() {
                canvas.Graph.ctx.fillStyle = "#FF4500";
                canvas.Graph.ctx.font = '30pt Lucinda Grande';
                canvas.Graph.ctx.fillText("-", buttons.minus.x, buttons.minus.endY);
            };

            button.highlightStop = function() {
                canvas.Graph.ctx.fillStyle = "#FF4500";
                canvas.Graph.ctx.beginPath();
                canvas.Graph.ctx.moveTo(buttons.stop.x, buttons.stop.y);
                canvas.Graph.ctx.lineTo(buttons.stop.x + 12, buttons.stop.y);
                canvas.Graph.ctx.lineTo(buttons.stop.x + 12, buttons.stop.y + 12);
                canvas.Graph.ctx.lineTo(buttons.stop.x, buttons.stop.y + 12);
                canvas.Graph.ctx.fill();
            };

            button.highlightPlay = function() {
                canvas.Graph.ctx.fillStyle = "#FF4500";
                canvas.Graph.ctx.beginPath();
                canvas.Graph.ctx.moveTo(buttons.play.x, buttons.play.y);
                canvas.Graph.ctx.lineTo(buttons.play.x + 10, buttons.play.y + 7);
                canvas.Graph.ctx.lineTo(buttons.play.x, buttons.play.y + 14);
                canvas.Graph.ctx.fill();
            };

            button.draw = function(b, context, highlight, x, y) {
                var radius = 1;
                var btn = buttons[b];
                var endX, endY;
                if (!x || !y) {
                    x = btn.x;
                    y = btn.y;
                    endX = btn.endX;
                    endY = btn.endY;
                } else {
                    endX = x + (btn.endX - btn.x);
                    endY = y + (btn.endY - btn.y);
                }
                var color = btn.color;
                var text = btn.text;
                var s = btn.s;
                context.beginPath();
                context.lineWidth = "1";
                context.moveTo(x + radius, y);
                context.lineTo(endX - radius, y);
                context.quadraticCurveTo(endX, y, endX, y + radius);
                context.lineTo(endX, endY - radius);
                context.quadraticCurveTo(endX, endY, endX - radius, endY);
                context.lineTo(x + radius, endY);
                context.quadraticCurveTo(x, endY, x, endY - radius);
                context.lineTo(x, y + radius);
                context.quadraticCurveTo(x, y, x + radius, y);
                if (highlight === true) {
                    context.strokeStyle = color;
                    context.stroke();
                    context.fillStyle = 'white';
                    context.fill();
                    context.fillStyle = color;
                } else {
                    context.strokeStyle = color;
                    context.stroke();
                    context.fillStyle = color;
                    context.fill();
                    context.fillStyle = 'white';
                }
                context.font = '10pt Andale Mono';
                context.fillText(text, x + s, y + 12);
            };

            // on switch
            button.on = function(probe) {
                var btn = buttons['onOff'];
                var x = probe.x + 85;
                var y = probe.y;
                var color = probe.color;
                var offColor = probe.offColor;
                var s = btn.s; var e = btn.e;
                var w = 50; var h = 15;
                var r = probe.endX + 60;
                var b = probe.endY;
                var radius = 1;

                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.lineWidth="1";
                canvas.BTN.ctx.moveTo(x+radius, y);
                canvas.BTN.ctx.lineTo(r-radius, y);
                canvas.BTN.ctx.quadraticCurveTo(r, y, r, y+radius);
                canvas.BTN.ctx.lineTo(r, y+h-radius);
                canvas.BTN.ctx.quadraticCurveTo(r, b, r-radius, b);
                canvas.BTN.ctx.lineTo(x+radius, b);
                canvas.BTN.ctx.quadraticCurveTo(x, b, x, b-radius);
                canvas.BTN.ctx.lineTo(x, y+radius);
                canvas.BTN.ctx.quadraticCurveTo(x, y, x+radius, y);
                canvas.BTN.ctx.strokeStyle = color; 
                canvas.BTN.ctx.stroke();
                canvas.BTN.ctx.fillStyle = color; 
                canvas.BTN.ctx.fill()
                canvas.BTN.ctx.fillStyle= 'white';
                canvas.BTN.ctx.font = '10pt Andale Mono';
                canvas.BTN.ctx.fillText('on', x + s, y+12);
                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.moveTo(x+w/2, y);
                canvas.BTN.ctx.lineTo(r-radius, y);
                canvas.BTN.ctx.quadraticCurveTo(r, y, r, y+radius);
                canvas.BTN.ctx.lineTo(r, y+h-radius);
                canvas.BTN.ctx.quadraticCurveTo(r, b, r-radius, b);
                canvas.BTN.ctx.lineTo(x+w/2, b);
                canvas.BTN.ctx.fillStyle = offColor; 
                canvas.BTN.ctx.fill()
                canvas.BTN.ctx.fillStyle= 'black';
                canvas.BTN.ctx.font = '10pt Andale Mono';
                canvas.BTN.ctx.fillText('off', x + e, y+12);
            };

            // off switch
            button.off = function(probe){
                var btn = buttons['onOff'];
                var x = probe.x + 85;
                var y = probe.y;
                var color = probe.color;
                var offColor = probe.offColor;
                var s = btn.s; var s = btn.s; var e = btn.e;
                var w = 50; var h = 15;
                var r = probe.endX + 60;
                var b = probe.endY;
                var radius = 1;

                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.lineWidth="1";
                canvas.BTN.ctx.moveTo(x+radius, y);
                canvas.BTN.ctx.lineTo(r-radius, y);
                canvas.BTN.ctx.quadraticCurveTo(r, y, r, y+radius);
                canvas.BTN.ctx.lineTo(r, y+h-radius);
                canvas.BTN.ctx.quadraticCurveTo(r, b, r-radius, b);
                canvas.BTN.ctx.lineTo(x+radius, b);
                canvas.BTN.ctx.quadraticCurveTo(x, b, x, b-radius);
                canvas.BTN.ctx.lineTo(x, y+radius);
                canvas.BTN.ctx.quadraticCurveTo(x, y, x+radius, y);
                canvas.BTN.ctx.strokeStyle = color; 
                canvas.BTN.ctx.stroke();
                canvas.BTN.ctx.fillStyle = color; 
                canvas.BTN.ctx.fill()
                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.moveTo(x+w/2, b);
                canvas.BTN.ctx.lineTo(x+radius, b);
                canvas.BTN.ctx.quadraticCurveTo(x, b, x, b-radius);
                canvas.BTN.ctx.lineTo(x, y+radius);
                canvas.BTN.ctx.quadraticCurveTo(x, y, x+radius, y);
                canvas.BTN.ctx.lineTo(x+w/2, y);
                canvas.BTN.ctx.fillStyle = offColor; 
                canvas.BTN.ctx.fill();
                canvas.BTN.ctx.fillStyle= 'black';
                canvas.BTN.ctx.font = '10pt Andale Mono';
                canvas.BTN.ctx.fillText('on', x + s, y+12);
                canvas.BTN.ctx.fillStyle= 'white';
                canvas.BTN.ctx.font = '10pt Andale Mono';
                canvas.BTN.ctx.fillText('off', x + e, y+12);
            };

            button.createOutput = function(){
                button.push('output',true);
                var probes = Object.keys(buttons);
                probeName = probes[probes.length-16];
                probe = buttons[probeName];
                probe2 = buttons[probes[probes.length-17]]
                ui.wire.Link(probe2,probe);
                probe.input = "on";
                canvas.Active.ctx.fillStyle= 'red';
                canvas.Active.ctx.font = '12pt Andale Mono';
                canvas.Active.ctx.fillText("select " + probe.article, BBposX + 10, BBposY-25);
            };

            button.drawGraphbtn = function(b, context) {
                var btn = buttons[b];
                // zoom in
                if (btn.text == "+") {
                    context.font = 'bold 20pt Lucinda Grande';
                    context.fillText(btn.text, btn.x, btn.endY);
                    context.save();
                }
                
                // zoom out
                else if (btn.text == "-") {
                    context.font = '30pt Lucinda Grande';
                    context.fillText(btn.text, btn.x, btn.endY);
                    context.save();
                }
                
                // play button
                else if (btn.text == "play") 
                {
                    context.beginPath();
                    context.moveTo(btn.x, btn.y);
                    context.lineTo(btn.x + 10, btn.y + 7);
                    context.lineTo(btn.x, btn.y + 14);
                    context.fill();
                    context.restore();
                    context.save();
                }

                // stop button
                else {
                    context.beginPath();
                    context.moveTo(btn.x, btn.y);
                    context.lineTo(btn.x + 12, btn.y);
                    context.lineTo(btn.x + 12, btn.y + 12);
                    context.lineTo(btn.x, btn.y + 12);
                    context.fill();
                    context.restore();
                }
            };

            var probeIndex = 0;
            button.push = function(b, output) {
                buttons[probeIndex] = {};
                for (var prop in buttons[b]) {
                    if (buttons[b].hasOwnProperty(prop)) {
                        buttons[probeIndex][prop] = buttons[b][prop];
                    }
                }
                buttons[probeIndex].name = b;
                buttons[probeIndex].x = snapProbe.x;
                buttons[probeIndex].y = snapProbe.y;
                buttons[probeIndex].endX = snapProbe.x + 75;
                buttons[probeIndex].endY = snapProbe.y + 15;
                buttons[probeIndex].status = "probe";

                //ui.probe.push(buttons[probeIndex]);

                //output is true if the input button selected.
                if (output === true) {
                    buttons[probeIndex].x = snapProbe.x+75;
                    buttons[probeIndex].endX = snapProbe.x + 150;
                    button.draw(probeIndex, canvas.Base.ctx, false, snapProbe.x+75, snapProbe.y);
                }
                else {
                    button.draw(probeIndex, canvas.Base.ctx, false);
                }
                snapProbe.y += 22;
                probeIndex++;
            };

            button.pop = function() {
                snapProbe.y -= 22;
                probeIndex--;
                var button = buttons[probeIndex];
                delete buttons[probeIndex];
                return button;
            };

            button.get = function() {
                return buttons;
            }

            for (var b in buttons) {
                if (buttons[b].category == "main") {
                    button.draw(b, canvas.Base.ctx, false);
                } else if (buttons[b].category == "graph") {
                    button.drawGraphbtn(b, canvas.Graph.ctx);
                }
            }

            return button;
        })();

        ui.bar = (function() {
            var bar = {};
            var bars = [];

            // slider bar properties, not necessarily connected to led
            bar.create = function(probe, pin) {
                var bar = {
                    color: probe.color,
                    outline: probe.color,
                    height: 15,
                    length: 70,
                    locX: probe.endX + 70,
                    locY: probe.y,
                    btn: probe,
                    move: "off",
                    pin: pin,
                    sliderX: function() {return this.locX + 2;},
                    sliderY: function() {return this.locY + 2;},
                    frequency: function() {return this.sliderX() - this.locX - 2;},
                    text: "0 s",
                    type: probe.category
                };

                if (probe.name === "pwm") {
                    bar.text = bar.frequency().toString();
                }
                else {
                    bar.text = (bar.frequency().toString() + ' s');
                };

                bars.push(bar);
                return bars;
            };

            bar.draw = function(){
                var len = bars.length;
                //canvas.Bar.ctx.clearRect(0,0,canvas.Bar.e.width,canvas.Bar.e.height);
                canvas.Bar.ctx.fillStyle= 'rgb(205,205,205)';
                canvas.Bar.ctx.fillRect(bars[len-1].locX,bars[len-1].locY, bars[len-1].length, bars[len-1].height);
                canvas.Bar.ctx.fillStyle= bars[len-1].barColor;
                canvas.Bar.ctx.fillRect(bars[len-1].locX,bars[len-1].locY, bars[len-1].sliderX() - bars[len-1].locX, 15);
                canvas.Bar.ctx.fillStyle= 'rgb(30,30,30)';
                canvas.Bar.ctx.fillRect(bars[len-1].sliderX()-2,bars[len-1].locY,14,15);
                canvas.Bar.ctx.strokeStyle= bars[len-1].outline;
                canvas.Bar.ctx.lineWidth = 2;
                canvas.Bar.ctx.strokeRect(bars[len-1].locX,bars[len-1].locY, bars[len-1].length, bars[len-1].height);
                canvas.Bar.ctx.fillStyle= 'black';
                canvas.Bar.ctx.strokeStyle = 'rgb(225,225,225)';
                canvas.Bar.ctx.lineWidth = 6;
                canvas.Bar.ctx.font = '12pt Andale Mono';
                canvas.Bar.ctx.strokeText(bars[len-1].text, bars[len-1].length + bars[len-1].locX + 5, 
                bars[len-1].height + bars[len-1].locY -2);  
                canvas.Bar.ctx.fillText(bars[len-1].text, bars[len-1].length + bars[len-1].locX + 5, 
                bars[len-1].height + bars[len-1].locY -2);
            };

            bar.test = function(event) {
                var coords = Position(event);
                var x = coords[0];
                var y = coords[1];
                for (var i = 0; i<bars.length; i++) {
                    var minX = bars[i].locX;
                    var minY = bars[i].locY;
                    var maxX = minX + bars[i].length;
                    var maxY = minY + bars[i].height;
                    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                        console.log("bar = " + bars[i]);
                        return bars[i];
                    }
                }
                //console.log("button = none");
                return ("none");
            };

            return bar;
        })();

        //wire object is responsible for drawing all wires in graph
        ui.wire = (function() {
            var wire = {};
            var btnHeight = 15;

            wire.LEDs = function(pin, probe){
                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.moveTo(probe.x + 75, probe.y + btnHeight*0.5);
                canvas.BTN.ctx.lineTo(rectInner.w - 143, probe.y + btnHeight*0.5);
                canvas.BTN.ctx.lineTo(rectInner.w - 143, rect.y + 10);
                canvas.BTN.ctx.lineTo(pin.x + pin.w/2 , rect.y + 10);
                canvas.BTN.ctx.lineTo(pin.x + pin.w/2 , pin.y);
                canvas.BTN.ctx.strokeStyle = pin.color;
                canvas.BTN.ctx.lineWidth = 2;
                canvas.BTN.ctx.stroke();
            };

            wire.Analog = function(pin, probe){
                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.moveTo(probe.x + 75, probe.y + btnHeight*0.5);
                canvas.BTN.ctx.lineTo(rectInner.w - 140, probe.y + btnHeight*0.5);
                canvas.BTN.ctx.lineTo(rectInner.w - 140, pin.y + pin.h/2);
                canvas.BTN.ctx.lineTo(pin.x + pin.w/2, pin.y + pin.h/2);
                canvas.BTN.ctx.lineWidth = 2;
                canvas.BTN.ctx.strokeStyle = pin.color;
                canvas.BTN.ctx.stroke();
            };

            wire.Digital = function(pin, probe){
                canvas.BTN.ctx.beginPath();
                if (pin.subType == "input") { var s = -2; }
                else if (pin.subType == "output") { var s = -6; }
                else { var s = -4; }
                canvas.BTN.ctx.strokeStyle = pin.color;
                canvas.BTN.ctx.moveTo(probe.x + 75, probe.y + btnHeight*0.5);
                canvas.BTN.ctx.lineTo(rectInner.w - 141 + s, probe.y + btnHeight*0.5);
                canvas.BTN.ctx.lineTo(rectInner.w - 141 + s, pin.y + pin.h/2);
                canvas.BTN.ctx.lineTo(pin.x + pin.w/2, pin.y + pin.h/2);
                canvas.BTN.ctx.lineWidth = 2;
                canvas.BTN.ctx.stroke();
            };

            wire.Link = function(btn1,btn2){
                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.moveTo(btn1.endX/2 + 15, btn1.y + btnHeight);
                canvas.BTN.ctx.lineTo(btn1.endX/2 + 15, btn2.y + btnHeight*0.5);
                canvas.BTN.ctx.lineTo(btn2.x, btn2.y + btnHeight*0.5);
                canvas.BTN.ctx.strokeStyle = 'rgb(0,153,110)';
                canvas.BTN.ctx.lineWidth = 2;
                canvas.BTN.ctx.stroke();
            };

            wire.drawToGraph = function(pin){
                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.moveTo(rectInner.w + 40, graphLinePos);
                canvas.BTN.ctx.lineTo(rectInner.w + 70, graphLinePos);
                canvas.BTN.ctx.strokeStyle = pin.color;
                canvas.BTN.ctx.lineWidth = 2;
                canvas.BTN.ctx.stroke();
                graphLinePos += 4;
            };

            return wire;
        })();

        ui.pin = (function() {
            var pin = {};
            var pins = [
                // P9
                {
                    name: 'GND',
                    category: 'ground'
                }, {
                    name: 'GND',
                    category: 'ground'
                }, {
                    name: 'VDD 3.3V',
                    category: 'power'
                }, {
                    name: 'VDD 3.3V',
                    category: 'power'
                }, {
                    name: 'VDD 5V',
                    category: ''
                }, {
                    name: 'VDD 5V',
                    category: ''
                }, {
                    name: 'SYS 5V',
                    category: ''
                }, {
                    name: 'SYS 5V',
                    category: ''
                }, {
                    name: 'PWR_BUT',
                    category: 'reset'
                }, {
                    name: 'SYS_RESETn',
                    category: 'reset'
                }, {
                    name: 'P9_11',
                    category: 'digital'
                }, {
                    name: 'P9_12',
                    category: 'digital'
                }, {
                    name: 'P9_13',
                    category: 'digital'
                }, {
                    name: 'P9_14',
                    category: 'digital',
                    PWM: true
                }, {
                    name: 'P9_15',
                    category: 'digital'
                }, {
                    name: 'P9_16',
                    category: 'digital',
                    PWM: true
                }, {
                    name: 'P9_17',
                    category: 'digital'
                }, {
                    name: 'P9_18',
                    category: 'digital'
                }, {
                    name: 'P9_19',
                    category: 'i2c'
                }, {
                    name: 'P9_20',
                    category: 'i2c'
                }, {
                    name: 'P9_21',
                    category: 'digital',
                    PWM: true
                }, {
                    name: 'P9_22',
                    category: 'digital',
                    PWM: true
                }, {
                    name: 'P9_23',
                    category: 'digital'
                }, {
                    name: 'P9_24',
                    category: 'digital'
                }, {
                    name: 'P9_25',
                    category: 'digital'
                }, {
                    name: 'P9_26',
                    category: 'digital'
                }, {
                    name: 'P9_27',
                    category: 'digital'
                }, {
                    name: 'P9_28',
                    category: ''
                }, {
                    name: 'P9_29',
                    category: ''
                }, {
                    name: 'P9_30',
                    category: 'digital'
                }, {
                    name: 'P9_31',
                    category: ''
                }, {
                    name: 'P9_32',
                    category: ''
                }, {
                    name: 'P9_33',
                    category: 'analog'
                }, {
                    name: 'P9_34',
                    category: ''
                }, {
                    name: 'P9_35',
                    category: 'analog'
                }, {
                    name: 'P9_36',
                    category: 'analog'
                }, {
                    name: 'P9_37',
                    category: 'analog'
                }, {
                    name: 'P9_38',
                    category: 'analog'
                }, {
                    name: 'P9_39',
                    category: 'analog'
                }, {
                    name: 'P9_40',
                    category: 'analog'
                }, {
                    name: 'P9_41',
                    category: 'digital'
                }, {
                    name: 'P9_42',
                    category: 'digital',
                    PWM: true
                }, {
                    name: 'GND',
                    category: 'ground'
                }, {
                    name: 'GND',
                    category: 'ground'
                }, {
                    name: 'GND',
                    category: 'ground'
                }, {
                    name: 'GND',
                    category: 'ground'
                },
                // P8
                {
                    name: 'GND',
                    category: 'ground'
                }, {
                    name: 'GND',
                    category: 'ground'
                }, {
                    name: 'P8_3',
                    category: ''
                }, {
                    name: 'P8_4',
                    category: ''
                }, {
                    name: 'P8_5',
                    category: ''
                }, {
                    name: 'P8_6',
                    category: ''
                }, {
                    name: 'P8_7',
                    category: 'digital'
                }, {
                    name: 'P8_8',
                    category: 'digital'
                }, {
                    name: 'P8_9',
                    category: 'digital'
                }, {
                    name: 'P8_10',
                    category: 'digital'
                }, {
                    name: 'P8_11',
                    category: 'digital'
                }, {
                    name: 'P8_12',
                    category: 'digital'
                }, {
                    name: 'P8_13',
                    category: 'digital',
                    PWM: true
                }, {
                    name: 'P8_14',
                    category: 'digital'
                }, {
                    name: 'P8_15',
                    category: 'digital'
                }, {
                    name: 'P8_16',
                    category: 'digital'
                }, {
                    name: 'P8_17',
                    category: 'digital'
                }, {
                    name: 'P8_18',
                    category: 'digital'
                }, {
                    name: 'P8_19',
                    category: 'digital',
                    PWM: true
                }, {
                    name: 'P8_20',
                    category: ''
                }, {
                    name: 'P8_21',
                    category: ''
                }, {
                    name: 'P8_22',
                    category: ''
                }, {
                    name: 'P8_23',
                    category: ''
                }, {
                    name: 'P8_24',
                    category: ''
                }, {
                    name: 'P8_25',
                    category: ''
                }, {
                    name: 'P8_26',
                    category: 'digital'
                }, {
                    name: 'P8_27',
                    category: ''
                }, {
                    name: 'P8_28',
                    category: ''
                }, {
                    name: 'P8_29',
                    category: ''
                }, {
                    name: 'P8_30',
                    category: ''
                }, {
                    name: 'P8_31',
                    category: ''
                }, {
                    name: 'P8_32',
                    category: ''
                }, {
                    name: 'P8_33',
                    category: ''
                }, {
                    name: 'P8_34',
                    category: ''
                }, {
                    name: 'P8_35',
                    category: ''
                }, {
                    name: 'P8_36',
                    category: ''
                }, {
                    name: 'P8_37',
                    category: ''
                }, {
                    name: 'P8_38',
                    category: ''
                }, {
                    name: 'P8_39',
                    category: ''
                }, {
                    name: 'P8_40',
                    category: ''
                }, {
                    name: 'P8_41',
                    category: ''
                }, {
                    name: 'P8_42',
                    category: ''
                }, {
                    name: 'P8_43',
                    category: ''
                }, {
                    name: 'P8_44',
                    category: ''
                }, {
                    name: 'P8_45',
                    category: ''
                }, {
                    name: 'P8_46',
                    category: ''
                },
                // LEDs
                {
                    name: 'USR0',
                    category: 'led'
                }, {
                    name: 'USR1',
                    category: 'led'
                }, {
                    name: 'USR2',
                    category: 'led'
                }, {
                    name: 'USR3',
                    category: 'led'
                }
            ];

            // initialize positions
            for (var i = 0; i < 92; i++) {
                var x, y;
                // only compute base x/y on initial/even iterations
                if ((i % 2) === 0) {
                    y = BBposY + 83.5 + 9.12 * ((i % 46) / 2);
                    x = BBposX + 5;
                    // P8
                    if (i >= 46) {
                        x += 177.5;
                    }
                }
                // offset x on odd iterations 
                else {
                    x += 9.5;
                }
                pins[i].x = x;
                pins[i].y = y;
                pins[i].w = 5;
                pins[i].h = 5;
                pins[i].s = 18;
                pins[i].select = "off";
            }
            for (var i = 92; i < 96; i++) {
                // var LEDpositions = [230.5, 241.75, 253, 264.25];
                var LEDpositions = [151.5, 158.5, 165.5, 171.5];
                pins[i].x = BBposX + LEDpositions[i - 92];
                pins[i].y = BBposY + 18;
                pins[i].w = 5;
                pins[i].h = 10;
                pins[i].s = 18;
                pins[i].select = "off";
            }

            pin.highlight = function(button) {
                if (button == "none") return;

                var category = button;
                var pwm = false;
                if (category == "input") category = "digital";
                if (category == "output") category = "digital";
                
                for (var i = 0; i < 96; i++) {
                    if (category == "pwm") pwm = pins[i].PWM;
                    if (category == pins[i].category || pwm) {
                        var p = pins[i];
                        if (p.select !== "on") {
                            canvas.Active.ctx.fillStyle = 'RGBA(255,255,255,0.5)';
                            canvas.Active.ctx.fillRect(p.x, p.y, p.w, p.h);
                            canvas.Active.ctx.save();
                        }
                    }
                }
            };

            pin.hover = function(pin) {
                Canvas.get().Active.ctx.fillStyle = 'RGBA(255,255,255,.5)';
                Canvas.get().Active.ctx.fillRect(pin.x,pin.y,pin.w,pin.h);
            }

            pin.test = function(event) {
                var coords = Position(event);
                var x = coords[0];
                var y = coords[1];

                for (var p in pins) {
                    if (x >= pins[p].x && x <= pins[p].x + pins[p].w && y >= pins[p].y && 
                        y <= pins[p].y + pins[p].h) {
                        //console.log("pin = " + pins[p].name);
                        return pins[p];
                    }
                }
                return ("none");
            };

            return pin;
        })();

        // each inserted element is a 'probe'
        ui.probe = (function() {
            var probe = {};
            var probes = [];

            var add = {};
            add.type = 'none';

            probe.push = function(button) {
                probes.push(button);
            };

            probe.addStart = function(type) {
                add.type = type;
            };

            probe.addTest = function(event) {
                if (add.type == 'none') return ('none');
                var coords = Position(event);
                var x = coords[0];
                var y = coords[1];
                if (x < rectInner.x || x > rectInner.x + rectInner.w ||
                    y < rectInner.y || y > rectInner.y + rectInner.h) {
                    return ('cancelled');
                }
                ui.button.push(add.type);
                return ('hoverPin');
            };

            probe.dragButton = function(event) {
                ui.loop.clear();
                var coords = Position(event);
                var x = coords[0] - 50;
                var y = coords[1] - 7.5;
                ui.button.draw(add.type, canvas.Active.ctx, true, x, y);
                ui.pin.highlight(add.type);
            };

            //clears the duplicate button after dragging button to graph.
            probe.clearDrag = function(event) {
                var coords = Position(event);
                var x = coords[0] - 50;
                var y = coords[1] - 7.5;
                canvas.Active.ctx.clearRect(x-1,y-1,ui.button.get()[add.type].endX,ui.button.get()[add.type].endY);
                canvas.Active.ctx.save();
            };

            probe.selectText = function(){
                canvas.Active.ctx.fillStyle= 'red';
                canvas.Active.ctx.font = '12pt Andale Mono';
                canvas.Active.ctx.fillText("select " + ui.button.get()[add.type].article, BBposX + 10, BBposY-25);
                canvas.Active.ctx.save();

                add.type = 'none';
            };

            probe.add = function(pin) {
                Canvas.add(pin.name, 10);
                ui.graph.add(pin.name, 10);
            };

            probe.onOffTest = function(event) {

            };

            probe.test = function(event) {
                var coords = Position(event);
                var x = coords[0];
                var y = coords[1];
                var buttons = ui.button.get();

                for (var b in buttons) {
                    var minX = buttons[b].x;
                    var minY = buttons[b].y;
                    var maxX = buttons[b].endX;
                    var maxY = buttons[b].endY;
                    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                        return buttons[b].name;
                    }
                }

                return ("none");
            };

            return probe;
        })();

        ui.loop = (function() {
            var loop = {};

            loop.clear = function() {
                canvas.Active.ctx.clearRect(0, 0, canvas.Active.e.width, canvas.Active.e.height);
            };

            // to remove probe if not connected to pin.
            loop.clearProbe = function() {
                var btn = ui.button.pop();
                canvas.Base.ctx.clearRect(btn.x-1, btn.y-1, btn.endX, btn.endY);
            };

            loop.clearBB = function() {
                canvas.Active.ctx.clearRect(283, 120, canvas.Active.e.width, canvas.Active.e.height);
            };

            loop.welcome = function(button) {
                var color = (button == 'exit') ? 'black' : 'white';
                var ctx = canvas.Active.ctx;
                var width = canvas.Active.e.width;
                var height = canvas.Active.e.height;
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = 'rgba(0,102,204,0.85)';
                ctx.fillRect(width / 3.75, height / 4, width / 1.8, height / 2.85);
                ctx.fillStyle = color;
                ctx.font = '12pt Arial';
                ctx.fillText('X', width / 2 + 250, height / 4 + 25);
                ctx.fillStyle = 'white';
                ctx.font = '14pt Arial';
                ctx.fillText('Welcome to the beaglebone user interface!', width / 3.75 + 20, height / 4 + 30);
                ctx.font = '10pt Arial';
                ctx.fillText('This interface allows you to play with analog to digital converters,', width / 3.75 + 25, height / 4 + 55);
                ctx.fillText('digital pins (including inputs, outputs, and pwms), and the user leds', width / 3.75 + 25, height / 4 + 70);
                ctx.fillText('located at the top of the board. Hovering over the buttons indicates', width / 3.75 + 25, height / 4 + 85);
                ctx.fillText('which pins correspond to what type. Click and drag the button within', width / 3.75 + 25, height / 4 + 100);
                ctx.fillText('the white rectangle and select a pin. The input button requires both an', width / 3.75 + 25, height / 4 + 115);
                ctx.fillText('input and an output. The graph to the right will display the voltage', width / 3.75 + 25, height / 4 + 130);
                ctx.fillText('of the corresponding pin. Use the zoom in or zoom out to alter the graph,', width / 3.75 + 25, height / 4 + 145);
                ctx.fillText('stop to stop recording voltages, and play again to reset. Enjoy!', width / 3.75 + 25, height / 4 + 160);
            };

            loop.clear();
            loop.welcome('white');

            return loop;
        })();

        ui.base = (function() {
            var base = {};
            var beagleBone = new Image();
            beagleBone.src = base_url + '/static/images/beaglebone.png';
            beagleBone.onload = function() {
                canvas.Base.ctx.drawImage(beagleBone, BBposX, BBposY, beagleBone.width * 0.65, beagleBone.height * 0.65);
            };

            return base;
        })();

        ui.graph = (function() {
            var graph = {};
            var bg = {
                x: 0,
                y: BBposY - 70,
                w: canvas.Base.e.width,
                h: 540
            };

            // draw gray background, buttons, and graph
            //drawGraph(canvas, uiElements);
            canvas.Base.ctx.fillStyle = 'rgb(225,225,225)';
            canvas.Base.ctx.fillRect(bg.x, bg.y, bg.w, bg.h);
            canvas.Base.ctx.strokeStyle = 'rgb(255,255,255)';
            canvas.Base.ctx.lineWidth = 3;
            canvas.Base.ctx.strokeRect(bg.x + 20, bg.y + 15, 250, 440);
            //drawButtons(canvas, uiElements);

            graph.add = function(pin) {
                Canvas.add(pin.name + 'Graph', 10);

            };

            return graph;
        })();

        ui.xyAxis = (function() {
            var xyAxis = {};

            var graph = {
                xWidth: 360,
                yWidth: 250,
                zeroX: axisStartX,
                zeroY: axisStartY + 160,
                interval: 0,
                zoomVal: [.125, .25, .5, 1],
                zoomIndex: 3,
                zoom: function() {
                    return this.zoomVal[this.zoomIndex];
                }
            }

            canvas.Graph.ctx.beginPath();
            canvas.Graph.ctx.moveTo(graph.zeroX, graph.zeroY);
            canvas.Graph.ctx.lineTo(graph.zeroX + graph.xWidth, graph.zeroY);
            canvas.Graph.ctx.strokeStyle = "#354b60";
            canvas.Graph.ctx.lineWidth = 2;
            canvas.Graph.ctx.stroke();
            canvas.Graph.ctx.strokeStyle = "black";
            canvas.Graph.ctx.font = '10pt Lucinda Grande';
            canvas.Graph.ctx.fillText('Time [s]', axisStartX + 130, graph.zeroY + 50);
            canvas.Graph.ctx.save();

            canvas.Graph.ctx.beginPath();
            canvas.Graph.ctx.moveTo(graph.zeroX, graph.zeroY + 5);
            canvas.Graph.ctx.lineTo(graph.zeroX, graph.zeroY - graph.yWidth -10);
            canvas.Graph.ctx.strokeStyle = "black";
            canvas.Graph.ctx.lineWidth = 2;
            canvas.Graph.ctx.stroke();
            canvas.Graph.ctx.save();

            canvas.Graph.ctx.strokeStyle = "black";
            canvas.Graph.ctx.font = '10pt Lucinda Grande';
            canvas.Graph.ctx.fillText('Voltage [v]', graph.zeroX - 30, graph.zeroY - graph.yWidth - 20);
            
            //x ticks
            var x = 0;
            var countX = 0;
            var xnum = 95;
            var time = 1;
            var prec = Math.ceil(Math.log(Math.abs(graph.interval) / 100 + 1.1) / Math.LN10) + 1;
            canvas.Graph.ctx.strokeStyle = "black";
            while (x <= graph.xWidth + graph.interval) {
                if (graph.zeroX + x - graph.interval >= graph.zeroX) {
                    if (countX % 10 === 0) {
                        canvas.Graph.ctx.beginPath();
                        canvas.Graph.ctx.moveTo(graph.zeroX + x - graph.interval, graph.zeroY - 5);
                        canvas.Graph.ctx.lineTo(graph.zeroX + x - graph.interval, graph.zeroY + 10);
                        canvas.Graph.ctx.lineWidth = 2;
                        canvas.Graph.ctx.stroke();
                    } else {
                        canvas.Graph.ctx.beginPath();
                        canvas.Graph.ctx.moveTo(graph.zeroX + x - graph.interval, graph.zeroY - 5);
                        canvas.Graph.ctx.lineTo(graph.zeroX + x - graph.interval, graph.zeroY + 5);
                        canvas.Graph.ctx.lineWidth = 2;
                        canvas.Graph.ctx.stroke();
                    }
                }
                x += 10;
                countX += 1;
            }
            canvas.Graph.ctx.fillStyle = "black";
            canvas.Graph.ctx.font = '8pt Lucinda Grande';
            while (xnum <=  graph.xWidth + graph.interval) {
                if (axisStartX + xnum - graph.interval >= graph.zeroX) {
                    canvas.Graph.ctx.fillText(time.toPrecision(prec).toString(),
                        axisStartX + xnum - graph.interval, graph.zeroY + 20);
                }
                xnum += 100;
                time = (xnum + 3) / 100;

            }

            //y ticks
            var y = 0;
            var countY = 5;
            var ynum = 0;
            var volt = 5;
            var text;
            while (y <= graph.yWidth) {
                if (countY % 5 === 0) {
                    canvas.Graph.ctx.beginPath();
                    canvas.Graph.ctx.moveTo(graph.zeroX - 10, graph.zeroY - y);
                    canvas.Graph.ctx.lineTo(graph.zeroX + 5, graph.zeroY - y);
                    canvas.Graph.ctx.lineWidth = 2;
                    canvas.Graph.ctx.stroke();
                } else {
                    canvas.Graph.ctx.beginPath();
                    canvas.Graph.ctx.moveTo(graph.zeroX - 5, graph.zeroY - y);
                    canvas.Graph.ctx.lineTo(graph.zeroX + 5, graph.zeroY - y);
                    canvas.Graph.ctx.lineWidth = 2;
                    canvas.Graph.ctx.stroke();
                }
                y += 10;
                countY += 1;
            };
            canvas.Graph.ctx.fillStyle = "black";
            canvas.Graph.ctx.font = '8pt Lucinda Grande';
            while (ynum <= graph.yWidth && volt >= 0) {
                text = (volt * graph.zoom()).toFixed(1).toString();
                if (text == "0.0") {
                    canvas.Graph.ctx.fillText(text.toString(), graph.zeroX - 20, graph.zeroY - graph.yWidth + ynum + 15);
                } else {
                    canvas.Graph.ctx.fillText(text.toString(), graph.zeroX - 30, graph.zeroY - graph.yWidth + ynum +2);
                }
                ynum += 50;
                volt -= 1;
            };
            return xyAxis;
        })();

        function Position(event) {
            var rect = canvas.Base.e.getBoundingClientRect();
            var coords = [];
            // find position of mouse
            if (event.x !== undefined && event.y !== undefined) {
                coords[0] = event.x;
                coords[1] = event.y;
            } else // Firefox method to get the position
            {
                coords[0] = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                coords[1] = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
            //console.log("Position = " + [x, y]);
            //console.log("Offset = " + [rect.left, rect.top]);
            coords[0] -= rect.left;
            coords[1] -= rect.top;

            return (coords);
        };

        return ui;
    } // end of ui's init()


    return {
        get: function() {
            if (!ui) {
                ui = init();
            }
            return ui;
        }
    };
})();

var Events = (function() {
    var e;

    function init() {
        e = {};
        e.ui = UI.get();
        e.listeners = {};
        e.start = function() {
            listen(true, 'clickExit');
            listen(true, 'hoverExit');
        };
        e.start();
        return e;
    }

    function listen(enable, description) {
        var events = {
            'clickExit': {
                event: 'click',
                func: clickExit
            },
            'hoverExit': {
                event: 'mousemove',
                func: hoverExit
            },
            'hoverAddProbe': {
                event: 'mousemove',
                func: hoverAddProbe
            },
            'hoverDigital': {
                event: 'mousemove',
                func: hoverDigital
            },
            'hoverButton': {
                event: 'mousemove',
                func: hoverButton
            },
            'hoverPin': {
                event: 'mousemove',
                func: hoverPin
            },
            'clickPin': {
                event: 'click',
                func: clickPin
            },
            'clickDown': {
                event: 'mousedown',
                func: clickDown
            },
            'clickDownDigital': {
                event: 'mousedown',
                func: clickDownDigital
            },
            'hSlider': {
                event: 'mousemove',
                func: hSlider
            },
            'release': {
                event: 'mouseup',
                func: release
            }
        };

        if (!(description in events)) {
            console.log("Listener for " + description + " doesn't exist");
            return;
        }
        if ((description in e.listeners) && enable) {
            console.log("Listener " + description + " already enabled, but requested to enable again");
            return;
        }
        if (!(description in e.listeners) && !enable) {
            console.log("Listener " + description + " was not previously enabled, but requested to disable again");
            return;
        }
        console.log((enable ? "Enabling listener " : "Disabling listener ") + description);

        if (enable) e.listeners[description] = true;
        else delete e.listeners[description];

        var ev = events[description].event;
        var func = events[description].func;
        if (enable) document.addEventListener(ev, func, false);
        else document.removeEventListener(ev, func, false);
    }

    function clickExit(event) {
        var button = e.ui.button.test(event);
        if (button == "exit") {
            e.ui.loop.clear();
            listen(false, 'clickExit');
            listen(false, 'hoverExit');
            listen(true, 'clickDown');
            listen(true, 'release');
            listen(true, 'hoverButton');
        }
    }

    function hoverExit(event) {
        var button = e.ui.button.test(event);
        //console.log("hoverExit: button = " + button);
        e.ui.loop.clear();
        e.ui.loop.welcome(button);
    }


    //on button hover, highlight button and coressponding pins.
    function hoverButton(event) {
        e.ui.loop.clear();
        //e.ui.pin.test(event);
        var button = e.ui.button.test(event);
        e.ui.button.highlight(button);
        e.ui.pin.highlight(button);
        switch (button) {
            case "digital":
                listen(true, 'hoverDigital');
                listen(true, 'clickDownDigital');
                break;
            default:
                break;
        }
    }

    function hoverDigital(event) {
        var button = e.ui.button.test(event);
        e.ui.button.highlightDigital(button);
        switch (button) {
            case "digital":
            case "input":
            case "output":
            case "pwm":
            case "digitalMenu":
                break;
            default:
                listen(false, 'hoverDigital');
                listen(false, 'clickDownDigital');
                break;
        }
    }

    // if clicked on global button, slider, graph, or probe-on/off button
    function clickDown(event) {
        var button = e.ui.button.test(event);
        //if (button == "none") button = e.ui.probe.onOffTest(event);
        if (button == "none") button = e.ui.probe.sliderTest(event);
        if (button == "none") button = e.ui.graph.test(event);
        switch (button) {
            case "analog":
            case "led":
                e.ui.probe.addStart(button);
                listen(true, 'hoverAddProbe');
                listen(false, 'hoverButton');
                listen(false, 'clickDownDigital');
                listen(false, 'clickDown');
                break;
            case "plus":
                e.ui.state.down = "zooming";
                //e.ui.graph.zoomChange("in");
                e.ui.button.highlightPlus();
                break;
            case "minus":
                e.ui.state.down = "zooming";
                //e.ui.graph.zoomChange("out");
                e.ui.button.highlightMinus();
                break;
            case "stop":
                e.ui.state.down = "stop";
                e.ui.button.highlightStop();
                break;
            case "play":
                e.ui.state.down = "play";
                e.ui.button.highlightPlay();
                break;
            case "slider":
                e.ui.state.down = "slider";
                listen(true, 'hSlider');
                break;
            case "onOff":
                break;
            default:
                break;
        }
    }

    function clickDownDigital(event) {
        var button = e.ui.button.test(event);
        switch (button) {
            case "input":
            case "output":
            case "pwm":
                e.ui.probe.addStart(button);
                listen(true, 'hoverAddProbe');
                listen(false, 'hoverButton');
                listen(false, 'clickDownDigital');
                listen(false, 'clickDown');
                break;
            default:
                break;
        }
        listen(false, 'hoverDigital');
    }

    function hoverAddProbe(event) {
        e.ui.probe.dragButton(event);
    }

    function release(event) {
        var probeMode = e.ui.probe.addTest(event);

        if (probeMode == 'hoverPin') {
            e.ui.probe.clearDrag(event);
            listen(false, 'hoverAddProbe');
            listen(true, 'hoverPin');
            e.ui.probe.selectText();
            var probe = e.ui.probe.test(event);
            e.ui.pin.highlight(probe);
            listen(true, 'clickDown');
        } else if (probeMode == 'cancelled') {
            listen(false, 'hoverAddProbe');
            listen(true, 'hoverButton');
            listen(true, 'clickDown');
        }
    }

    function hoverPin(event) {
        e.ui.loop.clearBB();
        pin = e.ui.pin.test(event);
        var probes = Object.keys(e.ui.button.get());
        probeName = probes[probes.length-16];
        probe = e.ui.button.get()[probeName];
        e.ui.pin.highlight(probe.name);
        probe.category = probe.name;
        if (probe.name == 'input' || probe.name == 'output') {
            probe.category = 'digital';
        }
        pwm = false;
        if (probe.name == "pwm") pwm = pin.PWM;
        if ((pin.category == probe.category || pwm) && pin.select == 'off') {
            probe.text = pin.name;
            e.ui.button.draw(probeName, Canvas.get().Active.ctx, false);
            e.ui.pin.hover(pin);
        } else {
            Canvas.get().Active.ctx.clearRect(probe.x, probe.y, probe.endX, probe.endY);
        }
    }

    function clickPin(event) {
        listen(false, 'hoverPin');
        listen(false, 'clickPin');

        var probes = Object.keys(e.ui.button.get());
        probeName = probes[probes.length-16];
        probe = e.ui.button.get()[probeName];

        pin = e.ui.pin.test(event);

        //if pin isn't selected -> clear probe and activate menus
        if (pin.name === undefined) {
            if (probe.input !== "on") {
                e.ui.loop.clearProbe();
                listen(true, 'hoverButton');
            }
            else {
                listen(true, 'hoverPin');
                listen(true, 'clickPin');
            }
        }
        else {
            if (probe.name == "pwm") pwm = pin.PWM;
            if ((pin.category == probe.category || pwm) && pin.select == 'off') {
                e.ui.loop.clear();
                probe.text = pin.name;
                e.ui.button.draw(probeName, Canvas.get().BTN.ctx, false);
                e.ui.pin.hover(pin);
                pin.select = 'on';
                e.ui.probe.add(pin);
                probe.pinNum = pin;

                //LEDs
                if (probe.name === "led" && pin.select == 'on'){
                    pin.color = probe.graphColors[0];
                    probe.graphColors.splice(0,1);
                    e.ui.wire.LEDs(pin, probe); 
                    e.ui.button.on(probe);
                    //e.ui.button.off(probe);
                    e.ui.bar.create(probe, pin);
                    e.ui.bar.draw();
                    listen(true, 'hoverButton');
                }

                //Analog
                else if (probe.name === "analog" && pin.select == 'on'){
                    pin.color = probe.graphColors[0];
                    probe.graphColors.splice(0,1);
                    e.ui.wire.Analog(pin, probe); 
                    e.ui.button.on(probe);
                    //e.ui.button.off(probe);
                    listen(true, 'hoverButton');
                }

                //Digital
                else { 
                    pin.subType = probe.name;
                    if (probe.name === "input"){
                        pin.color = probe.graphColors[0];
                        probe.graphColors.splice(0,1);
                        e.ui.wire.Digital(pin, probe);
                        e.ui.button.on(probe);
                        //e.ui.button.off(probe);
                        e.ui.button.createOutput();
                        listen(true, 'hoverPin');
                        listen(true, 'clickPin');
                    }
                    else if (probe.name === "output"){
                        pin.color = probe.graphColors[0];
                        probe.graphColors.splice(0,1);
                        e.ui.wire.Digital(pin, probe);
                        //output button for input probe.
                        if (probe.input === "on"){
                            listen(true, 'hoverButton');
                        }
                        //output probe.
                        else {
                            e.ui.button.on(probe); 
                            pin.input = "none";
                            e.ui.bar.create(probe, pin);
                            e.ui.bar.draw();
                            listen(true, 'hoverButton');
                        }
                    }
                    else {
                        pin.color = probe.graphColors[0];
                        probe.graphColors.splice(0,1);
                        e.ui.wire.Digital(pin, probe); 
                        e.ui.button.on(probe);
                        //e.ui.button.off(probe);
                        e.ui.bar.create(probe, pin);
                        e.ui.bar.draw();
                        listen(true, 'hoverButton');
                    }
                }

                //draw wire line of current probe beside axis graph
                e.ui.wire.drawToGraph(pin);
            }
            //if user select a pin not related to the probe
            else {
                if (probe.input !== "on") {
                    e.ui.loop.clearProbe();
                    listen(true, 'hoverButton');
                }
                else {
                    listen(true, 'hoverPin');
                } 
            }
        }
    }

    function hoverSlider(event) {

    }

    function zooming(event) {

    }

    function stop(event) {

    }

    function record(event) {

    }

    return {
        'get': function() {
            if (!e) {
                e = init();
            }
            return e;
        }
    };
})();

function bbui() {
    Events.get();
}

// https://inspirit.github.io/jsfeat/sample_oflow_lk.html

// Note: used Copilot to add Rule of Thirds grid (from rule_of_thirds example), convex hull divisions, and color highlighting
// Based on convex hull division code found here: https://editor.p5js.org/JeromePaddick/sketches/WmB2XRY8N

var cnv;
var capture;
var curpyr, prevpyr, pointCount, pointStatus, prevxy, curxy;
var w = 640,
    h = 480;
var maxPoints = 1000;
var showGrid = true; // Toggle for rule of thirds grid
var showConvexHull = false; // Toggle for convex hull
var targetColor = null; // Selected color for region tracking
var colorThreshold = 40; // How close colors need to be to match
var showColorRegion = false; // Toggle for color region highlighting
var selectColorMode = false; // Toggle for color selection mode

function setup() {
    capture = createCapture({
        audio: false,
        video: {
            width: w,
            height: h
        }
    }, function() {
        console.log('capture ready.')
    });
    capture.elt.setAttribute('playsinline', '');
    cnv = createCanvas(w, h);
    capture.size(w, h);
    capture.hide();

    curpyr = new jsfeat.pyramid_t(3);
    prevpyr = new jsfeat.pyramid_t(3);
    curpyr.allocate(w, h, jsfeat.U8C1_t);
    prevpyr.allocate(w, h, jsfeat.U8C1_t);

    pointCount = 0;
    pointStatus = new Uint8Array(maxPoints);
    prevxy = new Float32Array(maxPoints * 2);
    curxy = new Float32Array(maxPoints * 2);
}

function keyPressed() {
    // Press 'g' to toggle grid
    if (key === 'g' || key === 'G') {
        showGrid = !showGrid;
        console.log('Grid:', showGrid ? 'ON' : 'OFF');
        return false; // prevent default behavior
    } 
    // Press 'c' to toggle convex hull
    else if (key === 'c' || key === 'C') {
        showConvexHull = !showConvexHull;
        console.log('Convex Hull:', showConvexHull ? 'ON' : 'OFF');
        return false;
    }
    // Press 'h' to toggle color region highlighting
    else if (key === 'h' || key === 'H') {
        showColorRegion = !showColorRegion;
        console.log('Color Region:', showColorRegion ? 'ON' : 'OFF');
        return false;
    }
    // Press 'r' to reset color selection
    else if (key === 'r' || key === 'R') {
        targetColor = null;
        console.log('Color selection reset');
        return false;
    }
    // Press 's' to toggle color selection mode
    else if (key === 's' || key === 'S') {
        selectColorMode = !selectColorMode;
        console.log('Color Selection Mode:', selectColorMode ? 'ON - Click to select a color' : 'OFF');
        return false;
    }
    // Press any other key to add random points
    else {
        for (var i = 0; i < 100; i++) {
            addPoint(random(width), random(height));
        }
    }
}

function mousePressed(event) {
    if (mouseX >= 0 && mouseX < w && mouseY >= 0 && mouseY < h) {
        // If in color selection mode, select the color at this location
        if (selectColorMode) {
            capture.loadPixels();
            let index = (mouseY * w + mouseX) * 4;
            targetColor = {
                r: capture.pixels[index],
                g: capture.pixels[index + 1],
                b: capture.pixels[index + 2]
            };
            console.log('Selected color:', targetColor);
            selectColorMode = false; // Auto-exit selection mode after selecting
            console.log('Color Selection Mode: OFF');
            return false; // Prevent default behavior
        } else {
            // Regular point tracking
            addPoint(mouseX, mouseY);
        }
    }
}

function addPoint(x, y) {
    if (pointCount < maxPoints) {
        var pointIndex = pointCount * 2;
        curxy[pointIndex] = x;
        curxy[pointIndex + 1] = y;
        pointCount++;
    }
}

function prunePoints() {
    var outputPoint = 0;
    for (var inputPoint = 0; inputPoint < pointCount; inputPoint++) {
        if (pointStatus[inputPoint] == 1) {
            if (outputPoint < inputPoint) {
                var inputIndex = inputPoint * 2;
                var outputIndex = outputPoint * 2;
                curxy[outputIndex] = curxy[inputIndex];
                curxy[outputIndex + 1] = curxy[inputIndex + 1];
            }
            outputPoint++;
        }
    }
    pointCount = outputPoint;
}

// Color Region Helper Functions
function colorMatches(r, g, b) {
    if (!targetColor) return false;
    
    let distance = Math.sqrt(
        Math.pow(r - targetColor.r, 2) +
        Math.pow(g - targetColor.g, 2) +
        Math.pow(b - targetColor.b, 2)
    );
    
    return distance < colorThreshold;
}

function highlightColorRegions() {
    if (!targetColor || !showColorRegion) return;
    
    capture.loadPixels();
    
    // Draw semi-transparent yellow rectangles over matching pixels
    noStroke();
    fill(255, 255, 0, 100); // Yellow with transparency
    
    let step = 5; // Check every 5 pixels for speed
    for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
            let index = (y * w + x) * 4;
            let r = capture.pixels[index];
            let g = capture.pixels[index + 1];
            let b = capture.pixels[index + 2];
            
            if (colorMatches(r, g, b)) {
                rect(x, y, step, step);
            }
        }
    }
}

// Convex Hull Helper Functions
function getConvexHullPoints() {
    if (pointCount < 3) return [];
    
    // Convert tracked points to array of objects with pos property
    let nodes = [];
    for (let i = 0; i < pointCount; i++) {
        let pointOffset = i * 2;
        nodes.push({
            pos: createVector(curxy[pointOffset], curxy[pointOffset + 1])
        });
    }
    
    // Sort nodes by x position
    nodes.sort((a, b) => a.pos.x - b.pos.x);
    
    let conHullNodes = [];
    let original = 0;
    let prev = original;
    conHullNodes.push(nodes[original]);
    let index = 1;
    
    // Limited iterations for safety
    for (let i = 0; i < 50; i++) {
        let xProds = [];
        let indexVertex = getVertex(nodes[prev], nodes[index]);
        
        for (let j = 0; j < nodes.length; j++) {
            if (j == index || j == prev) continue;
            
            let otherVertex = getVertex(nodes[prev], nodes[j]);
            xProds.push([j, getRelativeAngle(
                indexVertex.copy().div(indexVertex.mag()),
                otherVertex.copy().div(otherVertex.mag())
            )]);
        }
        
        let [maxIndex, maxValue] = maxIndexValue(xProds);
        if (maxValue < 0) {
            maxIndex = index;
        }
        
        conHullNodes.push(nodes[maxIndex]);
        
        if (maxIndex == original) break;
        
        prev = maxIndex;
        index = 0;
        if (index == prev) index = 1;
    }
    
    return conHullNodes;
}

function getVertex(origin, point) {
    return point.pos.copy().sub(origin.pos);
}

function getRelativeAngle(a, b) {
    let clock = p5.Vector.cross(a, b).z > 0 ? 1 : -1;
    return clock * (1 - p5.Vector.dot(a, b));
}

function maxIndexValue(arr) {
    if (arr.length === 0) return [-1, 0];
    
    let max = arr[0][1];
    let maxIndex = arr[0][0];
    
    for (let i = 1; i < arr.length; i++) {
        if (arr[i][1] > max) {
            maxIndex = arr[i][0];
            max = arr[i][1];
        }
    }
    
    return [maxIndex, max];
}

function drawConvexHull(hullNodes) {
    if (hullNodes.length < 2) return;
    
    stroke(0, 255, 0, 200); // Green with transparency
    strokeWeight(2);
    noFill();
    
    beginShape();
    for (let node of hullNodes) {
        vertex(node.pos.x, node.pos.y);
    }
    endShape(CLOSE);
}

function drawRuleOfThirds() {
    // Draw rule of thirds grid overlay
    stroke(255, 255, 0, 150); // Semi-transparent yellow
    strokeWeight(2);
    
    // Vertical lines at 1/3 and 2/3
    line(w / 3, 0, w / 3, h);
    line((w * 2) / 3, 0, (w * 2) / 3, h);
    
    // Horizontal lines at 1/3 and 2/3
    line(0, h / 3, w, h / 3);
    line(0, (h * 2) / 3, w, (h * 2) / 3);
    
    // Draw intersection points (power points)
    fill(255, 255, 0, 150);
    noStroke();
    let intersections = [
        [w / 3, h / 3],
        [(w * 2) / 3, h / 3],
        [w / 3, (h * 2) / 3],
        [(w * 2) / 3, (h * 2) / 3]
    ];
    
    for (let point of intersections) {
        ellipse(point[0], point[1], 10, 10);
    }
}

function draw() {
    image(capture, 0, 0, w, h);
    
    // Highlight color regions if enabled
    highlightColorRegions();
    
    capture.loadPixels();
    if (capture.pixels.length > 0) { // don't forget this!
        var xyswap = prevxy;
        prevxy = curxy;
        curxy = xyswap;
        var pyrswap = prevpyr;
        prevpyr = curpyr;
        curpyr = pyrswap;

        // these are options worth breaking out and exploring
        var winSize = 20;
        var maxIterations = 30;
        var epsilon = 0.01;
        var minEigen = 0.001;

        jsfeat.imgproc.grayscale(capture.pixels, w, h, curpyr.data[0]);
        curpyr.build(curpyr.data[0], true);
        jsfeat.optical_flow_lk.track(
            prevpyr, curpyr,
            prevxy, curxy,
            pointCount,
            winSize, maxIterations,
            pointStatus,
            epsilon, minEigen);
        prunePoints();

        for (var i = 0; i < pointCount; i++) {
            var pointOffset = i * 2;
            ellipse(curxy[pointOffset], curxy[pointOffset + 1], 8, 8);
        }
    }

    // Draw convex hull if enabled
    if (showConvexHull && pointCount >= 3) {
        let hullNodes = getConvexHullPoints();
        drawConvexHull(hullNodes);
    }

    if (showGrid) {
        drawRuleOfThirds();
    }
    
    // Show indicator when in color selection mode
    if (selectColorMode) {
        fill(255, 255, 0);
        noStroke();
        textSize(16);
        textAlign(LEFT, TOP);
        text('COLOR SELECTION MODE - Click to select a color', 10, 10);
    }
}
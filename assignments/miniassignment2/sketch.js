// Extended from Complementary Color Example

let innerRadius = 100; // hole size
let outerRadius = 200; // hole size

let steps = 360/15; // resolution

function setup() {
  createCanvas(1400, 800);
  colorMode(HSB, 360, 100, 100);
  noStroke();
}

function draw() {
  background(100);

  // HSB Wheel
  push();
  drawHSBRing(width/4, height/2+50);
  
  // Map mouseX to hue (0–360)
  let baseHue = map(mouseX, 0, width, 0, 360);
  let baseSaturation = map(mouseY, 0, height, 0, 100);

  let squareWidth = width/2;

  // Square 1: base hue
  fill(baseHue, baseSaturation, 100);
  rect(0, 0, squareWidth/2, height/4);
  drawColorPosition(baseHue);

  push();
  fill(0);          
  textSize(20);     
  textAlign(CENTER);  
  text(`H: ${round(baseHue)}`, squareWidth/4, 75);
  text(`S: ${round(baseSaturation)}`, squareWidth/4, 100);
  text(`B: 100`, squareWidth/4, 125);
  pop();

  // Square 2: base + 30
  fill(baseHue + 180, baseSaturation, 100);
  rect(squareWidth/2, 0, squareWidth/2, height/4);
  drawColorPosition(baseHue + 180);

  push();
  fill(0);          
  textSize(20);     
  textAlign(CENTER);  
  text(`H: ${round(baseHue + 180)}`, 3*squareWidth/4, 75);
  text(`S: ${round(baseSaturation)}`, 3*squareWidth/4, 100);
  text(`B: 100`, 3*squareWidth/4, 125);
  pop();

  pop();

  // RGB Ring
  push();
  drawRGBRing(3*width/4, height/2+50);

  let squareWidth2 = width;

  // Compute the RGB color from mouse position's angle; used ChatGPT to help create this function
  function rgbFromAngle(angle) {
    let r = map(sin(radians(angle)), -1, 1, 0, 255);
    let g = map(sin(radians(angle + 120)), -1, 1, 0, 255);
    let b = map(sin(radians(angle + 240)), -1, 1, 0, 255);
    return color(r, g, b);
  }

  // Base color
  colorMode(RGB, 255);
  color1 = rgbFromAngle(baseHue)
  fill(color1);
  rect(squareWidth2/2, 0, squareWidth2/4, height/4);
  drawColorPosition(baseHue);

  push();
  fill(0);          
  textSize(20);     
  textAlign(CENTER);  
  text(`R: ${round(red(color1))}`, 5*squareWidth2/8, 75)
  text(`G: ${round(green(color1))}`, 5*squareWidth2/8, 100)
  text(`B: ${round(blue(color1))}`, 5*squareWidth2/8, 125)
  pop();

  // Complementary color (base + 180)
  color2 = rgbFromAngle(baseHue + 180)
  fill(color2);
  rect(3*squareWidth2/4, 0, squareWidth2/4, height/4);
  drawColorPosition(baseHue + 180);

  push();
  fill(0);          
  textSize(20);     
  textAlign(CENTER);  
  text(`R: ${round(red(color2))}`, 7*squareWidth2/8, 75)
  text(`G: ${round(green(color2))}`, 7*squareWidth2/8, 100)
  text(`B: ${round(blue(color2))}`, 7*squareWidth2/8, 125)
  pop();

  pop();

  // Instructions
  push();
  fill(0);          
  textSize(20);
  textAlign(CENTER);  
  text("Move mouse left-to-right to change the hue or up-and-down to change the saturation.", width/2, height-60);
  pop();
}


function drawColorPosition(hue){
  push();
  translate(width/4, height/2+50); 
  let x1 = cos(radians(hue)) * (innerRadius+(outerRadius-innerRadius)/2);
  let y1 = sin(radians(hue)) * (innerRadius+(outerRadius-innerRadius)/2);
  fill(0);
  ellipse(x1, y1, 20,20);
  pop();

  push();
  translate(3*width/4, height/2+50); 
  let x2 = cos(radians(hue)) * (innerRadius+(outerRadius-innerRadius)/2);
  let y2 = sin(radians(hue)) * (innerRadius+(outerRadius-innerRadius)/2);
  fill(0);
  ellipse(x2, y2, 20,20);
  pop();
}

function drawHSBRing(width, height){
  push();
  colorMode(HSB, 360, 100, 100);
  translate(width, height);

  push();
  fill(0);          
  textSize(20);     
  textAlign(CENTER);  
  text("HSB", 0, 0);
  text("Color Wheel", 0, 20);
  pop();

  for (let angle = 0; angle < 360; angle+=steps) {
    let nextAngle = angle + steps;

    // Outer edge points
    let x1 = cos(radians(angle)) * outerRadius;
    let y1 = sin(radians(angle)) * outerRadius;
    let x2 = cos(radians(nextAngle)) * outerRadius;
    let y2 = sin(radians(nextAngle)) * outerRadius;

    // Inner edge points
    let x3 = cos(radians(nextAngle)) * innerRadius;
    let y3 = sin(radians(nextAngle)) * innerRadius;
    let x4 = cos(radians(angle)) * innerRadius;
    let y4 = sin(radians(angle)) * innerRadius;

    fill(angle, 100, 100);
    quad(x1, y1, x2, y2, x3, y3, x4, y4);
   
  }
  pop();
}

function drawRGBRing(width, height){
  push();
  colorMode(RGB, 255);
  translate(width, height);

  push();
  fill(0);          
  textSize(20);     
  textAlign(CENTER);  
  text("RGB", 0, 0);
  text("Color Wheel", 0, 20);
  pop();

  let RGB_steps = 5;

  for (let angle = 0; angle < 360; angle += RGB_steps) {
    let nextAngle = angle + RGB_steps;

    let r = map(sin(radians(angle)), -1, 1, 0, 255);
    let g = map(sin(radians(angle + 120)), -1, 1, 0, 255);
    let b = map(sin(radians(angle + 240)), -1, 1, 0, 255);

    // Outer edge points
    let x1 = cos(radians(angle)) * outerRadius;
    let y1 = sin(radians(angle)) * outerRadius;
    let x2 = cos(radians(nextAngle)) * outerRadius;
    let y2 = sin(radians(nextAngle)) * outerRadius;

    // Inner edge points
    let x3 = cos(radians(nextAngle)) * innerRadius;
    let y3 = sin(radians(nextAngle)) * innerRadius;
    let x4 = cos(radians(angle)) * innerRadius;
    let y4 = sin(radians(angle)) * innerRadius;

    fill(r, g, b);
    quad(x1, y1, x2, y2, x3, y3, x4, y4);
  }

  pop();
}

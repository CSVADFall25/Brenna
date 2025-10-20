// Modified code from Steve's Makerspace "Watercolor Painting App", https://youtu.be/UpYfjZgxwP0
// Pick your color, slider for brush size, "s" to save a jpg.

let defaultTime = 0.0012; // large = quick dry
let runnyColors = false;
let backgrd = 255; // 255 white; 0 black
let smallCanvas = true;
let state;
dryTime = defaultTime;
let prevMouseX, prevMouseY;
let sliderDrops, buttonDry, buttonWet, buttonDefault;
let colorPicker;
let currColor;
let paint = [];
let tempPaint1 = [];
let tempPaint2 = [];

let screenWidth;
let screenHeight;

let filterStep = 0;

class PaletteBox {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = [random(255), random(255), random(255)];
    this.div = null;
    this.createDiv();
    this.updateColor(); // update color to match default opacity
  }

  createDiv() {
    // Create HTML div element
    this.div = createDiv('');
    this.div.position(this.x, this.y);
    this.div.size(this.width, this.height);
    let colorString = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
    this.div.style('background-color', colorString);
    this.div.style('cursor', 'pointer');
    
    // Add click handler
    this.div.mousePressed(() => this.onClick());
  }

  updateColor(opacity = 0.55) {
    let colorString = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${opacity})`;
    this.div.style('background-color', colorString);
  }

  onClick() {
    // When clicked, set the color picker to this palette color
    let c = color(this.color[0], this.color[1], this.color[2]);

    let r = Math.floor(this.color[0]).toString(16).padStart(2, '0');
    let g = Math.floor(this.color[1]).toString(16).padStart(2, '0');
    let b = Math.floor(this.color[2]).toString(16).padStart(2, '0');
    let hexColor = `#${r}${g}${b}`;
    colorPicker.value(hexColor);
  }

}

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth/2, windowHeight/2); // watercolor canvas area
  background(255);
  
  screenWidth = windowWidth; // 1440
  screenHeight = windowHeight; // 778

  // Set color picker
  colorPicker = createColorPicker("#ed225d");
  colorPicker.position(200, 450);

  // Paint drop slider
  sliderDrops = createSlider(5, 100, 50);
  sliderDrops.position(70, height + 5);

  buttonDry = createButton("Dry All");
  buttonDry.position(210, height + 5);
  buttonWet = createButton("Keep Wet");
  buttonWet.position(270, height + 5);
  buttonDefault = createButton("Default Dry");
  buttonDefault.position(350, height + 5);
  state = createElement("state", "Default");
  state.position(450, height + 5);

  // Create skill level radio button
  skillRadioButton = createRadio(150);
  skillRadioButton.size(86);
  skillRadioButton.position(screenWidth/2+490, screenHeight/2+8);
  skillRadioButton.option('Beginner');
  skillRadioButton.option('Novice');
  skillRadioButton.option('Advanced');
  // skillRadioButton.selected('Beginner'); // default

  refImageText = createP("Don't know where to start? Select your watercoloring skill level here: ")
  refImageText.position(screenWidth/2+10, screenHeight/2-10);
  refImageText.style('font-size', '17px');

  // Initiailize palette boxes
  paletteBoxes = [];
  paletteBox1 = new PaletteBox(50, 500, 120, 70);
  paletteBox2 = new PaletteBox(186, 500, 120, 70);
  paletteBox3 = new PaletteBox(50, 575, 120, 70);
  paletteBox4 = new PaletteBox(186, 575, 120, 70);
  paletteBox5 = new PaletteBox(50, 650, 120, 70);
  paletteBox6 = new PaletteBox(186, 650, 120, 70);
  paletteBoxes.push(paletteBox1, paletteBox2, paletteBox3, paletteBox4, paletteBox5, paletteBox6);

  addColorButton = createButton("Add Color to Palette");
  addColorButton.position(50, 452);

  // Start with white (or black) background for watercolor area
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      paint.push(backgrd, backgrd, backgrd, 0);
    }
  }
  tempPaint1 = paint; 
  tempPaint2 = paint;
}

function draw() {
  buttonDry.mousePressed(dry);
  buttonWet.mousePressed(wet);
  buttonDefault.mousePressed(defaultDry);
  paintDrop = sliderDrops.value();
  currColor = colorPicker.color();
  addColorButton.mousePressed(addColorToPalette);

  // Update palette box transparency based on slider
  let opacity = map(paintDrop, 5, 100, 0.5, 0.6); // Lower paintDrop = more transparent
  paletteBox1.updateColor(opacity);
  paletteBox2.updateColor(opacity);
  paletteBox3.updateColor(opacity);
  paletteBox4.updateColor(opacity);
  paletteBox5.updateColor(opacity);
  paletteBox6.updateColor(opacity);
  

  addPaint(); // Add paint to pixels when drawing
  update(); // Spread watercolor paint
  render(); // Render painting

  let c = skillRadioButton.value();
  if (c == "Beginner") {
    refImg = createImg("assets/beginner.jpg");
    refImg.position(screenWidth/2 + 10, 0);
    refImg.size(screenWidth/2, screenHeight/2);
  }
  else if (c == "Novice") {
    refImg = createImg("assets/novice.jpg");
    refImg.position(screenWidth/2 + 10, 0);
    refImg.size(screenWidth/2, screenHeight/2);
  }
  else if (c == "Advanced") {
    refImg = createImg("assets/advanced.jpg");
    refImg.position(screenWidth/2 + 10, 0);
    refImg.size(screenWidth/2, screenHeight/2);
  }

  // Animate filter transitions
  if (frameCount % 360 === 0) filterStep = (filterStep + 1) % 5;

  switch (filterStep) {
    case 0: break;
    case 1: filter(BLUR, 2); break;
    case 2: filter(POSTERIZE, 3); break;
    case 3: filter(INVERT); break;
    case 4: filter(GRAY); break;
  }

}

function dry() {
  dryTime = 1000;
  state.html("Dry");
}
function wet() {
  dryTime = 0.0001;
  state.html("Wet");
}
function defaultDry() {
  dryTime = defaultTime;
  state.html("Default");
}

function addColorToPalette() {
  let c = colorPicker.color();
  let r = c.levels[0];
  let g = c.levels[1];
  let b = c.levels[2];

  let oldestBox = paletteBoxes.shift();
  oldestBox.color = [r, g, b];
  let opacity = map(paintDrop, 5, 100, 0.5, 0.6);
  oldestBox.updateColor(opacity);
  paletteBoxes.push(oldestBox);
}

// Add paint when clicking/dragging
function addPaint() {
  if (
    mouseIsPressed &&
    mouseX >= 0 &&
    mouseX <= width &&
    mouseY >= 0 &&
    mouseY <= height
  ) {
    let distance = dist(prevMouseX, prevMouseY, mouseX, mouseY);
    let numPoints = floor(distance / 1); // larger number = more gaps and fewer points; these two lines from George Profenza, noted below.
    drawLinePoints(prevMouseX, prevMouseY, mouseX, mouseY, numPoints);

    // add paint when clicking in one place
    if (mouseX == prevMouseX && mouseY == prevMouseY) {
      renderPoints(mouseX, mouseY);
    }
  }
  prevMouseX = mouseX;
  prevMouseY = mouseY;
  // preventing a wrap around error when dragging off canvas and back on
  if (mouseIsPressed && mouseX < 0) {
    prevMouseX = 0;
  }
  if (mouseIsPressed && mouseX > width - 1) {
    prevMouseX = width - 1;
  }
  if (mouseIsPressed && mouseY < 0) {
    prevMouseY = 0;
  }
  if (mouseIsPressed && mouseY > height - 1) {
    prevMouseY = height - 1;
  }
}

// Calculate points when dragging
// This function from George Profenza on stackoverflow https://stackoverflow.com/questions/63959181/how-do-you-draw-a-line-in-a-pixel-array
function drawLinePoints(x1, y1, x2, y2, points) {
  for (let i = 0; i < points; i++) {
    let t = map(i, 0, points, 0.0, 1.0);
    let x = round(lerp(x1, x2, t));
    let y = round(lerp(y1, y2, t));
    renderPoints(x, y);
  }
}

// Replace pixels when drawing
function renderPoints(x, y) {
  let arrayPos = (x + y * width) * 4;
  let newR = (paint[arrayPos + 0] + currColor.levels[0]) / 2;
  let newG = (paint[arrayPos + 1] + currColor.levels[1]) / 2;
  let newB = (paint[arrayPos + 2] + currColor.levels[2]) / 2;
  let newN = paint[arrayPos + 3] + paintDrop;
  paint.splice(arrayPos, 4, newR, newG, newB, newN); // replace the current pixel color with the newly calculated color
}

// if there's a lot of color in one place, spread it around
function update() {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let arrayPos = (x + y * width) * 4;
      if (paint[arrayPos + 3] > 4) {
        tempPaint1[arrayPos + 3] = paint[arrayPos + 3] - 4;

        // mix pixel to right
        if (x < width - 1) {
          tempPaint1[arrayPos + 4] =
            (paint[arrayPos + 4] + paint[arrayPos]) / 2;
          tempPaint1[arrayPos + 5] =
            (paint[arrayPos + 5] + paint[arrayPos + 1]) / 2;
          tempPaint1[arrayPos + 6] =
            (paint[arrayPos + 6] + paint[arrayPos + 2]) / 2;
          tempPaint1[arrayPos + 7] = paint[arrayPos + 7] + 1;
        }

        // mix pixel to left
        if (x > 0) {
          tempPaint1[arrayPos - 4] =
            (paint[arrayPos - 4] + paint[arrayPos]) / 2;
          tempPaint1[arrayPos - 3] =
            (paint[arrayPos - 3] + paint[arrayPos + 1]) / 2;
          tempPaint1[arrayPos - 2] =
            (paint[arrayPos - 2] + paint[arrayPos + 2]) / 2;
          tempPaint1[arrayPos - 1] = paint[arrayPos - 1] + 1;
        }

        // mix pixel below
        tempPaint1[arrayPos + width * 4] =
          (paint[arrayPos + width * 4] + paint[arrayPos]) / 2;
        tempPaint1[arrayPos + width * 4 + 1] =
          (paint[arrayPos + width * 4 + 1] + paint[arrayPos + 1]) / 2;
        tempPaint1[arrayPos + width * 4 + 2] =
          (paint[arrayPos + width * 4 + 2] + paint[arrayPos + 2]) / 2;
        tempPaint1[arrayPos + width * 4 + 3] =
          paint[arrayPos + width * 4 + 3] + 1;

        // mix pixel above
        tempPaint1[arrayPos - width * 4] =
          (paint[arrayPos - width * 4] + paint[arrayPos]) / 2;
        tempPaint1[arrayPos - width * 4 + 1] =
          (paint[arrayPos - width * 4 + 1] + paint[arrayPos + 1]) / 2;
        tempPaint1[arrayPos - width * 4 + 2] =
          (paint[arrayPos - width * 4 + 2] + paint[arrayPos + 2]) / 2;
        tempPaint1[arrayPos - width * 4 + 3] =
          paint[arrayPos - width * 4 + 3] + 1;
      }

      // gradually dry paint
      tempPaint1[arrayPos + 3] = paint[arrayPos + 3] - dryTime;
      if (tempPaint1[arrayPos + 3] < 0) {
        tempPaint1[arrayPos + 3] = 0;
      }
    }
  }
  
  if (runnyColors == true){
    paint = tempPaint1;
  }
    else {
  for (let x = width; x > 0; x--) {
    for (let y = height; y > 0; y--) {
      let arrayPos = (x + y * width) * 4;
      if (paint[arrayPos + 3] > 4) {
        tempPaint2[arrayPos + 3] = paint[arrayPos + 3] - 4;

        // mix pixel to right
        if (x < width - 1) {
          tempPaint2[arrayPos + 4] =
            (paint[arrayPos + 4] + paint[arrayPos]) / 2;
          tempPaint2[arrayPos + 5] =
            (paint[arrayPos + 5] + paint[arrayPos + 1]) / 2;
          tempPaint2[arrayPos + 6] =
            (paint[arrayPos + 6] + paint[arrayPos + 2]) / 2;
          tempPaint2[arrayPos + 7] = paint[arrayPos + 7] + 1;
        }

        // mix pixel to left
        if (x > 0) {
          tempPaint2[arrayPos - 4] =
            (paint[arrayPos - 4] + paint[arrayPos]) / 2;
          tempPaint2[arrayPos - 3] =
            (paint[arrayPos - 3] + paint[arrayPos + 1]) / 2;
          tempPaint2[arrayPos - 2] =
            (paint[arrayPos - 2] + paint[arrayPos + 2]) / 2;
          tempPaint2[arrayPos - 1] = paint[arrayPos - 1] + 1;
        }

        // mix pixel below
        tempPaint2[arrayPos + width * 4] =
          (paint[arrayPos + width * 4] + paint[arrayPos]) / 2;
        tempPaint2[arrayPos + width * 4 + 1] =
          (paint[arrayPos + width * 4 + 1] + paint[arrayPos + 1]) / 2;
        tempPaint2[arrayPos + width * 4 + 2] =
          (paint[arrayPos + width * 4 + 2] + paint[arrayPos + 2]) / 2;
        tempPaint2[arrayPos + width * 4 + 3] =
          paint[arrayPos + width * 4 + 3] + 1;

        // mix pixel above
        tempPaint2[arrayPos - width * 4] =
          (paint[arrayPos - width * 4] + paint[arrayPos]) / 2;
        tempPaint2[arrayPos - width * 4 + 1] =
          (paint[arrayPos - width * 4 + 1] + paint[arrayPos + 1]) / 2;
        tempPaint2[arrayPos - width * 4 + 2] =
          (paint[arrayPos - width * 4 + 2] + paint[arrayPos + 2]) / 2;
        tempPaint2[arrayPos - width * 4 + 3] =
          paint[arrayPos - width * 4 + 3] + 1;
      }

      // gradually dry paint
      tempPaint2[arrayPos + 3] = paint[arrayPos + 3] - dryTime;
      if (tempPaint2[arrayPos + 3] < 0) {
        tempPaint2[arrayPos + 3] = 0;
      }
    }
  }
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let arrayPos = (x + y * width) * 4;
      paint[arrayPos] = (tempPaint1[arrayPos] + tempPaint2[arrayPos]) / 2;
    }
  }
}
}

// Render all updated pixels
function render() {
  loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let pix = (x + y * width) * 4;
      let arrayPos = (x + y * width) * 4;
      pixels[pix] = paint[arrayPos];
      pixels[pix + 1] = paint[arrayPos + 1];
      pixels[pix + 2] = paint[arrayPos + 2];
    }
  }
  updatePixels();
}

// Save art as jpg
function keyTyped() {
  if (key === "s") {
    save("watercolorArtwork.jpg");
  }
}

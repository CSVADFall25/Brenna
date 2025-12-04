// Brenna Scholte & Ally Chu
// Used with the help of GitHub Copilot

let canvasWidth;
let canvasHeight;

// Toolbar variables
let toolbarHeight = 80;
let toolbarBgColor;
let addTextBtn;
let addImageBtn;
let addShapeBtn;
let drawBtn;
let stickersBtn;
let changeBgBtn;
let colorPicker;

// Scrapbook area variables
let scrapbookX;
let scrapbookY;
let scrapbookWidth;
let scrapbookHeight;
let scrapbookBgColor;

// Text elements array
let textElements = [];
let selectedText = null;

// TextElement class
class TextElement {
  constructor(content, x, y, size, color) {
    this.content = content;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.dragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
  }
  
  display() {
    fill(this.color);
    noStroke();
    textSize(this.size);
    textAlign(LEFT, TOP);
    text(this.content, this.x, this.y);
  }
  
  isMouseOver() {
    push();
    textSize(this.size);
    let w = textWidth(this.content);
    pop();
    let h = this.size;
    return mouseX >= this.x && mouseX <= this.x + w &&
           mouseY >= this.y && mouseY <= this.y + h;
  }
  
  startDrag() {
    if (this.isMouseOver()) {
      this.dragging = true;
      this.offsetX = this.x - mouseX;
      this.offsetY = this.y - mouseY;
      return true;
    }
    return false;
  }
  
  drag() {
    if (this.dragging) {
      this.x = mouseX + this.offsetX;
      this.y = mouseY + this.offsetY;
    }
  }
  
  stopDrag() {
    this.dragging = false;
  }
}

function setup() {
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;
  createCanvas(canvasWidth, canvasHeight);
  
  // Initialize colors
  toolbarBgColor = color(70, 70, 80);
  scrapbookBgColor = 'white';
  
  // Calculate scrapbook dimensions
  scrapbookWidth = 800;
  scrapbookHeight = 600;
  scrapbookX = (canvasWidth - scrapbookWidth) / 2;
  scrapbookY = toolbarHeight + 40;
  
  // Create toolbar buttons
  setupToolbarButtons();
}

function setupToolbarButtons() {
  let toolX = 250;
  let toolSpacing = 120;
  let buttonY = 20;
  let buttonWidth = 100;
  
  // Add Text button
  addTextBtn = createButton('Add Text');
  addTextBtn.position(toolX, buttonY);
  addTextBtn.size(buttonWidth, 40);
  addTextBtn.style('font-size', '14px');
  addTextBtn.style('background-color', '#ddd');
  addTextBtn.style('border', 'none');
  addTextBtn.style('border-radius', '5px');
  addTextBtn.style('cursor', 'pointer');
  addTextBtn.mousePressed(addText);
  
  // Add Image button
  addImageBtn = createButton('Add Image');
  addImageBtn.position(toolX + toolSpacing, buttonY);
  addImageBtn.size(buttonWidth, 40);
  addImageBtn.style('font-size', '14px');
  addImageBtn.style('background-color', '#ddd');
  addImageBtn.style('border', 'none');
  addImageBtn.style('border-radius', '5px');
  addImageBtn.style('cursor', 'pointer');
  
  // Add Shape button
  addShapeBtn = createButton('Add Shape');
  addShapeBtn.position(toolX + toolSpacing * 2, buttonY);
  addShapeBtn.size(buttonWidth, 40);
  addShapeBtn.style('font-size', '14px');
  addShapeBtn.style('background-color', '#ddd');
  addShapeBtn.style('border', 'none');
  addShapeBtn.style('border-radius', '5px');
  addShapeBtn.style('cursor', 'pointer');
  
  // Draw button
  drawBtn = createButton('Draw');
  drawBtn.position(toolX + toolSpacing * 3, buttonY);
  drawBtn.size(buttonWidth, 40);
  drawBtn.style('font-size', '14px');
  drawBtn.style('background-color', '#ddd');
  drawBtn.style('border', 'none');
  drawBtn.style('border-radius', '5px');
  drawBtn.style('cursor', 'pointer');
  
  // Stickers button
  stickersBtn = createButton('Stickers');
  stickersBtn.position(toolX + toolSpacing * 4, buttonY);
  stickersBtn.size(buttonWidth, 40);
  stickersBtn.style('font-size', '14px');
  stickersBtn.style('background-color', '#ddd');
  stickersBtn.style('border', 'none');
  stickersBtn.style('border-radius', '5px');
  stickersBtn.style('cursor', 'pointer');
  
  // Change Background Color button
  changeBgBtn = createButton('Change Background Color');
  changeBgBtn.position(toolX + toolSpacing * 5, buttonY);
  changeBgBtn.size(150, 40);
  changeBgBtn.style('font-size', '14px');
  changeBgBtn.style('background-color', '#ddd');
  changeBgBtn.style('border', 'none');
  changeBgBtn.style('border-radius', '5px');
  changeBgBtn.style('cursor', 'pointer');
  changeBgBtn.mousePressed(() => {
    scrapbookBgColor = colorPicker.color();
  });
  
  // Color picker
  colorPicker = createColorPicker('white');
  colorPicker.position(toolX + toolSpacing * 6 + 50, buttonY);
  colorPicker.size(40, 40);
  colorPicker.style('border', 'none');
  colorPicker.style('border-radius', '5px');
  colorPicker.style('cursor', 'pointer');
}

function draw() {
  background(220);
  
  // Draw toolbar
  drawToolbar();
  
  // Draw scrapbook area
  drawScrapbook();
}

function drawToolbar() {
  push();
  // Toolbar background
  fill(toolbarBgColor);
  noStroke();
  rect(0, 0, canvasWidth, toolbarHeight);
  
  // Toolbar title
  fill(255);
  textSize(24);
  textAlign(LEFT, CENTER);
  text("Scrapbook Maker", 20, toolbarHeight / 2);
  pop();
}

function drawScrapbook() {
  push();
  // Scrapbook background 
  fill(scrapbookBgColor);
  stroke(150);
  strokeWeight(2);
  rect(scrapbookX, scrapbookY, scrapbookWidth, scrapbookHeight);
  
  // Dot grid
  stroke(180, 180, 180);
  strokeWeight(3);
  let gridSpacing = 50;
  for (let x = scrapbookX; x <= scrapbookX + scrapbookWidth; x += gridSpacing) {
    for (let y = scrapbookY; y <= scrapbookY + scrapbookHeight; y += gridSpacing) {
      point(x, y);
    }
  }
  
  // Draw text elements
  for (let textEl of textElements) {
    textEl.display();
  }
  
  pop();
}

function addText() {
  let userText = prompt('Enter your text:');
  if (userText) {
    // Add text to center of scrapbook
    let textColor = colorPicker.color();
    // If color is white or close to white, use black instead
    if (brightness(textColor) > 90) {
      textColor = color(0);
    }
    let newText = new TextElement(
      userText,
      scrapbookX + scrapbookWidth / 2 - 50,
      scrapbookY + scrapbookHeight / 2,
      24,
      textColor
    );
    textElements.push(newText);
  }
}

function mousePressed() {
  // Check if clicking on a text element
  for (let i = textElements.length - 1; i >= 0; i--) {
    if (textElements[i].startDrag()) {
      selectedText = textElements[i];
      // Move to front
      textElements.splice(i, 1);
      textElements.push(selectedText);
      break;
    }
  }
}

function mouseDragged() {
  if (selectedText) {
    selectedText.drag();
  }
}

function mouseReleased() {
  if (selectedText) {
    selectedText.stopDrag();
    selectedText = null;
  }
}

// Brenna Scholte & Ally Chu
// Used with the help of GitHub Copilot

let canvasWidth;
let canvasHeight;

// Toolbar variables
let toolbarHeight = 160;
let toolbarBgColor;
let addTextBtn;
let addImageBtn;
let addShapeBtn;
let drawBtn;
let stickersBtn;
let changeBgBtn;
let exportBtn;
let colorPicker;
let fontSelector;
let imageFilterSelector;
let imageInput; // hidden file input
let shapeTypeSelector; // dropdown for shape type

// Scrapbook area variables
let scrapbookX;
let scrapbookY;
let scrapbookWidth;
let scrapbookHeight;
let scrapbookBgColor;
let showGrid = true;

// Text elements array
let textElements = [];
let selectedText = null;

// Image elements array
let imageElements = [];
let selectedImage = null;

// Shape elements
let shapeElements = [];
let selectedShape = null;
let shapeMode = false;
let shapeFillSelector;

// Typing mode variables
let typingMode = false;
let currentText = '';
let typingX = 0;
let typingY = 0;

// Image filter editing mode
let filterEditMode = false;
let tempImage = null;

// Sticker library
let stickerLibrary = [];
let stickerPositions = []; // Store scattered positions
let selectedSticker = null; // Currently dragging sticker
let draggingFromLibrary = false;

// Sticker assets from:
// <a href="https://www.flaticon.com/free-stickers/cute" title="cute stickers">Cute stickers created by barnstudio - Flaticon</a>

function preload() {
  // Load all sticker images
  stickerLibrary = [
    { name: 'bread', img: loadImage('assets/bread.png') },
    { name: 'shooting-star', img: loadImage('assets/shooting-star.png') },
    { name: 'emoticon', img: loadImage('assets/emoticon.png') },
    { name: 'love', img: loadImage('assets/love.png') },
    { name: 'lemon', img: loadImage('assets/lemon.png') },
    { name: 'cat', img: loadImage('assets/cat.png') },
    { name: 'socks', img: loadImage('assets/socks.png') }
  ];
} 

// =====================
// TextElement class
// =====================
class TextElement {
  constructor(content, x, y, size, color, font) {
    this.content = content;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.font = font;
    this.dragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
  }
  
  display() {
    textFont(this.font);
    fill(this.color);
    noStroke();
    textSize(this.size);
    textAlign(LEFT, TOP);
    text(this.content, this.x, this.y);
  }
  
  isMouseOver() {
    push();
    textFont(this.font);
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

// =====================
// ImageElement class
// =====================
class ImageElement {
  constructor(img, x, y, w, h, filter, isSticker = false) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.filter = filter;
    this.isSticker = isSticker;
    this.dragging = false;
    this.resizing = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.handleSize = 50;
  }

  display() {
    push();
    image(this.img, this.x, this.y, this.w, this.h);
    pop();
    // no visible resize handle, just the invisible hitbox
  }
  

  isMouseOver() {
    return mouseX >= this.x && mouseX <= this.x + this.w &&
           mouseY >= this.y && mouseY <= this.y + this.h;
  }

  isOverResizeHandle() {
    let hx = this.x + this.w;
    let hy = this.y + this.h;
    return mouseX >= hx - this.handleSize && mouseX <= hx &&
           mouseY >= hy - this.handleSize && mouseY <= hy;
  }

  startDrag() {
    // drag only if over the image but not on the resize handle
    if (this.isMouseOver() && !this.isOverResizeHandle()) {
      this.dragging = true;
      this.offsetX = this.x - mouseX;
      this.offsetY = this.y - mouseY;
      return true;
    }
    return false;
  }

  startResize() {
    if (this.isOverResizeHandle()) {
      this.resizing = true;
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

  resize() {
    if (this.resizing) {
      // simple resize from top-left corner, based on mouse position
      this.w = max(20, mouseX - this.x);
      this.h = max(20, mouseY - this.y);
    }
  }

  stopInteraction() {
    this.dragging = false;
    this.resizing = false;
  }
  
  applyFilter(filterType) {
    this.filter = filterType;
    if (filterType === 'No Filter') return;
    
    // Create a copy and apply filter
    let filtered = this.img.get();
    filtered.loadPixels();
    
    if (filterType === 'Gray') {
      filtered.filter(GRAY);
    } else if (filterType === 'Invert') {
      filtered.filter(INVERT);
    } else if (filterType === 'Threshold') {
      filtered.filter(THRESHOLD);
    } else if (filterType === 'Posterize') {
      filtered.filter(POSTERIZE, 4);
    }
    
    this.img = filtered;
  }
}

// =====================
// ShapeElement class
// =====================
class ShapeElement {
  constructor(x, y, w, h, color, type = 'rectangle', filled = true) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.type = type; // 'rectangle', 'square', 'circle', 'ellipse', 'triangle', 'star'
    this.filled = filled; 
    this.dragging = false;
    this.resizing = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.handleSize = 40;
  }

  display() {
    push();
    if (this.filled) {
      fill(this.color);
      noStroke();
    } else {
      noFill();
      stroke(this.color);
      strokeWeight(4);
    }

    let cx = this.x + this.w / 2;
    let cy = this.y + this.h / 2;
    let size = min(this.w, this.h);

    switch (this.type) {
      case 'rectangle':
        rect(this.x, this.y, this.w, this.h);
        break;
      case 'square': {
        let s = size;
        rect(cx - s / 2, cy - s / 2, s, s);
        break;
      }
      case 'circle': {
        let d = size;
        ellipse(cx, cy, d, d);
        break;
      }
      case 'ellipse':
        ellipse(cx, cy, this.w, this.h);
        break;
      case 'triangle': {
        let bottomY = this.y + this.h;
        triangle(
          cx, this.y,                 // top
          this.x, bottomY,            // bottom left
          this.x + this.w, bottomY    // bottom right
        );
        break;
      }
      case 'star': {
        let outerR = size / 2;
        let innerR = outerR * 0.5;
        this.drawStar(cx, cy, outerR, innerR, 5);
        break;
      }
    }

    pop();

    // show resize handle on hover
  }

  drawStar(cx, cy, outerRadius, innerRadius, numPoints) {
    push();
    beginShape();
    let angleStep = TWO_PI / (numPoints * 2);
    for (let i = 0; i < numPoints * 2; i++) {
      let r = (i % 2 === 0) ? outerRadius : innerRadius;
      let angle = i * angleStep - HALF_PI;
      let sx = cx + cos(angle) * r;
      let sy = cy + sin(angle) * r;
      vertex(sx, sy);
    }
    endShape(CLOSE);
    pop();
  }

  isMouseOver() {
    return mouseX >= this.x && mouseX <= this.x + this.w &&
           mouseY >= this.y && mouseY <= this.y + this.h;
  }

  isOverResizeHandle() {
    let hx = this.x + this.w;
    let hy = this.y + this.h;
    return mouseX >= hx - this.handleSize && mouseX <= hx &&
           mouseY >= hy - this.handleSize && mouseY <= hy;
  }

  startDrag() {
    if (this.isMouseOver() && !this.isOverResizeHandle()) {
      this.dragging = true;
      this.offsetX = this.x - mouseX;
      this.offsetY = this.y - mouseY;
      return true;
    }
    return false;
  }

  startResize() {
    if (this.isOverResizeHandle()) {
      this.resizing = true;
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

  resize() {
    if (this.resizing) {
      this.w = max(20, mouseX - this.x);
      this.h = max(20, mouseY - this.y);

      // keep shapes proportional where it matters
      if (this.type === 'square' || this.type === 'circle' || this.type === 'star') {
        let s = min(this.w, this.h);
        this.w = s;
        this.h = s;
      }
    }
  }

  stopInteraction() {
    this.dragging = false;
    this.resizing = false;
  }
}

// =====================
// Setup
// =====================
function setup() {
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;
  createCanvas(canvasWidth, canvasHeight);
  
  // Initialize colors
  toolbarBgColor = color(70, 70, 80);
  scrapbookBgColor = 'white';
  
  // Calculate scrapbook dimensions
  scrapbookWidth = 900;
  scrapbookHeight = 500;
  scrapbookX = (canvasWidth - scrapbookWidth) / 2;
  scrapbookY = toolbarHeight + 60;
  
  // Hidden file input for images
  imageInput = createFileInput(handleImageFile);
  imageInput.hide();
  
  // Create toolbar buttons
  setupToolbarButtons();
  
  // Initialize sticker positions
  let stickerSize = 60;
  stickerPositions = [
    { sticker: stickerLibrary[0], x: scrapbookX - 90, y: scrapbookY + 40, size: stickerSize },      // bread
    { sticker: stickerLibrary[1], x: scrapbookX - 170, y: scrapbookY + 90, size: stickerSize },     // shooting-star
    { sticker: stickerLibrary[2], x: scrapbookX - 90, y: scrapbookY + 160, size: stickerSize },     // emoticon
    { sticker: stickerLibrary[3], x: scrapbookX - 170, y: scrapbookY + 230, size: stickerSize },    // love
    { sticker: stickerLibrary[4], x: scrapbookX - 90, y: scrapbookY + 290, size: stickerSize },     // lemon
    { sticker: stickerLibrary[5], x: scrapbookX - 170, y: scrapbookY + 390, size: stickerSize },    // cat
    { sticker: stickerLibrary[6], x: scrapbookX - 90, y: scrapbookY + 450, size: stickerSize }      // socks
  ];
}

// =====================
// Setup Toolbar
// =====================
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
  addTextBtn.mousePressed(() => {
    if (filterEditMode) return; // Don't allow if editing image
    typingMode = true;
    currentText = '';
    addTextBtn.style('background-color', '#90EE90');
  });
  
  // Add Image button
  addImageBtn = createButton('Add Image');
  addImageBtn.position(toolX + toolSpacing, buttonY);
  addImageBtn.size(buttonWidth, 40);
  addImageBtn.style('font-size', '14px');
  addImageBtn.style('background-color', '#ddd');
  addImageBtn.style('border', 'none');
  addImageBtn.style('border-radius', '5px');
  addImageBtn.style('cursor', 'pointer');
  addImageBtn.mousePressed(() => {
    if (typingMode) return; // Don't allow if editing text
    filterEditMode = true;
    addImageBtn.style('background-color', '#90EE90');
    imageInput.elt.value = '';
    imageInput.elt.click();
  });
  
  // Add Shape button
  addShapeBtn = createButton('Add Shape');
  addShapeBtn.position(toolX + toolSpacing * 2, buttonY);
  addShapeBtn.size(buttonWidth, 40);
  addShapeBtn.style('font-size', '14px');
  addShapeBtn.style('background-color', '#ddd');
  addShapeBtn.style('border', 'none');
  addShapeBtn.style('border-radius', '5px');
  addShapeBtn.style('cursor', 'pointer');
  addShapeBtn.mousePressed(() => {
    if (typingMode || filterEditMode) return;
    shapeMode = !shapeMode;
    addShapeBtn.style('background-color', shapeMode ? '#90EE90' : '#ddd');
  });
  
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
    let chosenColor = colorPicker.color();
    if (selectedShape) {
      selectedShape.color = chosenColor;
    } else {
      scrapbookBgColor = chosenColor;
    }
  });
  
  // Color picker
  colorPicker = createColorPicker('#000000');
  colorPicker.position(toolX + toolSpacing * 6 + 50, buttonY);
  colorPicker.size(40, 40);
  colorPicker.style('border', 'none');
  colorPicker.style('border-radius', '5px');
  colorPicker.style('cursor', 'pointer');
  
  // Export button
  exportBtn = createButton('Export Scrapbook');
  exportBtn.position(windowWidth - 200, windowHeight - 100);
  exportBtn.size(140, 40);
  exportBtn.style('font-size', '14px');
  exportBtn.style('background-color', '#87CEEB');
  exportBtn.style('border', 'none');
  exportBtn.style('border-radius', '5px');
  exportBtn.style('cursor', 'pointer');
  exportBtn.mousePressed(() => {
    exportScrapbook();
  });
  
  // Font selector (under text button)
  fontSelector = createSelect();
  fontSelector.option('Arial');
  fontSelector.option('Georgia');
  fontSelector.option('Courier New');
  fontSelector.option('Comic Sans MS');
  fontSelector.option('Times New Roman');
  fontSelector.option('Verdana');
  fontSelector.position(toolX, buttonY + 60);
  fontSelector.style('font-size', '12px');
  fontSelector.style('height', '35px');
  fontSelector.style('width', '100px');
  fontSelector.style('cursor', 'pointer');
  
  // Image filter selector (under image button)
  imageFilterSelector = createSelect();
  imageFilterSelector.option('None');
  imageFilterSelector.option('Gray');
  imageFilterSelector.option('Invert');
  imageFilterSelector.option('Threshold');
  imageFilterSelector.option('Posterize');
  imageFilterSelector.position(toolX + toolSpacing, buttonY + 60);
  imageFilterSelector.style('font-size', '12px');
  imageFilterSelector.style('height', '35px');
  imageFilterSelector.style('width', '100px');
  imageFilterSelector.style('cursor', 'pointer');

  // Shape type selector (under Add Shape)
  shapeTypeSelector = createSelect();
  shapeTypeSelector.option('Rectangle');
  shapeTypeSelector.option('Square');
  shapeTypeSelector.option('Circle');
  shapeTypeSelector.option('Ellipse');
  shapeTypeSelector.option('Triangle');
  shapeTypeSelector.option('Star');
  shapeTypeSelector.position(toolX + toolSpacing * 2, buttonY + 60);
  shapeTypeSelector.style('font-size', '12px');
  shapeTypeSelector.style('height', '35px');
  shapeTypeSelector.style('width', '100px');
  shapeTypeSelector.style('cursor', 'pointer');

  shapeFillSelector = createSelect();
  shapeFillSelector.option('Fill');
  shapeFillSelector.option('Outline');
  shapeFillSelector.position(toolX + toolSpacing * 2, buttonY + 90); // ⬇ stacked below
  shapeFillSelector.style('font-size', '12px');
  shapeFillSelector.style('height', '35px');
  shapeFillSelector.style('width', '100px');
  shapeFillSelector.style('cursor', 'pointer');
  
}

// =====================
// Export Scrapbook
// =====================
function exportScrapbook() {
  // Hide grid temporarily
  showGrid = false;
  redraw();

  let scrapbookImage = get(scrapbookX, scrapbookY, scrapbookWidth, scrapbookHeight);
  save(scrapbookImage, 'my-scrapbook.png');
  showGrid = true;
}

// =====================
// File handler for images
// =====================
function handleImageFile(file) {
  if (file.type === 'image') {
    loadImage(file.data, (img) => {
      // Scale image to fit nicely inside scrapbook
      let maxW = scrapbookWidth * 0.5;
      let maxH = scrapbookHeight * 0.5;
      let scale = min(maxW / img.width, maxH / img.height, 1);
      let w = img.width * scale;
      let h = img.height * scale;

      let x = scrapbookX + (scrapbookWidth - w) / 2;
      let y = scrapbookY + (scrapbookHeight - h) / 2;

      tempImage = new ImageElement(img, x, y, w, h, 'None');
      if (filterEditMode) {
        tempImage.applyFilter(imageFilterSelector.value());
      } else {
        imageElements.push(tempImage);
        tempImage = null;
      }
    });
  }
}

// =====================
// Draw
// =====================
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
  if (showGrid) {
    stroke(180, 180, 180);
    strokeWeight(3);
    let gridSpacing = 50;
    for (let x = scrapbookX; x <= scrapbookX + scrapbookWidth; x += gridSpacing) {
      for (let y = scrapbookY; y <= scrapbookY + scrapbookHeight; y += gridSpacing) {
        point(x, y);
      }
    }
  }

  // Draw images first
  for (let imgEl of imageElements) {
    imgEl.display();
  }

  // Draw shapes above images, below text
  for (let shapeEl of shapeElements) {
    shapeEl.display();
  }
  
  // Draw text elements
  for (let textEl of textElements) {
    textEl.display();
  }
  
  // Draw stickers on the sides
  drawStickers();
  
  // Draw dragging sticker preview
  if (selectedSticker) {
    selectedSticker.display();
  }
  
  // Draw temp image with live filter preview
  if (filterEditMode && tempImage) {
    let preview = new ImageElement(tempImage.img.get(), tempImage.x, tempImage.y, tempImage.w, tempImage.h, 'None');
    preview.applyFilter(imageFilterSelector.value());
    preview.display();
    
    push();
    textFont('Arial');
    textStyle(NORMAL);
    fill(100);
    noStroke();
    textSize(14);
    textAlign(CENTER, TOP);
    text('Change filter in dropdown. Press ENTER to confirm. Press ESC to cancel.', canvasWidth / 2, scrapbookY - 30);
    pop();
  }
  
  // Draw typing cursor and current text
  if (typingMode) {
    textFont(fontSelector.value());
    let previewColor = colorPicker.color();
    if (brightness(previewColor) > 90) {
      previewColor = color(0);
    }
    fill(previewColor);
    noStroke();
    textSize(24);
    textAlign(LEFT, TOP);
    text(currentText + '|', typingX, typingY);
    
    textFont('Arial');
    fill(100);
    textSize(14);
    textAlign(CENTER, TOP);
    text('Click on scrapbook to place text, then type. Press ENTER to finish. Press ESC to cancel.', canvasWidth / 2, scrapbookY - 30);
  }
  
  pop();
}

// =====================
// Draw Stickers
// =====================
function drawStickers() {
  push();
  imageMode(CENTER);
  
  for (let stickerPos of stickerPositions) {
    image(stickerPos.sticker.img, stickerPos.x, stickerPos.y, stickerPos.size, stickerPos.size);
  }
  
  pop();
}

// =====================
// Keyboard
// =====================
function keyPressed() {
  // === 1) Image filter edit mode ===
  if (filterEditMode) {
    if (keyCode === ENTER) {
      if (tempImage) {
        tempImage.applyFilter(imageFilterSelector.value());
        imageElements.push(tempImage);
        tempImage = null;
      }
      filterEditMode = false;
      addImageBtn.style('background-color', '#ddd');
    } else if (keyCode === ESCAPE) {
      filterEditMode = false;
      tempImage = null;
      addImageBtn.style('background-color', '#ddd');
    }
    return false;
  }

  // === 2) Delete stuff when NOT typing ===
  if (!typingMode && (keyCode === DELETE || keyCode === BACKSPACE)) {
    // Try deleting an image (includes dropped stickers)
    for (let i = imageElements.length - 1; i >= 0; i--) {
      if (imageElements[i].isMouseOver()) {
        imageElements.splice(i, 1);
        return false;
      }
    }

    // Try deleting a shape
    for (let i = shapeElements.length - 1; i >= 0; i--) {
      if (shapeElements[i].isMouseOver()) {
        shapeElements.splice(i, 1);
        return false;
      }
    }

    // Try deleting text
    for (let i = textElements.length - 1; i >= 0; i--) {
      if (textElements[i].isMouseOver()) {
        textElements.splice(i, 1);
        return false;
      }
    }

    return false; // prevent browser back navigation
  }

  // === 3) Typing mode behavior ===
  if (typingMode) {
    if (keyCode === ENTER) {
      if (currentText.trim() !== '') {
        let textColor = colorPicker.color();
        if (brightness(textColor) > 90) {
          textColor = color(0);
        }
        let newText = new TextElement(
          currentText,
          typingX,
          typingY,
          24,
          textColor,
          fontSelector.value()
        );
        textElements.push(newText);
      }
      typingMode = false;
      currentText = '';
      addTextBtn.style('background-color', '#ddd');
    } else if (keyCode === BACKSPACE) {
      currentText = currentText.slice(0, -1);
      return false;
    } else if (keyCode === ESCAPE) {
      typingMode = false;
      currentText = '';
      addTextBtn.style('background-color', '#ddd');
    } else if (key.length === 1) {
      currentText += key;
    }
    return false;
  }
}

// =====================
// Mouse interactions
// =====================
function mousePressed() {
  if (filterEditMode) return;
  
  // Place shape if in shapeMode and click in scrapbook
  // Place shape if in shapeMode and click in scrapbook
  if (shapeMode &&
      mouseX >= scrapbookX && mouseX <= scrapbookX + scrapbookWidth &&
      mouseY >= scrapbookY && mouseY <= scrapbookY + scrapbookHeight) {

    let shapeColor = colorPicker.color();  // always use picker color exactly

    let defaultW = 150;
    let defaultH = 100;
    let typeLabel = shapeTypeSelector.value(); // "Rectangle"
    let type = typeLabel.toLowerCase();        // "rectangle"

    if (type === 'square' || type === 'circle' || type === 'star') {
      defaultH = defaultW;
    }

    // 🔹 filled or outline?
    let fillChoice = shapeFillSelector.value(); // "Fill" or "Outline"
    let filled = (fillChoice === 'Fill');

    let newShape = new ShapeElement(
      mouseX - defaultW / 2,
      mouseY - defaultH / 2,
      defaultW,
      defaultH,
      shapeColor,
      type,
      filled
    );

    shapeElements.push(newShape);

    shapeMode = false;
    addShapeBtn.style('background-color', '#ddd');
    return;
  }

  
  if (typingMode && mouseX >= scrapbookX && mouseX <= scrapbookX + scrapbookWidth &&
      mouseY >= scrapbookY && mouseY <= scrapbookY + scrapbookHeight) {
    typingX = mouseX;
    typingY = mouseY;
    return;
  }
  
  if (!typingMode) {
    // Start dragging sticker from sidebar
    for (let i = 0; i < stickerPositions.length; i++) {
      let sp = stickerPositions[i];
      let halfSize = sp.size / 2;
      if (mouseX >= sp.x - halfSize && mouseX <= sp.x + halfSize &&
          mouseY >= sp.y - halfSize && mouseY <= sp.y + halfSize) {
        draggingFromLibrary = true;
        let stickerCopy = sp.sticker.img.get();
        selectedSticker = new ImageElement(stickerCopy, mouseX, mouseY, sp.size, sp.size, 'None', true);
        selectedSticker.dragging = true;
        selectedSticker.offsetX = 0;
        selectedSticker.offsetY = 0;
        return;
      }
    }
  }
  
  if (!typingMode) {
    // First: check shapes (so they sit above images)
    for (let i = shapeElements.length - 1; i >= 0; i--) {
      let shapeEl = shapeElements[i];
      if (shapeEl.startResize() || shapeEl.startDrag()) {
        selectedShape = shapeEl;
        shapeElements.splice(i, 1);
        shapeElements.push(shapeEl);
        return;
      }
    }

    // Then check images
    for (let i = imageElements.length - 1; i >= 0; i--) {
      let imgEl = imageElements[i];
      if (imgEl.startResize() || imgEl.startDrag()) {
        selectedImage = imgEl;
        imageElements.splice(i, 1);
        imageElements.push(imgEl);
        return;
      }
    }

    // Finally text
    for (let i = textElements.length - 1; i >= 0; i--) {
      if (textElements[i].startDrag()) {
        selectedText = textElements[i];
        textElements.splice(i, 1);
        textElements.push(selectedText);
        break;
      }
    }
  }

    // Click empty scrapbook area to deselect shape
  if (!typingMode &&
      mouseX >= scrapbookX && mouseX <= scrapbookX + scrapbookWidth &&
      mouseY >= scrapbookY && mouseY <= scrapbookY + scrapbookHeight) {

    // if we got here, no shape/image/text was grabbed (those return earlier)
    selectedShape = null;
  }

}

function mouseDragged() {
  if (selectedSticker) {
    selectedSticker.drag();
  } else if (selectedImage) {
    if (selectedImage.resizing) {
      selectedImage.resize();
    } else {
      selectedImage.drag();
    }
  } else if (selectedShape) {
    if (selectedShape.resizing) {
      selectedShape.resize();
    } else {
      selectedShape.drag();
    }
  } else if (selectedText) {
    selectedText.drag();
  }
}

function mouseReleased() {
  if (selectedSticker) {
    selectedSticker.stopInteraction();
    // Add to imageElements if dropped on scrapbook
    if (mouseX >= scrapbookX && mouseX <= scrapbookX + scrapbookWidth &&
        mouseY >= scrapbookY && mouseY <= scrapbookY + scrapbookHeight) {
      selectedSticker.isSticker = false;
      imageElements.push(selectedSticker);
    }
    selectedSticker = null;
    draggingFromLibrary = false;
  }
  if (selectedImage) {
    selectedImage.stopInteraction();
    selectedImage = null;
  }
  if (selectedShape) {
    selectedShape.stopInteraction();
  }
  if (selectedText) {
    selectedText.stopDrag();
    selectedText = null;
  }
}

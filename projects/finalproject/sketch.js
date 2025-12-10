// Brenna Scholte & Ally Chu
// Used with the help of GitHub Copilot and ChatGPT

let canvasWidth;
let canvasHeight; 

// Toolbar variables
let toolbarHeight = 175;
let toolbarBgColor;
let addTextBtn;
let addImageBtn;
let addShapeBtn;
let drawBtn;
let stickersBtn;
let changeBgBtn;
let toggleGridBtn;
let exportBtn;
let exportGifBtn;
let colorPicker;
let isRecordingGif = false;
let mediaRecorder;
let recordedChunks = [];
let fontSelector;
let imageFilterSelector;
let imageInput; // hidden file input
let shapeTypeSelector; // dropdown for shape type
let drawingLayer;      // p5.Graphics for all doodles
let drawMode = false;  // are we in drawing mode?
let eraserMode = false;
let thicknessSlider;
let eraserBtn;
let clearDrawBtn;

// Scrapbook area variables
let scrapbookX;
let scrapbookY;
let scrapbookWidth;
let scrapbookHeight;
let scrapbookBgColor;
let showGrid = true;

// Gallery view
let galleryMode = false;
let viewGalleryBtn;
let collage1;
let collage2;

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

// GIF library (right side)
let gifLibrary = [];
let gifPositions = [];
let selectedGif = null;
let draggingGifFromLibrary = false;

// Sticker assets from:
// <a href="https://www.flaticon.com/free-stickers/cute" title="cute stickers">Cute stickers created by barnstudio - Flaticon</a>

// Gif assets from:
// <iframe src="https://giphy.com/embed/LPBkMg3ssaCf9PTXvs" width="480" height="101" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/stickers/adventure-png-abenteuer-LPBkMg3ssaCf9PTXvs">via GIPHY</a></p>
// <iframe src="https://giphy.com/embed/NxpMNq17Y2Khq" width="480" height="456" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/stickers/fireworks-transparency-NxpMNq17Y2Khq">via GIPHY</a></p>
// <iframe src="https://giphy.com/embed/10Bb1Bq7BMi9Co" width="480" height="480" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/stickers/happy-excited-10Bb1Bq7BMi9Co">via GIPHY</a></p>
// <iframe src="https://giphy.com/embed/wTpkLqAZf3NFcgzQ4J" width="384" height="480" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/stickers/vaporwave-png-cyberghetto-wTpkLqAZf3NFcgzQ4J">via GIPHY</a></p>
// <iframe src="https://giphy.com/embed/4JXQArc0SQlh5diE9B" width="357" height="480" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/stickers/PDPDPD-pdpdtest-4JXQArc0SQlh5diE9B">via GIPHY</a></p>

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
  
  // Load animated GIF files for right side
  gifLibrary = [
    { name: 'heart', img: loadImage('assets/heart.gif'), isAnimated: true },
    { name: 'stars', img: loadImage('assets/stars.gif'), isAnimated: true },
    { name: 'fireworks', img: loadImage('assets/fireworks.gif'), isAnimated: true },
    { name: 'earth', img: loadImage('assets/earth.gif'), isAnimated: true }
  ];
  
  // Load gallery example collages
  collage1 = loadImage('assets/collage1.png');
  collage2 = loadImage('assets/collage2.png');
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
    this.angle = 0;
  }
  
  display() {
    push();
    textFont(this.font);
    fill(this.color);
    noStroke();
    textSize(this.size);
    textAlign(LEFT, TOP);
  
    translate(this.x, this.y);
    rotate(this.angle);
    text(this.content, 0, 0);
    pop();
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
    this.angle = 0;
    this.alpha = 255; // transparency: 0 (transparent) to 255 (opaque)
  }

  display() {
    push();
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    translate(cx, cy);
    rotate(this.angle);
    imageMode(CENTER);
    tint(255, this.alpha); // apply transparency
    image(this.img, 0, 0, this.w, this.h);
    noTint();
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
      // simple resize from bottom-right corner, based on mouse position
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
    this.angle = 0; 
  }

  display() {
    push();

    let cx = this.x + this.w / 2;
    let cy = this.y + this.h / 2;
    let size = min(this.w, this.h);

    // move to center of shape + rotate
    translate(cx, cy);
    rotate(this.angle);

    if (this.filled) {
      fill(this.color);
      noStroke();
    } else {
      noFill();
      stroke(this.color);
      strokeWeight(4);
    }

    switch (this.type) {
      case 'rectangle':
        rectMode(CENTER);
        rect(0, 0, this.w, this.h);
        break;
      case 'square': {
        let s = size;
        rectMode(CENTER);
        rect(0, 0, s, s);
        break;
      }
      case 'circle': {
        let d = size;
        ellipse(0, 0, d, d);
        break;
      }
      case 'ellipse':
        ellipse(0, 0, this.w, this.h);
        break;
      case 'triangle': {
        // point up
        triangle(
          0, -this.h / 2,           // top
          -this.w / 2, this.h / 2,  // bottom left
          this.w / 2, this.h / 2    // bottom right
        );
        break;
      }
      case 'star': {
        let outerR = size / 2;
        let innerR = outerR * 0.5;
        this.drawStar(0, 0, outerR, innerR, 5);
        break;
      }
    }

    pop();
  }

  drawStar(cx, cy, outerRadius, innerRadius, numPoints) {
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

  // Layer for freehand drawing
  drawingLayer = createGraphics(scrapbookWidth, scrapbookHeight);
  drawingLayer.clear();  // transparent start
  
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
  
  // Initialize GIF positions on right side
  let gifSize = 60;
  let rightX = scrapbookX + scrapbookWidth;
  gifPositions = [
    { gif: gifLibrary[0], x: rightX + 90, y: scrapbookY + 40, size: gifSize },      // heart
    { gif: gifLibrary[1], x: rightX + 170, y: scrapbookY + 110, size: gifSize },    // stars
    { gif: gifLibrary[2], x: rightX + 90, y: scrapbookY + 200, size: gifSize },     // fireworks
    { gif: gifLibrary[3], x: rightX + 170, y: scrapbookY + 290, size: gifSize }     // earth
  ];
}

async function requestSticker(promptText) {
  const res = await fetch('http://127.0.0.1:8000/generate-sticker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: promptText })
  });

  const data = await res.json();
  const imgData = 'data:image/png;base64,' + data.image_b64;

  loadImage(imgData, (img) => {
    let newSticker = new ImageElement(
      img,
      scrapbookX + scrapbookWidth / 2,
      scrapbookY + scrapbookHeight / 2,
      100,
      100,
      'None',
      false
    );
    imageElements.push(newSticker);
  });
}


// =====================
// Setup Toolbar
// =====================
function setupToolbarButtons() {
  let toolX = 315;
  let toolSpacing = 120;
  let buttonY = 20;
  let buttonWidth = 100;
  
  // Add Text button
  addTextBtn = createButton('Add Text');
  addTextBtn.position(toolX, buttonY);
  addTextBtn.size(buttonWidth, 40);
  addTextBtn.style('font-family', 'Georgia, serif');
  addTextBtn.style('font-size', '14px');
  addTextBtn.style('background-color', '#ddd');
  addTextBtn.style('border', 'none');
  addTextBtn.style('border-radius', '5px');
  addTextBtn.style('cursor', 'pointer');
  addTextBtn.mousePressed(() => {
    if (filterEditMode || shapeMode || drawMode) return; // Don't allow if in other modes
    typingMode = true;
    currentText = '';
    addTextBtn.style('background-color', '#90EE90');
  });
  
  // Add Image button
  addImageBtn = createButton('Add Image');
  addImageBtn.position(toolX + toolSpacing, buttonY);
  addImageBtn.size(buttonWidth, 40);
  addImageBtn.style('font-family', 'Georgia, serif');
  addImageBtn.style('font-size', '14px');
  addImageBtn.style('background-color', '#ddd');
  addImageBtn.style('border', 'none');
  addImageBtn.style('border-radius', '5px');
  addImageBtn.style('cursor', 'pointer');
  addImageBtn.mousePressed(() => {
    if (typingMode || shapeMode || drawMode) return; // Don't allow if in other modes
    filterEditMode = true;
    addImageBtn.style('background-color', '#90EE90');
    imageInput.elt.value = '';
    imageInput.elt.click();
  });
  
  // Add Shape button
  addShapeBtn = createButton('Add Shape');
  addShapeBtn.position(toolX + toolSpacing * 2, buttonY);
  addShapeBtn.size(buttonWidth, 40);
  addShapeBtn.style('font-family', 'Georgia, serif');
  addShapeBtn.style('font-size', '14px');
  addShapeBtn.style('background-color', '#ddd');
  addShapeBtn.style('border', 'none');
  addShapeBtn.style('border-radius', '5px');
  addShapeBtn.style('cursor', 'pointer');
  addShapeBtn.mousePressed(() => {
    if (typingMode || filterEditMode || drawMode) return;
    shapeMode = !shapeMode;
    addShapeBtn.style('background-color', shapeMode ? '#90EE90' : '#ddd');
  });
  
  // Draw button
  drawBtn = createButton('Draw');
  drawBtn.position(toolX + toolSpacing * 3, buttonY);
  drawBtn.size(buttonWidth, 40);
  drawBtn.style('font-family', 'Georgia, serif');
  drawBtn.style('font-size', '14px');
  drawBtn.style('background-color', '#ddd');
  drawBtn.style('border', 'none');
  drawBtn.style('border-radius', '5px');
  drawBtn.style('cursor', 'pointer');
  drawBtn.mousePressed(() => {
    if (typingMode || filterEditMode || shapeMode) return;
    drawMode = !drawMode;
    eraserMode = false;
    drawBtn.style('background-color', drawMode ? '#90EE90' : '#ddd');
    eraserBtn.style('background-color', '#ddd');
    cursor(drawMode ? 'crosshair' : 'default');
  });

  // Eraser toggle (only useful in draw mode)
  eraserBtn = createButton('Eraser');
  eraserBtn.position(toolX + toolSpacing * 3, buttonY + 60);
  eraserBtn.size(buttonWidth, 25);
  eraserBtn.style('font-family', 'Georgia, serif');
  eraserBtn.style('font-size', '11px');
  eraserBtn.style('background-color', '#ddd');
  eraserBtn.style('border', 'none');
  eraserBtn.style('border-radius', '5px');
  eraserBtn.style('cursor', 'pointer');
  eraserBtn.mousePressed(() => {
    if (!drawMode) return;        // only works when drawing is on
    eraserMode = !eraserMode;
    eraserBtn.style('background-color', eraserMode ? '#FFB6C1' : '#ddd');
  });

  // Clear drawing layer button
  clearDrawBtn = createButton('Clear Drawings');
  clearDrawBtn.position(toolX + toolSpacing * 3, buttonY + 95);
  clearDrawBtn.size(100, 25);
  clearDrawBtn.style('font-family', 'Georgia, serif');
  clearDrawBtn.style('font-size', '11px');
  clearDrawBtn.style('background-color', '#ddd');
  clearDrawBtn.style('border', 'none');
  clearDrawBtn.style('border-radius', '5px');
  clearDrawBtn.style('cursor', 'pointer');
  clearDrawBtn.mousePressed(() => {
    drawingLayer.clear();   
  });
  

  // Brush thickness slider
  thicknessSlider = createSlider(1, 40, 8);  // min, max, default
  thicknessSlider.position(toolX + toolSpacing * 3, buttonY + 123);
  thicknessSlider.style('width', '100px');

  // Stickers button (now also triggers AI sticker generation)
  stickersBtn = createButton('Generate a New Sticker!');
  stickersBtn.position(toolX + toolSpacing * 4, buttonY);
  stickersBtn.size(buttonWidth, 130);
  stickersBtn.style('font-family', 'Georgia, serif');
  stickersBtn.style('font-size', '14px');
  stickersBtn.style('background-color', '#FFF9C4');
  stickersBtn.style('border', 'none');
  stickersBtn.style('border-radius', '5px');
  stickersBtn.style('cursor', 'pointer');
  stickersBtn.mousePressed(async () => {
    // don’t interrupt other modes
    if (typingMode || filterEditMode || shapeMode || drawMode) return;

    const promptText = window.prompt('Describe a sticker to generate:');
    if (!promptText || !promptText.trim()) return;

    try {
      await requestSticker(promptText.trim());
    } catch (err) {
      console.error(err);
      alert('Sorry, there was an error generating your sticker.');
    }
  });

  
  // Change Background Color button
  changeBgBtn = createButton('Change Background Color');
  changeBgBtn.position(toolX + toolSpacing * 5, buttonY + 45);
  changeBgBtn.size(150, 40);
  changeBgBtn.style('font-family', 'Georgia, serif');
  changeBgBtn.style('font-size', '14px');
  changeBgBtn.style('background-color', '#ddd');
  changeBgBtn.style('border', 'none');
  changeBgBtn.style('border-radius', '5px');
  changeBgBtn.style('cursor', 'pointer');
  changeBgBtn.mousePressed(() => {
    if (typingMode || filterEditMode || shapeMode || drawMode) return;
    let chosenColor = colorPicker.color();
    if (selectedShape) {
      selectedShape.color = chosenColor;
    } else {
      scrapbookBgColor = chosenColor;
    }
  });
  
  // Color picker
  colorPicker = createColorPicker('#000000');
  colorPicker.position(toolX + toolSpacing * 6 + 50, buttonY + 45);
  colorPicker.size(40, 40);
  colorPicker.style('border', 'none');
  colorPicker.style('border-radius', '5px');
  colorPicker.style('cursor', 'pointer');
  
  // View Gallery button
  viewGalleryBtn = createButton('View Gallery');
  viewGalleryBtn.position(windowWidth - 200, 20);
  viewGalleryBtn.size(140, 40);
  viewGalleryBtn.style('font-family', 'Georgia, serif');
  viewGalleryBtn.style('font-size', '14px');
  viewGalleryBtn.style('background-color', '#B8D4E8');
  viewGalleryBtn.style('border', 'none');
  viewGalleryBtn.style('border-radius', '5px');
  viewGalleryBtn.style('cursor', 'pointer');
  viewGalleryBtn.mousePressed(() => {
    galleryMode = !galleryMode;
    if (galleryMode) {
      viewGalleryBtn.html('Back to Scrapbook');
      viewGalleryBtn.style('background-color', '#FFB6C1');
      // Hide all toolbar buttons
      addTextBtn.hide();
      addImageBtn.hide();
      addShapeBtn.hide();
      drawBtn.hide();
      eraserBtn.hide();
      clearDrawBtn.hide();
      stickersBtn.hide();
      changeBgBtn.hide();
      colorPicker.hide();
      fontSelector.hide();
      imageFilterSelector.hide();
      shapeTypeSelector.hide();
      shapeFillSelector.hide();
      thicknessSlider.hide();
      toggleGridBtn.hide();
      exportBtn.hide();
      exportGifBtn.hide();
    } else {
      viewGalleryBtn.html('View Gallery');
      viewGalleryBtn.style('background-color', '#B8D4E8');
      // Show all toolbar buttons
      addTextBtn.show();
      addImageBtn.show();
      addShapeBtn.show();
      drawBtn.show();
      eraserBtn.show();
      clearDrawBtn.show();
      stickersBtn.show();
      changeBgBtn.show();
      colorPicker.show();
      fontSelector.show();
      imageFilterSelector.show();
      shapeTypeSelector.show();
      shapeFillSelector.show();
      thicknessSlider.show();
      toggleGridBtn.show();
      exportBtn.show();
      exportGifBtn.show();
    }
  });
  
  // Toggle Grid button
  toggleGridBtn = createButton('Hide Grid');
  toggleGridBtn.position(windowWidth - 200, windowHeight - 200);
  toggleGridBtn.size(140, 40);
  toggleGridBtn.style('font-family', 'Georgia, serif');
  toggleGridBtn.style('font-size', '14px');
  toggleGridBtn.style('background-color', 'rgb(70, 70, 80)');
  toggleGridBtn.style('color', 'white');
  toggleGridBtn.style('border', 'none');
  toggleGridBtn.style('border-radius', '5px');
  toggleGridBtn.style('cursor', 'pointer');
  toggleGridBtn.mousePressed(() => {
    showGrid = !showGrid;
    toggleGridBtn.html(showGrid ? 'Hide Grid' : 'Show Grid');
  });
  
  // Export button
  exportBtn = createButton('Export PNG');
  exportBtn.position(windowWidth - 200, windowHeight - 150);
  exportBtn.size(140, 40);
  exportBtn.style('font-family', 'Georgia, serif');
  exportBtn.style('font-size', '14px');
  exportBtn.style('background-color', '#87CEEB');
  exportBtn.style('border', 'none');
  exportBtn.style('border-radius', '5px');
  exportBtn.style('cursor', 'pointer');
  exportBtn.mousePressed(() => {
    if (typingMode || filterEditMode || shapeMode || drawMode) return;
    exportScrapbook();
  });
  
  // Export Video button
  exportGifBtn = createButton('Export Video');
  exportGifBtn.position(windowWidth - 200, windowHeight - 100);
  exportGifBtn.size(140, 40);
  exportGifBtn.style('font-family', 'Georgia, serif');
  exportGifBtn.style('font-size', '14px');
  exportGifBtn.style('background-color', '#FFB6C1');
  exportGifBtn.style('border', 'none');
  exportGifBtn.style('border-radius', '5px');
  exportGifBtn.style('cursor', 'pointer');
  exportGifBtn.mousePressed(() => {
    if (typingMode || filterEditMode || shapeMode || drawMode) return;
    startVideoRecording();
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
}

function startVideoRecording() {
  if (isRecordingGif) return; // Prevent multiple recordings
  
  isRecordingGif = true;
  showGrid = false;
  recordedChunks = [];
  
  exportGifBtn.html('Recording...');
  exportGifBtn.style('color', 'white');
  exportGifBtn.style('background-color', '#FF6B6B');
  exportGifBtn.attribute('disabled', '');
  
  // Store scrapbook coordinates
  let sbX = scrapbookX;
  let sbY = scrapbookY;
  let sbW = scrapbookWidth;
  let sbH = scrapbookHeight;
  
  // Create an offscreen canvas for scrapbook area only
  let offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = sbW;
  offscreenCanvas.height = sbH;
  let offscreenCtx = offscreenCanvas.getContext('2d');
  
  // Get main canvas and account for pixel density
  let mainCanvas = document.querySelector('canvas');
  let dpr = window.devicePixelRatio || 1;
  
  // Capture scrapbook area at 30 fps
  let captureInterval = setInterval(() => {
    // Copy only the scrapbook area from main canvas, accounting for device pixel ratio
    offscreenCtx.drawImage(
      mainCanvas,
      sbX * dpr, sbY * dpr, sbW * dpr, sbH * dpr,  // source region (scaled by DPR)
      0, 0, sbW, sbH                                 // destination (full offscreen canvas)
    );
  }, 1000 / 30);
  
  let stream = offscreenCanvas.captureStream(30); // 30 fps
  
  // Create MediaRecorder with higher quality settings
  mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 8000000  // 8Mbps for better quality
  });
  
  // Collect data chunks
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };
  
  // When recording stops, download the video
  mediaRecorder.onstop = () => {
    clearInterval(captureInterval);
    
    let blob = new Blob(recordedChunks, { type: 'video/webm' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'my-scrapbook.webm';
    a.click();
    URL.revokeObjectURL(url);
    
    // Reset UI
    isRecordingGif = false;
    showGrid = true;
    toggleGridBtn.html('Hide Grid'); 
    exportGifBtn.html('Export Video');
    exportGifBtn.style('background-color', '#FFB6C1');
    exportGifBtn.removeAttribute('disabled');
  };
  
  // Start recording
  mediaRecorder.start();
  
  // Stop recording after 5 seconds
  setTimeout(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  }, 6000);
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
  
  if (galleryMode) {
    drawGallery();
  } else {
    // Draw toolbar
    drawToolbar();
    
    // Draw scrapbook area
    drawScrapbook();
  }
}

function drawToolbar() {
  push();
  // Toolbar background
  fill(toolbarBgColor);
  noStroke();
  rect(0, 0, canvasWidth, toolbarHeight);
  
  // Toolbar title
  fill(255);
  textFont('Georgia');
  textSize(28);
  textAlign(LEFT, CENTER);
  text("✨ Scrapbook ", 20, toolbarHeight / 2 - 20);
  text("     Maker ", 20, toolbarHeight / 2 + 20);
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
  
  // Draw GIFs on right side
  drawGifs();
  
  // Draw dragging sticker preview
  if (selectedSticker) {
    selectedSticker.display();
  }
  
  // Draw dragging gif preview
  if (selectedGif) {
    selectedGif.display();
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

  // After grid, draw freehand doodles
  image(drawingLayer, scrapbookX, scrapbookY);
  
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
// Draw GIFs
// =====================
function drawGifs() {
  push();
  imageMode(CENTER);
  
  for (let gifPos of gifPositions) {
    image(gifPos.gif.img, gifPos.x, gifPos.y, gifPos.size, gifPos.size);
  }
  
  pop();
}

// =====================
// Draw Gallery
// =====================
function drawGallery() {
  push();
  
  // Gallery title toolbar 
  fill(70, 70, 80);
  noStroke();
  rect(0, 0, canvasWidth, toolbarHeight);
  
  fill(255);
  textFont('Georgia');
  textStyle(BOLD);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('📚 My Scrapbooks 📚', canvasWidth / 2, toolbarHeight / 2);
  
  // Gallery grid - 3 columns, 2 rows of placeholder scrapbook thumbnails
  let thumbnailWidth = 300;
  let thumbnailHeight = 200;
  let spacing = 50;
  let startX = (canvasWidth - (thumbnailWidth * 3 + spacing * 2)) / 2;
  let startY = toolbarHeight + 80;
  
  textStyle(NORMAL);
  
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      let x = startX + col * (thumbnailWidth + spacing);
      let y = startY + row * (thumbnailHeight + spacing);
      let index = row * 3 + col;
      
      if (index === 0) {
        // Draw the collage1 image 
        push();
        drawingContext.save();
        drawingContext.beginPath();
        drawingContext.roundRect(x, y, thumbnailWidth, thumbnailHeight, 10);
        drawingContext.clip();
        
        imageMode(CORNER);
        image(collage1, x, y, thumbnailWidth, thumbnailHeight);
        
        drawingContext.restore();
        pop();
        
        // Border
        noFill();
        stroke(150);
        strokeWeight(2);
        rect(x, y, thumbnailWidth, thumbnailHeight, 10);
        
        // Label
        fill(70, 70, 80);
        noStroke();
        textSize(14);
        textAlign(CENTER, CENTER);
        text('My First Scrapbook', x + thumbnailWidth / 2, y + thumbnailHeight + 20);
      } else if (index === 1) {
        // Draw the collage2 image 
        push();
        drawingContext.save();
        drawingContext.beginPath();
        drawingContext.roundRect(x, y, thumbnailWidth, thumbnailHeight, 10);
        drawingContext.clip();
        
        imageMode(CORNER);
        image(collage2, x, y, thumbnailWidth, thumbnailHeight);
        
        drawingContext.restore();
        pop();
        
        // Border
        noFill();
        stroke(150);
        strokeWeight(2);
        rect(x, y, thumbnailWidth, thumbnailHeight, 10);
        
        // Label
        fill(70, 70, 80);
        noStroke();
        textSize(14);
        textAlign(CENTER, CENTER);
        text('Summer Memories', x + thumbnailWidth / 2, y + thumbnailHeight + 20);
      } else {
        // Placeholder thumbnail
        fill(240);
        stroke(150);
        strokeWeight(2);
        rect(x, y, thumbnailWidth, thumbnailHeight, 10);
        
        // Placeholder text
        fill(150);
        noStroke();
        textSize(16);
        textAlign(CENTER, CENTER);
        text('Scrapbook #' + (index + 1), x + thumbnailWidth / 2, y + thumbnailHeight / 2 - 20);
        textSize(14);
        text('(Coming Soon)', x + thumbnailWidth / 2, y + thumbnailHeight / 2 + 10);
      }
    }
  }
  
  pop();
}

// =====================
// Keyboard
// =====================
function keyPressed() {
  // Image filter edit mode 
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

  // DUPLICATE selected item with "D" 
  if (!typingMode && (key === 'd' || key === 'D')) {
    const offset = 20;  // so it doesn’t sit exactly on top

    if (selectedImage) {
      let src = selectedImage;
      let clone = new ImageElement(
        src.img,
        src.x + offset,
        src.y + offset,
        src.w,
        src.h,
        src.filter,
        src.isSticker
      );
      imageElements.push(clone);
      selectedImage = clone;
      selectedShape = null;
      selectedText = null;
    } else if (selectedShape) {
      let src = selectedShape;
      let clone = new ShapeElement(
        src.x + offset,
        src.y + offset,
        src.w,
        src.h,
        src.color,
        src.type,
        src.filled
      );
      shapeElements.push(clone);
      selectedShape = clone;
      selectedImage = null;
      selectedText = null;
    } else if (selectedText) {
      let src = selectedText;
      let clone = new TextElement(
        src.content,
        src.x + offset,
        src.y + offset,
        src.size,
        src.color,
        src.font
      );
      textElements.push(clone);
      selectedText = clone;
      selectedImage = null;
      selectedShape = null;
    }

    return false;
  }

  // Rotation with LEFT/RIGHT arrows
  if (!typingMode && (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW)) {
    const step = radians(5); // 5 degrees per press

    if (selectedImage) {
      selectedImage.angle += (keyCode === LEFT_ARROW ? -step : step);
    } else if (selectedText) {
      selectedText.angle += (keyCode === LEFT_ARROW ? -step : step);
    }
    else if (selectedShape) {
      selectedShape.angle += (keyCode === LEFT_ARROW ? -step : step);
    }
    return false; // prevent page scrolling with arrow keys
  }

  // Transparency control with UP/DOWN arrows (images only)
  if (!typingMode && (keyCode === UP_ARROW || keyCode === DOWN_ARROW)) {
    if (selectedImage) {
      const alphaStep = 30; // transparency change per press
      if (keyCode === UP_ARROW) {
        selectedImage.alpha = min(255, selectedImage.alpha + alphaStep); // more opaque
      } else {
        selectedImage.alpha = max(0, selectedImage.alpha - alphaStep); // more transparent
      }
      return false; // prevent page scrolling
    }
  }

  // Delete stuff when NOT typing 
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

  // Typing mode behavior 
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

  // Drawing mode: let mouseDragged handle the drawing
  if (drawMode &&
      mouseX >= scrapbookX && mouseX <= scrapbookX + scrapbookWidth &&
      mouseY >= scrapbookY && mouseY <= scrapbookY + scrapbookHeight) {
    return;
  }

  // Typing mode: if we click on existing text, exit typing and select/drag it.
  if (typingMode &&
      mouseX >= scrapbookX && mouseX <= scrapbookX + scrapbookWidth &&
      mouseY >= scrapbookY && mouseY <= scrapbookY + scrapbookHeight) {

    // Check from topmost text down
    for (let i = textElements.length - 1; i >= 0; i--) {
      let t = textElements[i];
      if (t.isMouseOver()) {
        // exit typing mode
        typingMode = false;
        currentText = '';
        addTextBtn.style('background-color', '#ddd');

        // select this text and start dragging it
        if (t.startDrag()) {
          selectedText = t;
          // bring to front
          textElements.splice(i, 1);
          textElements.push(t);
          return;
        }
      }
    }

    // Otherwise, normal "place caret" behavior for new text
    typingX = mouseX;
    typingY = mouseY;
    return;
  }

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

  // Start dragging sticker from sidebar
  if (!typingMode && !filterEditMode && !shapeMode && !drawMode) {
    for (let i = 0; i < stickerPositions.length; i++) {
      let sp = stickerPositions[i];
      let halfSize = sp.size / 2;
      if (mouseX >= sp.x - halfSize && mouseX <= sp.x + halfSize &&
          mouseY >= sp.y - halfSize && mouseY <= sp.y + halfSize) {
        draggingFromLibrary = true;
        selectedSticker = new ImageElement(
          sp.sticker.img,
          mouseX - sp.size / 2,
          mouseY - sp.size / 2,
          sp.size,
          sp.size,
          'None',
          true
        );
        selectedSticker.dragging = true;
        selectedSticker.offsetX = selectedSticker.x - mouseX;
        selectedSticker.offsetY = selectedSticker.y - mouseY;
        return;
      }
    }
    
    // Start dragging GIF from right sidebar
    for (let i = 0; i < gifPositions.length; i++) {
      let gp = gifPositions[i];
      let halfSize = gp.size / 2;
      if (mouseX >= gp.x - halfSize && mouseX <= gp.x + halfSize &&
          mouseY >= gp.y - halfSize && mouseY <= gp.y + halfSize) {
        draggingGifFromLibrary = true;
        selectedGif = new ImageElement(
          gp.gif.img,
          mouseX - gp.size / 2,
          mouseY - gp.size / 2,
          gp.size,
          gp.size,
          'None',
          true
        );
        selectedGif.dragging = true;
        selectedGif.offsetX = selectedGif.x - mouseX;
        selectedGif.offsetY = selectedGif.y - mouseY;
        return;
      }
    }
  }

  if (!typingMode && !filterEditMode && !shapeMode && !drawMode) {
    // TEXT (topmost – drawn last)
    for (let i = textElements.length - 1; i >= 0; i--) {
      let t = textElements[i];
      if (t.startDrag()) {
        selectedText = t;
        selectedShape = null;
        selectedImage = null;
        // bring to front
        textElements.splice(i, 1);
        textElements.push(t);
        return;
      }
    }

    // SHAPES (middle layer)
    for (let i = shapeElements.length - 1; i >= 0; i--) {
      let shapeEl = shapeElements[i];
      if (shapeEl.startResize() || shapeEl.startDrag()) {
        selectedShape = shapeEl;
        selectedText = null;
        selectedImage = null;
        shapeElements.splice(i, 1);
        shapeElements.push(shapeEl);
        return;
      }
    }

    // IMAGES (bottom layer)
    for (let i = imageElements.length - 1; i >= 0; i--) {
      let imgEl = imageElements[i];
      if (imgEl.startResize() || imgEl.startDrag()) {
        selectedImage = imgEl;
        selectedShape = null;
        selectedText = null;
        imageElements.splice(i, 1);
        imageElements.push(imgEl);
        return;
      }
    }
  }


  // If we clicked empty scrapbook area, clear selection
  if (!typingMode && !filterEditMode && !shapeMode && !drawMode &&
      mouseX >= scrapbookX && mouseX <= scrapbookX + scrapbookWidth &&
      mouseY >= scrapbookY && mouseY <= scrapbookY + scrapbookHeight) {
    selectedShape  = null;
    selectedImage  = null;
    selectedText   = null;
  }
}



function mouseDragged() {
  // 1) Freehand drawing / erasing
  if (drawMode &&
      mouseX >= scrapbookX && mouseX <= scrapbookX + scrapbookWidth &&
      mouseY >= scrapbookY && mouseY <= scrapbookY + scrapbookHeight &&
      pmouseX >= scrapbookX && pmouseX <= scrapbookX + scrapbookWidth &&
      pmouseY >= scrapbookY && pmouseY <= scrapbookY + scrapbookHeight) {
    
    let lx1 = pmouseX - scrapbookX;
    let ly1 = pmouseY - scrapbookY;
    let lx2 = mouseX - scrapbookX;
    let ly2 = mouseY - scrapbookY;

    drawingLayer.push();
    drawingLayer.strokeWeight(thicknessSlider.value());

    if (eraserMode) {
      // erase makes transparent strokes
      drawingLayer.erase();
      drawingLayer.stroke(255); // stroke color doesn't really matter here
    } else {
      drawingLayer.noErase();
      drawingLayer.stroke(colorPicker.color());
    }

    drawingLayer.line(lx1, ly1, lx2, ly2);
    drawingLayer.noErase();
    drawingLayer.pop();

    return;
  }

  // 2) Normal dragging of stickers/images/shapes/text (when not drawing)
  if (selectedSticker) {
    selectedSticker.drag();
  } else if (selectedGif) {
    selectedGif.drag();
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
  
  if (selectedGif) {
    selectedGif.stopInteraction();
    // Add to imageElements if dropped on scrapbook
    if (mouseX >= scrapbookX && mouseX <= scrapbookX + scrapbookWidth &&
        mouseY >= scrapbookY && mouseY <= scrapbookY + scrapbookHeight) {
      selectedGif.isSticker = false;
      imageElements.push(selectedGif);
    }
    selectedGif = null;
    draggingGifFromLibrary = false;
  }

  if (selectedImage) {
    // stop dragging/resizing, but KEEP it selected
    selectedImage.stopInteraction();
  }
  if (selectedShape) {
    selectedShape.stopInteraction();
  }
  if (selectedText) {
    selectedText.stopDrag();
    // KEEP selectedText so we can duplicate it
  }
  if (drawMode) {
    drawingLayer.noErase();
  }
}


// Brenna Scholte & Ally Chu
// Used with the help of GitHub Copilot

let canvasWidth;
let canvasHeight;

// Toolbar variables
let toolbarHeight = 135;
let toolbarBgColor;
let addTextBtn;
let addImageBtn;
let addShapeBtn;
let drawBtn;
let stickersBtn;
let changeBgBtn;
let colorPicker;
let fontSelector;
let imageFilterSelector;
let imageInput; // hidden file input

// Scrapbook area variables
let scrapbookX;
let scrapbookY;
let scrapbookWidth;
let scrapbookHeight;
let scrapbookBgColor;

// Text elements array
let textElements = [];
let selectedText = null;

// Image elements array
let imageElements = [];
let selectedImage = null;

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
    this.handleSize = 14;
  }

  display() {
    push();
    image(this.img, this.x, this.y, this.w, this.h);
    pop();

    // resize handle (bottom-right corner)
    let hx = this.x + this.w;
    let hy = this.y + this.h;
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
  colorPicker = createColorPicker('#000000');
  colorPicker.position(toolX + toolSpacing * 6 + 50, buttonY);
  colorPicker.size(40, 40);
  colorPicker.style('border', 'none');
  colorPicker.style('border-radius', '5px');
  colorPicker.style('cursor', 'pointer');
  
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
  stroke(180, 180, 180);
  strokeWeight(3);
  let gridSpacing = 50;
  for (let x = scrapbookX; x <= scrapbookX + scrapbookWidth; x += gridSpacing) {
    for (let y = scrapbookY; y <= scrapbookY + scrapbookHeight; y += gridSpacing) {
      point(x, y);
    }
  }

  // Draw images first so text can sit on top if you want
  for (let imgEl of imageElements) {
    imgEl.display();
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
    // Create temp copy for preview
    let preview = new ImageElement(tempImage.img.get(), tempImage.x, tempImage.y, tempImage.w, tempImage.h, 'None');
    preview.applyFilter(imageFilterSelector.value());
    preview.display();
    
    // Draw instruction
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
    // If color is white or close to white, use black instead
    if (brightness(previewColor) > 90) {
      previewColor = color(0);
    }
    fill(previewColor);
    noStroke();
    textSize(24);
    textAlign(LEFT, TOP);
    text(currentText + '|', typingX, typingY);
    
    // Draw instruction
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
    // Draw sticker
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
      // Finalize image with selected filter
      if (tempImage) {
        tempImage.applyFilter(imageFilterSelector.value());
        imageElements.push(tempImage);
        tempImage = null;
      }
      filterEditMode = false;
      addImageBtn.style('background-color', '#ddd');
    } else if (keyCode === ESCAPE) {
      // Cancel filter edit
      filterEditMode = false;
      tempImage = null;
      addImageBtn.style('background-color', '#ddd');
    }
    return false;
  }

  // === 2) Delete stuff when NOT typing ===
  // Hover over an item and press Delete or Backspace
  if (!typingMode && (keyCode === DELETE || keyCode === BACKSPACE)) {
    // Try deleting an image (includes dropped stickers)
    for (let i = imageElements.length - 1; i >= 0; i--) {
      if (imageElements[i].isMouseOver()) {
        imageElements.splice(i, 1);
        return false; // stop after deleting topmost hit
      }
    }

    // If no image was deleted, try deleting text
    for (let i = textElements.length - 1; i >= 0; i--) {
      if (textElements[i].isMouseOver()) {
        textElements.splice(i, 1);
        return false;
      }
    }

    return false; // prevent browser back navigation on Backspace
  }

  // === 3) Typing mode behavior ===
  if (typingMode) {
    if (keyCode === ENTER) {
      // Finish typing and create text element
      if (currentText.trim() !== '') {
        let textColor = colorPicker.color();
        // If color is white or close to white, use black instead
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
      // Remove last character
      currentText = currentText.slice(0, -1);
      return false;
    } else if (keyCode === ESCAPE) {
      typingMode = false;
      currentText = '';
      addTextBtn.style('background-color', '#ddd');
    } else if (key.length === 1) {
      // Add character to current text
      currentText += key;
    }
    return false; // Prevent default key behavior
  }
}


// =====================
// Mouse interactions
// =====================
function mousePressed() {
  if (filterEditMode) return;
  
  if (typingMode && mouseX >= scrapbookX && mouseX <= scrapbookX + scrapbookWidth &&
      mouseY >= scrapbookY && mouseY <= scrapbookY + scrapbookHeight) {
    typingX = mouseX;
    typingY = mouseY;
    return;
  }
  
  if (!typingMode) {
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
    for (let i = imageElements.length - 1; i >= 0; i--) {
      let imgEl = imageElements[i];
      if (imgEl.startResize() || imgEl.startDrag()) {
        selectedImage = imgEl;
        imageElements.splice(i, 1);
        imageElements.push(imgEl);
        return;
      }
    }

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
  if (selectedText) {
    selectedText.stopDrag();
    selectedText = null;
  }
}

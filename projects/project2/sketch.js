// Brenna Scholte

let canvasWidth;
let canvasHeight;
let dataTable;

let activityDateCol;

// Grid variables
let calendarWidth = 1100; 
let calendarHeight = 600; 
let numCols = 7; 
let numRows = 6;
let boxSpacing = 15; // gap between boxes
let padding = 30;     // space from calendar edge to first box
let boxW = (calendarWidth - 2 * padding - (numCols - 1) * boxSpacing) / numCols;
let boxH = (calendarHeight - 2 * padding - (numRows - 1) * boxSpacing) / numRows;
// Calculate the top-left starting corner of the grid
let startX;
let startY;

function preload() {
  dataTable = loadTable('assets/activities_1024.csv', 'csv', 'header');
}

function setup() {
  // Check csv imported correctly
  if (dataTable && dataTable.getRowCount() == 79){
    console.log("CSV loaded successfully.")
  }

  // Set up canvas
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;
  createCanvas(canvasWidth, canvasHeight);
  background('cornsilk');

  // Draw static elements
  startX = (canvasWidth / 2) - (calendarWidth / 2) + padding;
  startY = (canvasHeight / 2) - (calendarHeight / 2) + padding;
  setupElements();

  // Parse strava data
  parseData();
}

function setupElements() {
    // Calendar
    push();
    fill(235);
    rectMode(CENTER);
    noStroke();
    rect(canvasWidth/2, canvasHeight/2, 1100, 600);
    pop();

    // Calendar grid
    drawGrid();
    
    titleText = createElement('h2', "BRENNA'S ROAD TO THE HALF MARATHON");
    titleText.position(475, 25);
    titleText.style('background-color', '#909B75');
    titleText.style('color', 'white');
    titleText.style('border', 'none');
    titleText.style('border-radius', '8px');
    titleText.style('padding', '4px 8px');
}

function drawGrid() {
  push();
  rectMode(CORNER); 
  
  let dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  // Loop through 6 rows and 7 columns
  for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
          
          // Calculate the current box's top-left corner (X, Y)
          let x = startX + c * (boxW + boxSpacing);
          let y = startY + r * (boxH + boxSpacing);
          
          // Draw box
          fill(250);
          stroke(200);
          strokeWeight(1);
          rect(x, y, boxW, boxH);
          
          // Add text
          fill(50);
          textSize(12);
          textAlign(LEFT, TOP);
          if (r > 0){
            let dateNumber = (r - 1) * numCols + c + 1;
            text(dateNumber, x + 5, y + 5); 
          } 
          else{
            fill(70); // Darker color for the day name
            textSize(16);
            textAlign(CENTER, CENTER);
            text(dayLabels[c], x + boxW/2, y + boxH/2);
          }
    }
    pop();
  }
}

function parseData() {
  activityDateCol = dataTable.getColumn('Activity Date');

  // TODO: move to separate function when using activity dates
  // for (let i = 0; i < activityDateCol.length; i++) {
  //   let value = activityDateCol[i];
  // }

}


function draw() {

    
    
}

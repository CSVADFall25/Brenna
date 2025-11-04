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

let currentMonth = 5; // 0 = January, 1 = February, etc.
let currentYear = 2025;
let monthNames = ['May 2025', 'June 2025', 'July 2025', 'August 2025', 'September 2025', 'October 2025', 'November 2025'];
let monthDropdown;


function preload() {
  dataTable = loadTable('assets/temp.csv', 'csv', 'header');
}

function setup() {
  // Check csv imported correctly
  if (dataTable && dataTable.getRowCount() == 79){ // TODO: change number of rows
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

    // Month dropdown
    monthDropdown = createSelect();
    monthDropdown.position(200, 40);
    for (let i = 0; i < monthNames.length; i++) {
      monthDropdown.option(monthNames[i], i + 5); 
    }
    monthDropdown.selected(currentMonth);
    monthDropdown.style('font-size', '16px');
    monthDropdown.style('padding', '8px');
    monthDropdown.style('background-color', '#909B75');
    monthDropdown.style('color', 'white');
    monthDropdown.style('border', 'none');
    monthDropdown.style('border-radius', '8px');
    monthDropdown.style('cursor', 'pointer');
    monthDropdown.changed(monthChanged);
}

function monthChanged() {
  // Get the selected month value
  currentMonth = monthDropdown.value()
  
  // Update calendar
  drawGrid();
}

function drawGrid() {
  push();
  rectMode(CORNER); 
  
  let dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  let firstDate = new Date(currentYear, currentMonth-1, 1)
  let firstDay = firstDate.getDay();

  // Get the number of days in the month
  let daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  let dayCounter = 1; 

  // Loop through 6 rows and 7 columns
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
        push();
        
        // Calculate the current box's top-left corner (x, y)
        let x = startX + c * (boxW + boxSpacing);
        let y = startY + r * (boxH + boxSpacing);
        
        // Draw box
        fill(250);
        stroke(200);
        strokeWeight(1);
        rect(x, y, boxW, boxH);
        
        // Add day labels to first row
        if (r == 0) {
          fill(70); // Darker color for the day name
          textSize(16);
          textAlign(CENTER, CENTER);
          text(dayLabels[c], x + boxW/2, y + boxH/2);
        }
        else { 
          let cellIndex = (r - 1) * numCols + c;

          if (cellIndex >= firstDay && dayCounter <= daysInMonth) {
            fill(50);
            textSize(12);
            textAlign(LEFT, TOP);
            text(dayCounter, x + 5, y + 5); 
            dayCounter++;
          } 
        } 
        pop();
    }
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

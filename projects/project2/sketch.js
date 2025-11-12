// Brenna Scholte
// Used with the help of GitHub Copilot

let canvasWidth;
let canvasHeight;
let dataTable;
let starImg;
let flagImg;

let activityDateCol;
let activitiesMap = {}; 
let hoveredDate = null;
let tooltipX = 0;
let tooltipY = 0; 

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

let currentMonth = 9; // 0 = January, 1 = February, etc.
let currentYear = 2025;
let monthNames = ['May 2025', 'June 2025', 'July 2025', 'August 2025', 'September 2025', 'October 2025', 'November 2025'];
let monthDropdown;

let showRaceStats = false;
let raceStatsButton;

function preload() {
  dataTable = loadTable('assets/activities_1107.csv', 'csv', 'header');
  starImg = loadImage('assets/star.png');
  flagImg = loadImage('assets/flag.png');
}

function setup() {
  // Check csv imported correctly
  if (dataTable && dataTable.getRowCount() === 92){
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
    
    titleText = createElement('h2', "BRENNA'S ROAD TO THE HALF MARATHON" + " 🏃🏽‍♀️");
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

    // Race stats button
    raceStatsButton = createButton('🏁 View Race Results');
    raceStatsButton.position(1200, 45);
    raceStatsButton.style('font-size', '12px');
    raceStatsButton.style('padding', '8px 12px');
    raceStatsButton.style('background-color', '#ff6464');
    raceStatsButton.style('color', 'white');
    raceStatsButton.style('border', 'none');
    raceStatsButton.style('border-radius', '8px');
    raceStatsButton.style('cursor', 'pointer');
    raceStatsButton.mousePressed(toggleRaceStats);
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
            push();
            fill(50);
            textSize(12);
            textAlign(LEFT, TOP);
            text(dayCounter, x + 5, y + 5);
            pop();
            
            // 9/8 - First day of training
            if (currentMonth == 9 && dayCounter == 8) {
              push();
              imageMode(CENTER);
              image(starImg, x + boxW/2, y + boxH/2, 40, 40);
              fill('#909B75');
              textSize(12);
              text("First Day of Training!", x+15, y+boxH-5);
              pop();
            }
            
            // 11/9 - Half marathon day
            if (currentMonth == 11 && dayCounter == 9) {
              push();
              imageMode(CENTER);
              image(flagImg, x + boxW/2, y + boxH/2, 60, 40);
              fill('#909B75');
              textSize(12);
              text("Race Day!", x+40, y+boxH-5);
              pop();
            }
            
            // Check if this date has activities
            let dateKey = currentMonth + '/' + dayCounter + '/' + currentYear;
            if (activitiesMap[dateKey]) {
              // Draw activity indicator (dot)
              let activities = activitiesMap[dateKey];
              
              // Different colors for different activity types
              for (let i = 0; i < activities.length; i++) {
                if (activities[i].type === 'Run') {
                  fill(255, 100, 100); // Red for runs
                } else {
                  fill(100, 150, 255); // Blue for walks
                }
                noStroke();
                circle(x + boxW - 10 - (i * 12), y + 10, 8);
              }
            }
            
            dayCounter++;
          } 
        } 
        pop();
    }
  } 
  pop();
}

function racePrediction() {
  // Get running data from dataTable
  let activityTypeCol = dataTable.getColumn('Activity Type');
  let elapsedTimeCol = dataTable.getColumn('Elapsed Time');
  let distanceCol = dataTable.getColumn('Distance');
  
  // Variables to calculate average running pace
  let totalRunDistance = 0;
  let totalRunTime = 0;
  let runCount = 0;
  
  // Only process running activities
  for (let i = 0; i < activityTypeCol.length; i++) {
    if (activityTypeCol[i] === 'Run') {
      let elapsedSeconds = int(elapsedTimeCol[i]);
      let distanceKm = float(distanceCol[i]);
      let distanceMiles = distanceKm * 0.621371;
      
      totalRunDistance += distanceMiles;
      totalRunTime += elapsedSeconds / 60; // Convert to minutes
      runCount++;
    }
  }
  
  // Calculate average pace (minutes per mile)
  let avgPaceDec = totalRunTime / totalRunDistance;
  avgPaceMins = floor(avgPaceDec);
  avgPaceSecs = round((avgPaceDec-avgPaceMins)*60);
  if (avgPaceSecs < 10){
    avgPaceSecs = "0" + avgPaceSecs;
  }
  let avgPace = avgPaceMins + ":" + avgPaceSecs;
  
  // Calculate predicted half marathon time 
  let halfMarathonDistance = 13.1;
  let predictedTimeMin = floor(avgPaceDec * halfMarathonDistance);
  let predictedHours = floor(predictedTimeMin / 60);
  let predictedMinutes = round(predictedTimeMin % 60);
  
  console.log("Average running pace:", avgPace, "min/mile");
  console.log("Predicted half marathon time:", predictedHours, "hr", predictedMinutes, "min");
  console.log("Based on", runCount, "runs");
  
  // Return prediction data
  return {
    avgPace: avgPace,
    predictedHours: predictedHours,
    predictedMinutes: predictedMinutes,
    totalRuns: runCount,
    totalDistance: totalRunDistance.toFixed(2)
  };
}

function parseData() {
  activityDateCol = dataTable.getColumn('Activity Date');
  let activityNameCol = dataTable.getColumn('Activity Name');
  let activityTypeCol = dataTable.getColumn('Activity Type');
  let elapsedTimeCol = dataTable.getColumn('Elapsed Time');
  let distanceCol = dataTable.getColumn('Distance');
  
  for (let i = 0; i < activityDateCol.length; i++) {
    let dateStr = activityDateCol[i];
    
    // Parse date from format "May 28, 2025, 10:24:09 PM"
    let parts = dateStr.split(',');
    let datePart = parts[0].trim(); // "May 28"
    let yearPart = parts[1].trim(); // "2025"
    
    let dateComponents = datePart.split(' ');
    let monthStr = dateComponents[0];
    let day = int(dateComponents[1]);
    let year = int(yearPart);
    
    // Convert month name to number
    let monthMap = {'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 
                    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12};
    let month = monthMap[monthStr];
    
    let dateKey = month + '/' + day + '/' + year;
    
    // Store activity data
    if (!activitiesMap[dateKey]) {
      activitiesMap[dateKey] = [];
    }
    
    // Convert elapsed time from seconds to minutes/hours
    let elapsedSeconds = int(elapsedTimeCol[i]);
    let elapsedMin = Math.floor(elapsedSeconds / 60);
    let elapsedHour = Math.floor(elapsedMin / 60);
    let remainingMin = elapsedMin % 60; // Minutes after removing full hours
    
    // Convert distance from km to miles
    let distanceKm = float(distanceCol[i]);
    let distance = (distanceKm * 0.621371).toFixed(2);
    
    // Calculate pace (minutes per mile) for runs
    let paceDec = 0;
    let paceMins = 0;
    let pace = 0;
    if (activityTypeCol[i] === 'Run' && distance > 0) {
      let totalMinutes = elapsedHour * 60 + remainingMin;
      paceDec = (totalMinutes / parseFloat(distance)).toFixed(2);
      paceMins = floor((totalMinutes / parseFloat(distance)).toFixed(2));
      paceSecs = round((paceDec-paceMins)*60);
      if (paceSecs < 10){
        paceSecs = "0" + paceSecs;
      }
      pace = paceMins + ":" + paceSecs;
    }
    
    activitiesMap[dateKey].push({
      name: activityNameCol[i],
      type: activityTypeCol[i],
      timeMin: remainingMin,
      timeHour: elapsedHour,
      distance: distance,
      pace: pace,
      paceDec: paceDec
    });
  }
  
  // Get race prediction and store for race day (11/9/2025)
  let prediction = racePrediction();
  let raceDateKey = '11/9/2025';
  if (!activitiesMap[raceDateKey]) {
    activitiesMap[raceDateKey] = [];
  }
  activitiesMap[raceDateKey].push({
    name: 'Half Marathon Race',
    type: 'Prediction',
    timeMin: prediction.predictedMinutes,
    timeHour: prediction.predictedHours,
    distance: '13.1',
    isPrediction: true,
    avgPace: prediction.avgPace,
    totalRuns: prediction.totalRuns,
    totalDistance: prediction.totalDistance
  });
  
  console.log("Parsed activities map:", activitiesMap);
}


function draw() {
  // Redraw background and calendar to clear old tooltips
  background('cornsilk');
  push();
  fill(235);
  rectMode(CENTER);
  noStroke();
  rect(canvasWidth/2, canvasHeight/2, 1100, 600);
  pop();
  
  // Redraw calendar grid
  drawGrid();
  
  // Check if mouse is hovering over a date
  checkHover();
  
  // Tooltip is drawn here so it appears on top of everything
  if (hoveredDate) {
    drawTooltip();
  }

  // Draw milage progress
  drawProgressBar();

  // Draw weekly pace stats
  drawWeeklyPace();

  // Draw actual race stats
  drawRaceStats();
}

function toggleRaceStats(){
  showRaceStats = !showRaceStats;
}

function drawRaceStats() {
  if (!showRaceStats) return;

  let boxW = 400;
  let boxH = 175;
  let boxX = canvasWidth/2 - boxW/2;
  let boxY = canvasHeight/2 - boxH/2;

  push();
  fill(0, 0, 0, 150);
  noStroke();
  rect(0, 0, width, height);

  fill(255, 100, 100);
  rect(boxX, boxY, boxW, boxH, 12);
  
  fill(255);
  textAlign(CENTER, TOP);
  textSize(24);
  textStyle(BOLD);
  text('🏁 RACE DAY RESULTS 🏁', boxX + boxW/2, boxY + 20);
  
  textAlign(CENTER);
  textStyle(NORMAL);
  textSize(18);
  let offset = 200;
  text('Date: November 9, 2025', boxX + offset, boxY + 70);
  text('Total Time: 2:14:59', boxX + offset, boxY + 100);
  text('Average Pace: 10:18 min/mile', boxX + offset, boxY + 130);
  pop();
}

function drawWeeklyPace() {
  if (currentMonth < 6) return;

  let boxX = startX + calendarWidth - 15;
  let boxY = startY + 100;
  let boxW = 125;
  let boxH = 50;

  // Get first day of month
  let firstDate = new Date(currentYear, currentMonth-1, 1);
  let firstDay = firstDate.getDay();
  let daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  
  // Set number of weeks in month
  let numWeeks;
  if (parseInt(currentMonth) === 11) {
    numWeeks = 2;
  }
  else {
    numWeeks = 5;
  }

  // Iterate through each week
  let totalPaceSum = 0;
  let totalRuns = 0;
  for (let week = 0; week < numWeeks; week++) {

    // Get all dates for this week only
    let weekStartDay = week * 7 - firstDay + 1;
    let weekEndDay = Math.min(weekStartDay + 6, daysInMonth);
    
    let totalPace = 0;
    let runCount = 0;
    
    // Get all run activities for that week
    for (let day = weekStartDay; day <= weekEndDay; day++) {
      if (day < 1) continue;
      
      let dateKey = currentMonth + '/' + day + '/' + currentYear;
      
      if (activitiesMap[dateKey]) {
        activitiesMap[dateKey].forEach(activity => {
          if (activity.type === 'Run' && activity.paceDec) {
            totalPace += parseFloat(activity.paceDec);
            totalPaceSum += parseFloat(activity.paceDec);
            runCount++;
          }
        });
      }
    }
    
    // Calculate average pace for that week
    let avgPace;
    let mins = 0;
    let secs = 0;

    if (runCount > 0){
      let avgPaceDecimal = (totalPace / runCount).toFixed(2);
      mins = floor(avgPaceDecimal);
      secs = round((avgPaceDecimal-mins)*60);

      if (secs < 10){
        secs = "0" + secs;
      }
      avgPace = mins + ":" + secs;
    }
    else{
      avgPace = "--";
    }
    
    // Display average pace
    push();
    fill('#909B75');
    noStroke();
    rect(boxX, boxY + week * (boxH + 45), boxW, boxH, 8);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(12);
    textStyle(BOLD);
    text('Week ' + (week + 1) + ' Avg Pace:', boxX+boxW/2, boxY + week * (boxH + 45) + 10);
    textStyle(NORMAL);
    text(avgPace + " min/mile", boxX+boxW/2, boxY + week * (boxH + 45) + 30);
    pop();

    totalRuns += runCount;
  }

  // Calculate average monthly pace
  let avgPaceDec = totalPaceSum/totalRuns;
  let minsTemp = floor(avgPaceDec);
  let secsTemp = (avgPaceDec - minsTemp)*60;
  if (secsTemp > 60){
    minsTemp += floor(secsTemp/60);
    secsTemp = secsTemp % 60;
  }
  secsTemp = round(secsTemp);
  if (secsTemp < 10){
    secsTemp = "0" + secsTemp;
  }
  // console.log("average month pace: ", minsTemp + ":" + secsTemp);

  // Draw monthly pace to canvas
  push();
  // fill('#909B75');
  fill('#4a5238');
  noStroke();
  rect(boxX, boxY + numWeeks * (boxH + 45), boxW, boxH, 8);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(12);
  textStyle(BOLD);
  text('Avg Monthly Pace:', boxX+boxW/2, boxY + numWeeks * (boxH + 45) + 10);
  textStyle(NORMAL);
  text(minsTemp + ":" + secsTemp + " min/mile", boxX+boxW/2, boxY + numWeeks * (boxH + 45) + 30);
  pop();
}

function drawProgressBar() {
  // Calculate total miles run up to current month
  let totalMiles = 0;
  let totalRuns = 0;

  for (let dateKey in activitiesMap) {
    let [month, day, year] = dateKey.split('/').map(num => parseInt(num));
    
    // Only include activities up to current month
    if (month <= currentMonth) {
      activitiesMap[dateKey].forEach(activity => {
        if (activity.type === 'Run' && !activity.isPrediction) {
          totalMiles += parseFloat(activity.distance);
          totalRuns++;
        }
      });
    }
  }

  let goalMiles = 150; 
  let progress = totalMiles / goalMiles;

  let barW = 500;
  let barH = 30;
  let barX = (width-barW)/2;
  let barY = 700;

  // Draw progress bar
  push();
  fill(220);
  noStroke();
  rect(barX, barY, barW, barH);
  fill(255, 100, 100);
  rect(barX, barY, barW*progress, barH);

  // Draw labels
  fill(50);
  textAlign(CENTER, CENTER);
  textSize(16);
  textStyle(BOLD);
  text("Running Training Progress: ", barX-110, barY+15);

  // Draw milestone markers
  rect(barX + (barW/4), barY-5, 3, 40);
  rect(barX + 3*(barW/4), barY-5, 3, 40);
  rect(barX + barW/2, barY-5, 3, 40);

  // Add milage tooltip
  if (mouseX >= barX && mouseX <= barX + barW * progress && 
      mouseY >= barY && mouseY <= barY + barH) {
        
    let tooltipText = totalMiles.toFixed(1) + ' miles completed';
    let tooltipW = textWidth(tooltipText) + 20;
    let tooltipH = 30;
    let tooltipX = mouseX - tooltipW / 2;
    let tooltipY = barY + tooltipH+5;
    
    fill(50);
    noStroke();
    rect(tooltipX, tooltipY, tooltipW, tooltipH, 5);
    
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    textStyle(NORMAL);
    text(tooltipText, tooltipX + tooltipW/2, tooltipY + tooltipH/2);
  }
  
  pop();
}


function checkHover() {
  let firstDate = new Date(currentYear, currentMonth-1, 1);
  let firstDay = firstDate.getDay();
  let daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  let dayCounter = 1;
  
  hoveredDate = null; // Reset hover state
  
  // Check if mouse is hovering over a calendar date
  for (let r = 1; r < numRows; r++) { // Start from row 1 (skip day labels)
    for (let c = 0; c < numCols; c++) {
      let cellIndex = (r - 1) * numCols + c;
      
      if (cellIndex >= firstDay && dayCounter <= daysInMonth) {
        let x = startX + c * (boxW + boxSpacing);
        let y = startY + r * (boxH + boxSpacing);
        
        // Check if mouse is within this box
        if (mouseX >= x && mouseX <= x + boxW && mouseY >= y && mouseY <= y + boxH) {
          let dateKey = currentMonth + '/' + dayCounter +  '/' + currentYear;
          
          // Only set hover if this date has activities
          if (activitiesMap[dateKey]) {
            hoveredDate = dateKey;

            // Set tooltip on top of day box
            tooltipX = x;
            tooltipY = y;
          }
          return; // Exit once we find the hovered box
        }
        dayCounter++;
      }
    }
  }
}

function formatTime(hours, minutes) {
  return hours > 0 ? hours + ' hr ' + minutes + ' min' : minutes + ' min';
}

function getPredictionLines(activity) {
  return [
    activity.name + ' 🏃🏽‍♀️',
    'Predicted Time: ' + formatTime(activity.timeHour, activity.timeMin),
    'Distance: ' + activity.distance + ' miles',
    'Based on ' + activity.totalRuns + ' runs (' + activity.totalDistance + ' mi)',
    'Avg Pace: ' + activity.avgPace + ' min/mile'
  ];
}

function getActivityLines(activity) {
  let lines = [activity.name + ' (' + activity.type + ')'];
  
  // Calculate pace if it's a run
  if (activity.type === 'Run' && activity.pace) {
    lines.push(activity.distance + ' mi, ' + formatTime(activity.timeHour, activity.timeMin));
    lines.push(activity.pace + ' min/mile');
  } else {
    lines.push(activity.distance + ' mi, ' + formatTime(activity.timeHour, activity.timeMin));
  }
  
  return lines;
}

function calculateTooltipSize(activities, hasPrediction) {
  textSize(14);
  let maxWidth = 0;
  let totalLines = hasPrediction ? 0 : 1;
  
  if (!hasPrediction) {
    maxWidth = textWidth(hoveredDate);
  }
  
  activities.forEach(activity => {
    let lines = activity.isPrediction ? getPredictionLines(activity) : getActivityLines(activity);
    lines.forEach(line => {
      maxWidth = max(maxWidth, textWidth(line));
    });
    totalLines += lines.length;
  });
  
  return { maxWidth, totalLines };
}

function drawTooltip() {
  if (!activitiesMap[hoveredDate]) return;
  
  let activities = activitiesMap[hoveredDate];
  let hasPrediction = activities.some(a => a.isPrediction);
  
  // Calculate size
  let { maxWidth, totalLines } = calculateTooltipSize(activities, hasPrediction);
  let tipPadding = 10, lineHeight = 18;
  let tipWidth = maxWidth + tipPadding * 2 + 10;
  let tipHeight = totalLines * lineHeight + tipPadding * 2;
  
  // Position tooltip
  let tipX = tooltipX;
  let tipY = tooltipY;
  if (tipX + tipWidth > width) tipX = tooltipX - boxW - tipWidth - 10;
  if (tipY + tipHeight > height) tipY = height - tipHeight - 10;
  
  // Draw background
  push();
  fill(0, 0, 0, 200);
  noStroke();
  rect(tipX, tipY, tipWidth, tipHeight, 6);
  
  // Draw text
  fill(255);
  textAlign(LEFT, TOP);
  textSize(14);
  
  let yOffset = tipY + tipPadding;
  
  // Date header (skip for predictions)
  if (!hasPrediction) {
    text(hoveredDate, tipX + tipPadding, yOffset);
    yOffset += lineHeight;
  }
  
  // Draw activities
  activities.forEach(activity => {
    if (activity.isPrediction) {
      let lines = getPredictionLines(activity);
      fill(255, 215, 0);
      textStyle(BOLD);
      text(lines[0], tipX + tipPadding, yOffset);
      yOffset += lineHeight;
      
      fill(255);
      textStyle(NORMAL);
      lines.slice(1).forEach(line => {
        text(line, tipX + tipPadding, yOffset);
        yOffset += lineHeight;
      });
    } else {
      let lines = getActivityLines(activity);
      text(lines[0], tipX + tipPadding, yOffset);
      yOffset += lineHeight;
      
      // Display remaining lines with indent
      lines.slice(1).forEach(line => {
        text(line, tipX + tipPadding + 15, yOffset);
        yOffset += lineHeight;
      });
    }
  });
  
  pop();
}

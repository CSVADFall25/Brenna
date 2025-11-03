let table;
let flowValues = [];
let labels = [];
let tooltipGraphics;
let earliestDate;
let latestDate;
let totalDays;

// Used GitHub copilot to help update code to use new data

function preload() {
  // Make sure your CSV is in the same folder as the sketch
  table = loadTable('data/measurements.csv', 'csv', 'header');
}

function setup() {
  createCanvas(8000, 400);
  tooltipGraphics = createGraphics(8000, 400);

  // Track which dates already have period entries
  let periodDates = new Set();
  
  // First pass: collect all period dates
  for (let r = 0; r < table.getRowCount(); r++) { 
    let type = table.getString(r, 'type');
    if (type === 'period') {
      let dateStr = formatDate(table.getString(r, 'startDate'));
      periodDates.add(dateStr);
    }
  }

  // Second pass: extract all period data and spotting only if not on same day as period
  for (let r = 0; r < table.getRowCount(); r++) { 
    let type = table.getString(r, 'type');
    let dateStr = formatDate(table.getString(r, 'startDate'));
    
    // Skip spotting if there's already a period entry on this date
    if (type === 'spotting' && periodDates.has(dateStr)) {
      continue;
    }
    
    if (type === 'period' || type === 'spotting') {
      if(earliestDate === undefined || compareDates(dateStr, earliestDate) === -1) {
        earliestDate = dateStr;
      }
      if(latestDate === undefined || compareDates(dateStr, latestDate) === 1) {
        latestDate = dateStr;
      }
      
      labels.push(dateStr);
      
      // Convert flow to numerical value
      let flow = table.getString(r, 'value');
      if (flow === 'brown') flowValues.push(5);
      else if (flow === 'red') flowValues.push(10);
      else if (flow === 'light') flowValues.push(20);
      else if (flow === 'medium') flowValues.push(40);
      else if (flow === 'heavy') flowValues.push(80);
      else flowValues.push(0);
    }
  }

  console.log("Earliest date: " + earliestDate);
  console.log("Latest date: " + latestDate);
  console.log("Total period records: " + flowValues.length);
  totalDays = computeDateDifference(earliestDate, latestDate);
  console.log("Total days between: " + totalDays);
}

function draw() {
  drawBarChart(flowValues, labels);
  drawAxes();
}

function drawAxes() {
  stroke(0);
  strokeWeight(1);
  line(0, height-10, width, height - 10); // x-axis
  let spacing = width/totalDays;
  for (let d = 0; d <= totalDays; d += 30) {
    let x = d * spacing;
    line(x, height - 15, x, height - 5);
  }
  for (let d = 0; d <= totalDays; d += 7) {
    let x = d * spacing;
    line(x, height - 15, x, height - 10);
  }

  // Draw year labels
  fill(0);
  textAlign(CENTER, TOP);
  textSize(24);
  
  let startDate = parseDate(earliestDate);
  let endDate = parseDate(latestDate);
  
  // Iterate through each year
  for (let year = startDate.year; year <= endDate.year; year++) {
    // Get Jan 1 of this year
    let dateStr = `01/01/${String(year).slice(2)}`;
    
    // Get x position
    let norm = normalizeDate(dateStr, earliestDate, latestDate);
    let x = width * norm;
    
    // Draw tick mark
    stroke(0);
    strokeWeight(2);
    line(x, height - 20, x, height - 5);
    
    // Draw year label
    noStroke();
    fill(0);
    text(year, x, height - 40);
  }
}

function drawBarChart(values, labels) {
  // Values is flow amount, labels is dates

  background(240);
  textAlign(CENTER, BOTTOM);
  fill(50);
  noStroke();
  tooltipGraphics.clear();
  const barWidth = width / values.length;

  const maxValue = 80; // max flow value
  let preNorm = -1;

  for (let i = 0; i < values.length; i++) {
    const h = map(values[i], 0, maxValue, 0, height - 80);
    let norm = normalizeDate(labels[i], earliestDate, latestDate);

    let x = width*norm;
    if (norm === preNorm) {
      x += 10; // slight offset to avoid exact overlap
    }
    preNorm = norm;
    const y = height -20- h;

    // if (values[i] === 20) fill(255, 255, 100); // yellow for light
    // else if (values[i] === 40) fill(255, 165, 0); // orange for medium
    // else if (values[i] === 80) fill(220, 50, 50); // red for heavy

    if (values[i] === 5 ) fill(139, 90, 60); // brown 
    else if (values[i] === 10) fill(255, 180, 180); // light red for red spotting
    else if (values[i] === 20) fill(255, 180, 180); // light red for light
    else if (values[i] === 40) fill(200, 80, 80); // medium red for medium
    else if (values[i] === 80) fill(100, 0, 0); // dark red for heavy
    
    const bx = x + 5;
    const bw = barWidth - 15;
    rect(bx, y, bw, h);

    // Only show tooltip when the mouse is over this bar
    const over = mouseX >= bx && mouseX <= bx + bw && mouseY >= y && mouseY <= y + h;
    if (over) {
      // Prepare tooltip content
      let flowText = '';
      if (values[i] === 5) flowText = 'Spotting';
      else if (values[i] === 10) flowText = 'Spotting';
      else if (values[i] === 20) flowText = 'Light';
      else if (values[i] === 40) flowText = 'Medium';
      else if (values[i] === 80) flowText = 'Heavy';
      
      const lines = [
        `${labels[i]}`,
        `Flow: ${flowText}`
      ];

      push();
      // Draw a floating tooltip near the mouse
      tooltipGraphics.colorMode(RGB);
      tooltipGraphics.textAlign(LEFT, TOP);
      tooltipGraphics.textSize(12);
      const padding = 8;
      // Compute tooltip width by longest line
      let tw = 0;
      for (let t of lines) { tw = max(tw, tooltipGraphics.textWidth(t)); }
      let boxW = tw + padding * 2;
      let lineH = 16;
      let boxH = lines.length * lineH + padding * 2;
      let tipX = constrain(mouseX + 12, 0, width - boxW - 1);
      let tipY = constrain(mouseY - (boxH + 12), 0, height - boxH - 1);
      // Background and border
      tooltipGraphics.noStroke();
      tooltipGraphics.fill(0, 0, 0, 200);
      tooltipGraphics.rect(tipX, tipY, boxW, boxH, 6);
      // Text
      tooltipGraphics.fill(255);
      for (let li = 0; li < lines.length; li++) {
        tooltipGraphics.text(lines[li], tipX + padding, tipY + padding + li * lineH);
      }
      pop();
    }
  }
  image(tooltipGraphics, 0, 0);
}

function formatDate(datetimeStr) {
  // Handle format: "2017-04-12"
  let parts = datetimeStr.split("-");
  let year = parts[0].slice(2); // get last two digits
  let month = parts[1];
  let day = parts[2];

  return `${month}/${day}/${year}`;
}

// --- Date comparison helpers ---
function parseDate(str) {
    const [mStr, dStr, yStr] = str.split('/');
    let m = int(mStr);
    let d = int(dStr);
    let y = int(yStr);
    // Expand 2-digit year to 2000-2099 by default
    if (y < 100) y = 2000 + y;
    return { year: y, month: m, day: d };
}

// Comparator: returns -1 if a<b (a earlier), 1 if a>b (a later), 0 if equal
function compareDates(aStr, bStr) {
  const a = parseDate(aStr);
  const b = parseDate(bStr);
  if (!a || !b) return 0; // cannot compare
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  if (a.day !== b.day) return a.day < b.day ? -1 : 1;
  return 0;
}

function computeDateDifference(aStr, bStr) {
  const a = parseDate(aStr);
  const b = parseDate(bStr);
  if (!a || !b) return 0; // cannot compute

  const dateA = new Date(a.year, a.month - 1, a.day);
  const dateB = new Date(b.year, b.month - 1, b.day);
  const diffTime = Math.abs(dateB - dateA);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
}
//return a value between 0 and 1 representing the normalized position of dateStr between earliestDate and latestDate
function normalizeDate(dateStr,startDateStr,endDateStr) {
  const targetDate = parseDate(dateStr);
  const startDate = parseDate(startDateStr);
  const endDate = parseDate(endDateStr);
  if (!targetDate || !startDate || !endDate) return 0; // cannot compute
  const target = new Date(targetDate.year, targetDate.month - 1, targetDate.day);
  const start = new Date(startDate.year, startDate.month - 1, startDate.day);
  const end = new Date(endDate.year, endDate.month - 1, endDate.day);
  const totalDiff = end - start;
  const targetDiff = target - start;
  if (totalDiff === 0) return 0;
  return targetDiff / totalDiff;
}
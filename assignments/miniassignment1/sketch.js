// I used Copilot to help with finding p5 syntax for methods.

function setup() {
  createCanvas(500, 500);
}

function draw() {
  background(255, 241, 181); // set the background color to light yellow

  ellipseMode(CENTER);

  fill(210, 180, 140); // set fill color to light brown
  noStroke();
  circle(width/2, height/2, 300, 300); // create face

  // eyes
  fill(255, 255, 255);
  circle(width/2 - 50, height/2 - 50, 50);
  circle(width/2 + 50, height/2 - 50, 50);

  fill(0,0,0);
  circle(width/2 - 50, height/2 - 40, 30);
  circle(width/2 + 50, height/2 - 40, 30);

  // nose
  fill(0,0,0);
  noStroke();
  triangle(width/2 - 30, 275, width/2, 225, width/2 + 30, 275);

  // ears
  ellipseMode(CENTER);
  fill(101, 67, 33); // dark brown

  push();
  translate(width/2 - 150, height/2 - 50);
  rotate(-PI/3);
  ellipse(0, 0, 200, 75);
  pop();

  push();
  translate(width/2 + 150, height/2 - 50);
  rotate(PI/3);
  ellipse(0, 0, 200, 75);
  pop();
}
var c;

var sprite_flappy;
var sprite_pipe;
var sprite_city;
var sprite_floor;
var sprite_title;

var sound_point;
var sound_wing;
var sound_hit;
var sound_die;
var sound_sweetwing;

var font_flappy;

//EVENTS
var mousePress = false;
var mousePressEvent = false;
var mouseReleaseEvent = false;
var keyPress = false;
var keyPressEvent = false;
var keyReleaseEvent = false;

var pipes = [];

var score = 0;
var highscore = 0;
var speed = 0;
var gap = 80;

var gameover = false;
var page = "MENU";

var overflowX = 0;

var startgame = false;

// Halloween additions
var bats = [];
var starScore = 0;
var stars = [];

var flappy_bird = {
  
  x : 100,
  y : 0,
  
  target : 0,
  
  velocityY : 0,
  
  fly : false,
  
  angle : 0,
  
  falls : false,
  flashAnim : 0,
  flashReturn : false,
  kinematicAnim : 0,
  
  display : function() {
    
    if((!mousePress) || this.falls) {
      push();
        translate(this.x,this.y);
        rotate(radians(this.angle));
        image(sprite_flappy,0,0, 50, 50);
      pop();
    }
    else {
      push();
        translate(this.x,this.y);
        rotate(radians(this.angle));
        image(sprite_flappy,0,0, 50, 50);
      pop();
    }
  },
  
  update : function() {
    if(this.falls) {
      if(this.flashAnim>255) {
        this.flashReturn = true;
      }
      
      if(this.flashReturn) {
        this.flashAnim -=60;
      }
      else {
        this.flashAnim +=60;
      }
      
      if(this.flashReturn && this.flashAnim === 0) {
        gameover = true;
        menu_gameover.easein();
        try { sound_die.play(); } catch(e) {}
				
        if(score > highscore) { highscore = score; }
      }
      
      this.y += this.velocityY;
      this.velocityY += 0.4;
      this.angle += 4;
      
      if(speed > 0) {
        speed = 0;
      }
      
      if(this.angle > 90) {
        this.angle = 90;
      }
    }
    else {
      this.y += this.velocityY;
      this.angle += 2.5;
    
      if(this.angle > 90) {
        this.angle = 90;
      }
    
      if(mousePressEvent || (keyPressEvent && key == ' ') ) {
        try { sound_wing.play(); } catch(e) {}
        
        this.velocityY = 0;
        this.fly = true;
        this.target = clamp(this.y - 60,-19,height);
        this.angle = -45;
      }
    
    
      if(this.y < this.target) {
        this.fly = false;
        this.target = 10000;
      }
    
    
      if(!this.fly) {
        this.velocityY+=0.4;
      }
      else {
        this.y -= 5;
      }
      
      if(this.y > height-49) {
        if(!flappy_bird.falls) { try { sound_hit.play(); } catch(e) {} }
        this.falls = false;
      }
    }
    this.y = clamp(this.y,-20,height-50);
  },
  
  kinematicMove : function() {
    if(gameover) {
      this.x = width/2;
      this.y = height/2;
      
      gameover = false;
      score = 50;
      gap = 50;
    }
    
    this.y = height/2 + map( sin(frameCount*0.1),0,1,-2,2 );
    
    push();
      translate(this.x,this.y);
      image(sprite_flappy,0,0, 50, 50);
    pop();
  }
}

function setup() {
  if(mobile()) {
    c = createCanvas(windowWidth,windowHeight);
  }
  else {
    c = createCanvas(400,600);
  }
  
  imageMode(CENTER);
  rectMode(CENTER);
  ellipseMode(CENTER);
  textAlign(CENTER,CENTER);
  
  noSmooth();
  
  pipes[5] = new Pipe();
  
  // Create some bats
  for(let i = 0; i < 3; i++) {
    bats.push({
      x: random(width),
      y: random(50, 200),
      speed: random(1, 3)
    });
  }
  
  // Create collectible stars periodically
  setInterval(() => {
    if(page === 'GAME' && !gameover) {
      stars.push({
        x: width + 20,
        y: random(100, height - 100),
        collected: false
      });
    }
  }, 3000);
  
  //load
  sprite_flappy = loadImage('witch.png');
  sprite_pipe = loadImage('pipe.png');
  sprite_city = loadImage('city.png');
  sprite_floor = loadImage('floor.png');
  sprite_title = loadImage('title.png');
  
  sound_point = loadSound('sfx_point.wav');
  sound_hit = loadSound('sfx_hit.wav');
  sound_die = loadSound('sfx_die.wav');
  sound_wing = loadSound('sfx_wing.wav');
  sound_sweetwing = loadSound('sfx_swooshing.wav');
  
  font_flappy = loadFont('flappy-font.ttf');
  
  flappy_bird.y = height/5;
  
  try { textFont(font_flappy); } catch(e) {}
}

function draw() {
  background(25,25,60);
  
  switch(page) {
    case 'GAME':
      page_game();
      break;
    case 'MENU':
      page_menu();
      break;
  }
  
  mousePressEvent = false;
  mouseReleaseEvent = false;
  keyPressEvent = false;
  keyReleaseEvent = false;
}

function mousePressed() {
  mousePress = true;
  mousePressEvent = true;
}
function mouseReleased() {
  mousePress = false;
  mouseReleaseEvent = true;
}
function keyPressed() {
  keyPress = true;
  keyPressEvent = true;
}
function keyReleased() {
  keyPress = false;
  keyReleaseEvent = true;
}

function page_game() {
  
  drawStars();
  drawMoon();
  drawBats();
  
  overflowX += speed;
  if(overflowX > sprite_city.width/2) {
    overflowX = 0;
  }
  
  image(sprite_city, sprite_city.width/2/2 ,height-sprite_city.height/2/2-40,sprite_city.width/2,sprite_city.height/2);
  
  if(!flappy_bird.falls) {
    if(parseInt(frameCount)%70 === 0) {
      pipes.push(new Pipe());
    }
  }
  
  for(var i=0; i<pipes.length; i++) {
    if(pipes[i].x < -50) {
      pipes.splice(i,1);
    }
    
    try {
      pipes[i].display();
      pipes[i].update();
    } catch(e) {}
  }
  
  drawCollectibleStars();

  image(sprite_floor,sprite_floor.width-overflowX,height-sprite_floor.height ,sprite_floor.width*2,sprite_floor.height*2);
  image(sprite_floor,sprite_floor.width+sprite_floor.width-overflowX,height-sprite_floor.height ,sprite_floor.width*2,sprite_floor.height*2);
  image(sprite_floor,sprite_floor.width+sprite_floor.width*2-overflowX,height-sprite_floor.height ,sprite_floor.width*2,sprite_floor.height*2);
  
  flappy_bird.display();
  flappy_bird.update();
  flappy_bird.x = smoothMove(flappy_bird.x,90,0.02);
  
  if(!gameover) {
    push();
      stroke(138, 43, 226);
      strokeWeight(5);
      fill(255);
      textSize(30);
      text(score,width/2,50);
    pop();
  }
  
  push();
    noStroke();
    fill(255,flappy_bird.flashAnim);
    rect(width/2,height/2,width,height);
  pop();
  
  if(gameover) {
    menu_gameover.display();
    menu_gameover.update();
  }
}

function page_menu() {
  
  drawStars();
  drawMoon();
  drawBats();
  
  speed = 100;
  overflowX += speed;
  if(overflowX > sprite_city.width/2) {
    overflowX = 0;
  }
  
  image(sprite_city, sprite_city.width/2/2 ,height-sprite_city.height/2/2-40,sprite_city.width/2,sprite_city.height/2);
  
  image(sprite_floor,sprite_floor.width-overflowX,height-sprite_floor.height ,sprite_floor.width*2,sprite_floor.height*2);
  image(sprite_floor,sprite_floor.width+sprite_floor.width-overflowX,height-sprite_floor.height ,sprite_floor.width*2,sprite_floor.height*2);
  image(sprite_floor,sprite_floor.width+sprite_floor.width*2-overflowX,height-sprite_floor.height ,sprite_floor.width*2,sprite_floor.height*2);
  
  push();
    stroke(138, 43, 226);
    strokeWeight(5);
    fill(255);
    textSize(40);
    text('WITCHY FLIGHT', width/2, 100);
  pop();
  
  flappy_bird.kinematicMove();
  
  push();
    fill(255, 165, 0);
    stroke(255);
    strokeWeight(3);
    text('Tap to play',width/2,height/2-50);
  pop();

  if(mousePressEvent || (keyPressEvent && key == ' ') ) {
  	page = "GAME";
    resetGame();
  	
  	flappy_bird.velocityY = 0;
    flappy_bird.fly = true;
    flappy_bird.target = clamp(this.y - 60,-19,height);
    flappy_bird.angle = -45;
    flappy_bird.update();
  }
  flappy_bird.x = width/2;
}

function Pipe () {
  
  this.gapSize = gap;
  this.y = random(150,height-150);
  this.x = width + 50;
  this.potential = true;
  
  this.display = function() {
    push();
      translate(this.x,this.y+this.gapSize+sprite_pipe.height/2/2);
      image(sprite_pipe, 0,0 ,sprite_pipe.width/2,sprite_pipe.height/2);
    pop();
    
    push();
      translate(this.x,this.y-this.gapSize-sprite_pipe.height/2/2);
      rotate(radians(180));
      scale(-1,1);
      image(sprite_pipe,0,0,sprite_pipe.width/2,sprite_pipe.height/2);
    pop();
    
    if(this.potential && (flappy_bird.x > this.x-25 && flappy_bird.x < this.x+25)) {
      score++;
      try { sound_point.play(); } catch(e) {}
      
      if(gap > 60) { gap--; }
      
      this.potential = false;
    }
    
    if( ( 
        (flappy_bird.x+20 > this.x-25 && flappy_bird.x-20 < this.x+25) && 
        (flappy_bird.y+20 > (this.y-this.gapSize-sprite_pipe.height/2/2)-200 && flappy_bird.y-20 < (this.y-this.gapSize-sprite_pipe.height/2/2)+200)
        ) ||
        ( 
        (flappy_bird.x+20 > this.x-25 && flappy_bird.x-20 < this.x+25) && 
        (flappy_bird.y+20 > (this.y+this.gapSize+sprite_pipe.height/2/2)-200 && flappy_bird.y-20 < (this.y+this.gapSize+sprite_pipe.height/2/2)+200)
        )) {
      
      if(!flappy_bird.falls) { try { sound_hit.play(); } catch(e) {} }
      flappy_bird.falls = true;
    }
  }
  this.update = function() {
    this.x-= speed;
  }
}

function clamp(value,min,max) {
  if(value < min) {
    value = min;
  }
  if(value > max) {
    value = max;
  }
  return value;
}

function resetGame() {
  gameover = false;
  gap = 80;
  speed = 5;
  score = 0;
  starScore = 0;
  stars = [];
  flappy_bird.y = height/2
  flappy_bird.falls = false;
  flappy_bird.velocityY = 0;
  flappy_bird.angle = 0;
  flappy_bird.flashAnim = 0;
  flappy_bird.flashReturn = false;
  pipes = [];
  flappy_bird.target = 10000;
  menu_gameover.ease = 0;
}

var menu_gameover = {
  
  ease : 0,
  easing : false,
  open : false,
  
  display : function() {
    
    push();
      translate(width/2,height/2);
      scale(this.ease);
      
      stroke(83,56,71);
      strokeWeight(2);
      fill(222,215,152);
      rect(0,0,200,200);
      
      noStroke();
      fill(83,56,71);
      text('Halloween Edition',0,-50);
      
      textSize(20);
      strokeWeight(5);
      stroke(83,56,71);
      fill(255);
      text('Witchy Flight',0,-80);
      
      push();
        textAlign(LEFT,CENTER);
        textSize(12);
        noStroke();
        fill(83,56,71);
        text('score : ',-80,0);
        text('pumpkins : ',-80,20);
        text('highscore : ',-80,40);
        
        stroke(0);
        strokeWeight(3);
        fill(255);
        text(score,20,0);
        text(starScore,20,20);
        text(highscore,20,40);
      pop();
      
      if(press('restart',0,140,width/2,height/2)) { 
        resetGame();
      }
      
      if(press(' menu ',0,190,width/2,height/2)) { page = 'MENU'; }
    pop();
  },
  
  update : function() {
    if(this.easing) {
      this.ease += 0.1;
      if(this.ease > 1) {
        this.open = true;
        this.ease = 1;
        this.easing = false;
      }
    }
  },
  
  easein : function() {
    this.easing = true;
  }
}

function press(txt,x,y,tX,tY) {
  var this_h = false;
  
  if(mouseX > tX+x-textWidth(txt)/2-10 && mouseX < tX+x+textWidth(txt)/2+10 && mouseY > tY+y-textAscent()/2-10 && mouseY < tY+y+textAscent()/2+10) {
    this_h = true;
  }
  
  push();
    textSize(16);
    
    if(this_h && mousePress) {
      noStroke();
      fill(83,56,71);
      rect(x,y+3,textWidth(txt)+25+10,textAscent()+10+10);
      
      fill(250,117,49);
      stroke(255);
      strokeWeight(3);
      rect(x,y+2,textWidth(txt)+25,textAscent()+10);
    
      noStroke();
      fill(255);
      text(txt,x,y+2);
    }
    else {
    noStroke();
    fill(83,56,71);
    rect(x,y+2,textWidth(txt)+25+10,textAscent()+10+12);
    
    if(this_h) {
      fill(250,117,49);
    }
    else {
      fill(230,97,29);
    }
    stroke(255);
    strokeWeight(3);
    rect(x,y,textWidth(txt)+25,textAscent()+10);
    
    noStroke();
    fill(255);
    text(txt,x,y);
    }
  pop();
  
  if(this_h && mouseReleaseEvent) { try { sound_sweetwing.play(); } catch(e) {} }
  
  return (this_h && mouseReleaseEvent);
}

function smoothMove(pos,target,speed) {
	return pos + (target-pos) * speed;
}

function drawStars() {
  push();
  fill(255, 255, 200);
  noStroke();
  for(let i = 0; i < 50; i++) {
    let x = (i * 37) % width;
    let y = (i * 23) % (height - 100);
    ellipse(x, y, 2, 2);
  }
  pop();
}

function drawMoon() {
  push();
    fill(255, 255, 200);
    noStroke();
    ellipse(width - 80, 80, 60, 60);
  pop();
}

function drawBats() {
  for(let bat of bats) {
    push();
      fill(50, 50, 50);
      noStroke();
      triangle(bat.x - 10, bat.y, bat.x, bat.y - 5, bat.x + 10, bat.y);
    pop();
    
    bat.x -= bat.speed;
    if(bat.x < -20) {
      bat.x = width + 20;
      bat.y = random(50, 200);
    }
  }
}

function drawCollectibleStars() {
  for(let i = stars.length - 1; i >= 0; i--) {
    let star = stars[i];
    
    if(!star.collected) {
      push();
        translate(star.x, star.y);
        
        // Draw pumpkin body
        fill(255, 140, 0); // Orange
        stroke(0);
        strokeWeight(2);
        ellipse(0, 0, 25, 25);
        
        // Draw pumpkin stem
        fill(34, 139, 34); // Green
        rect(0, -15, 4, 8);
        
        // Draw pumpkin face
        fill(0);
        noStroke();
        // Eyes
        triangle(-6, -3, -4, -3, -5, 0); // Left eye
        triangle(4, -3, 6, -3, 5, 0); // Right eye
        // Mouth
        arc(0, 5, 10, 6, 0, PI); // Smile
        
      pop();
      
      if(dist(flappy_bird.x, flappy_bird.y, star.x, star.y) < 30) {
        star.collected = true;
        starScore++;
        try { sound_point.play(); } catch(e) {}
      }
      
      star.x -= speed;
      
      if(star.x < -20) {
        stars.splice(i, 1);
      }
    }
  }
}

function mobile() { 
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}
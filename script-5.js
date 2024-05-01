const canvas = document.getElementById('canvas5');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = window.innerWidth;
const CANVAS_HEIGHT = canvas.height = window.innerHeight;

const collisioncanvas = document.getElementById('collisioncanvas');
const collisionctx = collisioncanvas.getContext('2d');
const COL_CANVAS_WIDTH = collisioncanvas.width = window.innerWidth;
const COL_CANVAS_HEIGHT = collisioncanvas.height = window.innerHeight;

let gameOver = false;

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;
let score = 0;
ctx.font = '50px Impact';
let ravens = [];
class Raven {
    constructor(){
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = 'raven.png';
        this.frame = 0;
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random()*0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.flapInterval = Math.random() * 50 + 50;
        this.timeSinceFlap = 0;
        this.randomColor = [Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255)];
        this.color = 'rgb(' + this.randomColor[0] +','+this.randomColor[1] + ',' + this.randomColor[2] + ')';
    }
    update(deltatime){
        if(this.y<0 || this.y > canvas.height - this.height ) {
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if(this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceFlap += deltatime;
        if(this.timeSinceFlap > this.flapInterval){
           if(this.frame > 4 ) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0;
        }
         if(this.x < 0 - this.width) gameOver =true;
    }
    draw(){
        collisionctx.fillStyle = this.color;
        ctx.drawImage(this.image,this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width,this.height);
        collisionctx.fillRect(this.x,this.y,this.width,this.height);

    }
}

const raven = new Raven();

let explosion = [];

class Explosion {
    constructor(x,y,size){
        this.image = new Image();
        this.image.src = 'boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = 'boom2.wav';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;
    }
    update(deltatime){
       if(this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltatime;
       if(this.timeSinceLastFrame > this.frameInterval){
        this.frame++;
        this.timeSinceLastFrame = 0;
        if(this.frame > 5) this.markedForDeletion = true;

       }
    }

    draw(){
        ctx.drawImage(this.image,this.frame * this.spriteWidth,0,this.spriteWidth,this.spriteHeight,this.x,this.y - this.size/4 ,this.size,this.size);

    }
}

function drawScore(){
     ctx.fillStyle = 'white';
     ctx.fillText('score: '+score,50,75);
     
     ctx.fillStyle = 'black';
     ctx.fillText('score: '+score,55,80);
}

function overdisplay(){
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('GAMEOVER your score'+score,canvas.width/2,canvas.height/2);
}

window.addEventListener('mousemove',function(e){
      const detectPixelColor = collisionctx.getImageData(e.x,e.y,1,1);
      console.log(detectPixelColor);
      const pc = detectPixelColor.data;
      ravens.forEach(object => {
        if(object.randomColor[0] === pc[0] && object.randomColor[1] === pc[1] &&
            object.randomColor[2] === pc[2]){
                //collosion detected 
                object.markedForDeletion = true;
                score++;
                explosion.push(new Explosion(object.x,object.y,object.width));
            }
      })
});

function animate(timestamp){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    collisionctx.clearRect(0,0,canvas.width,canvas.height);
    let deltatime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltatime;6
    if(timeToNextRaven > ravenInterval){
        ravens.push(new Raven());
        timeToNextRaven = 0;       
        ravens.sort(function (a,b){
            return a.width - b.width;
        });     
    };
    drawScore();
    [...ravens, ...explosion].forEach(object => object.update(deltatime));
    [...ravens, ...explosion].forEach(object => object.draw());
    ravens = ravens.filter(object=> !object .markedForDeletion);
    explosion = explosion.filter(object=> !object .markedForDeletion);
    if(!gameOver) requestAnimationFrame(animate);
    else{
        // alert("game over, your score is"+score);
        overdisplay();
        // location.reload();
    }

}
animate(0);
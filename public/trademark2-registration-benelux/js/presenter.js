var spritesheet = new Image();
const cols = 10;
const rows = 5;

const animations = {
  idle: { start:0, frames:10, bounce:true },
  gesture1: { start:10, frames:10, bounce:true },
  gesture2: { start:10, frames:25, bounce:true },
  gesture3: { start:10, frames:40, bounce:true },
}

class Presenter {
  constructor() {
    this.time = 0;
    this.hidden = false;
    if (!spritesheet.src)
      spritesheet.src = "img/girl10x5.png";
  }
  
  update(dt) {
    this.time += dt;
  }
  
  animate(canvas) {
    speech.style["display"] = "none";
    if (this.hidden) return;

    // animation
    let anim = this.anim;
    if (!anim) {
      if (this.voice && !this.voice.paused) {
        anim = animations["gesture2"];
      } else {
        anim = animations["idle"];
        this.voice = null;
      }
    }

    // calculate frame
    let t = this.time;
    let i = Math.floor(t/0.1);
    let n = anim.frames - 1;
    if (i > n*2)
      this.anim = null;
    let frame = Math.min(i, n);
    if (anim.bounce)
      frame = n - Math.abs(i%(n*2) - n);
    frame += anim.start;

    // draw
    let ox = frame%cols;
    let oy = (frame - ox)/cols;
    const fw = spritesheet.width/cols;
    const fh = spritesheet.height/rows;
    
    let w = canvas.width;
    let h = canvas.height;
    
    let ss = Math.min(h*0.6/fh, w*0.6/fw);
    ss = Math.min(ss, 1);
    
    let tx = 0;
    let ty = h - fh*ss;

    let ctx = canvas.getContext("2d");
    ctx.save();
    ctx.resetTransform();
  
    let grad = ctx.createLinearGradient(0, h, h/2, 0);
    grad.addColorStop(0, "rgba(0,0,0,0.75)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.shadowColor = "#aaa";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.drawImage(spritesheet, ox*fw, oy*fh, fw, fh, tx, ty, fw*ss, fh*ss);

    if (message.innerHTML != "")
      speech.style["display"] = "block";
    // adjust speech bubble
    let tail = document.getElementById("tail");

    //if (w > h) {
    if (false) {
      // above
      speech.style["left"] = "10px";
      speech.style["bottom"] = `${fh*0.9*ss}px`;
      speech.style["width"] = `${fw*ss - 40}px`;
      tail.style["left"] = "3em";
      tail.style["bottom"] = "-2em";
    } else {
      // aside
      speech.style["left"] = `${fw*0.9*ss - 20}px`;
      speech.style["width"] = `${fw*ss - 40}px`;
      speech.style["bottom"] = "10px";
      tail.style["left"] = "-2em";
      tail.style["bottom"] = "3em";
    }
    
    ctx.restore();
  }
  
  hide() {
    this.hidden = true;
    this.anim = null;
    //overlay.style.visibility = "hidden";
    if (this.voice)
      this.voice.pause();
  }
  
  show() {
    this.hidden = false;
    //overlay.style.visibility = "visible";
  }

  setAction(action) {
    if (this.anim)
      return;
    this.anim = animations[action];
    this.time = 0;
  }
  
  speak(file) {
    if (this.hidden) return;
    let voice = new Audio();
    voice.src = file;
    voice.play();
    if (this.voice)
      this.voice.pause();
    this.voice = voice;
  }

  draw(canvas) {
    let ctx = canvas.getContext("2d");
    
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!spritesheet.complete || spritesheet.naturalHeight === 0)
      return;
    
    this.animate(canvas);
  }
}
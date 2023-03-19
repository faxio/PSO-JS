const canvas = document.querySelector("#canvas1");
const ctx = canvas.getContext("2d");
const img = document.getElementById("patterImage");
const informacion = document.querySelector(".informacion");
canvas.width = 512;
canvas.height = 512;

//ctx.drawImage(img, 0, 0);

let puntos = 1;
let ParticlesS = []; // arreglo de partículas

circleRadius = 10; // radio del círculo, solo para despliegue
let gbestx = 255,
  gbesty = 255,
  gbest = 255; // posición y fitness del mejor global

let w = 5000; // inercia: baja (~50): explotación, alta (~5000): exploración (2000 ok)
let C1 = 30;
let C2 = 10; // learning factors (C1: own, C2: social) (ok)
let evals = 0;
let evals_to_best = 0; //número de evaluaciones, sólo para despliegue
let maxv = 3; // max velocidad (modulo)

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.lineWidth = 1;
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.vx = Math.random() * (1 + 1) - 1;
    this.vy = Math.random() * (1 + 1) - 1;
    this.pfit = 255;
    this.fit = 255;
  }

  eval() {
    //recibe imagen que define función de fitness
    evals++;
    //color c=surf.get(int(x),int(y)); // obtiene color de la imagen en posición (x,y)
    let color = ctx.getImageData(this.x, this.y, 1, 1).data;

    this.fit = color[0]; // rojo
    this.green = color[1]; // rojo
    this.blue = color[2]; // rojo

    if (this.fit < this.pfit) {
      // actualiza local best si es mejor
      this.pfit = this.fit;
      this.px = this.x;
      this.py = this.y;
    }

    if (this.fit < gbest) {
      // actualiza global best
      gbest = this.fit;
      gbestx = this.x;
      gbesty = this.y;
      evals_to_best = evals;
      console.log(color);
    }
    //return fit; //retorna la componente roja
  }

  move() {
    this.vx =
      w * this.vx +
      Math.random() * (this.px - this.x) +
      Math.random() * (gbestx - this.x);
    this.vy =
      w * this.vy +
      Math.random() * (this.py - this.y) +
      Math.random() * (gbesty - this.y);

    let modu = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (modu > maxv) {
      this.vx = (this.vx / modu) * maxv;
      this.vy = (this.vy / modu) * maxv;
    }
    this.x = this.x + this.vx;
    this.y = this.y + this.vy;

    if (this.x > this.canvas.width || this.x < 0) this.vx = -this.vx;
    if (this.y > this.canvas.height || this.y < 0) this.vy = -this.vy;
  }

  display() {
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.arc(this.x, this.y, circleRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "white";
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - 10 * this.vx, this.y - 10 * this.vy);
    ctx.stroke();
  }
}

class Particles {
  constructor(/*gbestx, gbesty, gbest,*/ puntos, canvas) {
    this.evals = 0;
    this.evals_to_best = 0;
    this.particles = [];
    this.puntos = puntos;
    this.canvas = canvas;
  }
  createParticles() {
    for (let i = 0; i < puntos; i++) {
      this.particles.push(new Particle(this.canvas));
    }
    console.log(this.particles);
  }

  despliegaBest() {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.arc(gbestx, gbesty, circleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.strokeStyle = "rgb(200,255,255)";
    ctx.fill();
    ctx.stroke();

    //PFont f = createFont("Arial",16,true);
    //textFont(f,15);
    //fill(#00ff00);
    //text("Best fitness: "+str(gbest)+"\nEvals to best: "+str(evals_to_best)+"\nEvals: "+str(evals),10,20);
    const title = document.createElement("h2");
    title.innerText = "best fitness: " + gbest;

    const evalToBest = document.createElement("h2");
    evalToBest.innerText = "Evals to best: " + evals_to_best;

    const evaluaciones = document.createElement("h2");
    evaluaciones.innerText = "Evals to best: " + evals;

    while (informacion.firstChild) {
      informacion.removeChild(informacion.firstChild);
    }
    informacion.appendChild(title);
    informacion.appendChild(evalToBest);
    informacion.appendChild(evaluaciones);
  }

  initAnimation() {
    //ctx.drawImage(img, 0, 0);
    dibujarTablero(tablero);
    for (let i = 0; i < this.puntos; i++) {
      this.particles[i].display();
    }
    this.despliegaBest();
    for (let i = 0; i < this.puntos; i++) {
      this.particles[i].eval();
      this.particles[i].move();
    }
  }
}

const delayFunction = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

const mostrar = async () => {
  while (true) {
    await delayFunction(10);
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ParticlesAlgorithms.initAnimation();
  }
};
function generarDominio(limites, step) {
  let dominio = [];
  let dominios = [];
  for (let i = limites[0] + step; i < limites[1]; i += step) {
    for (let k = limites[0] + step; k < limites[1]; k += step) {
      dominio.push(k);
    }
    dominios.push(dominio);
    dominio = [];
  }

  console.log(dominios);
  return dominios;
}

function generarFuncion(dominio) {
  let tablero = [];
  let figura = [];
  let n = 2;
  let ac = 0;
  for (let j = 0; j < dominio.length; j++) {
    for (let k = 0; k < dominio[j].length; k++) {
      for (let i = 1; i <= n; i++) {
        ac += dominio[j][k] ** 2 - 10 * Math.cos(2 * Math.PI * dominio[j][k]);
      }
      figura.push(10 * n + ac);
      ac = 0;
    }

    tablero.push(figura);
    figura = [];
  }
  console.log(tablero);
  return tablero;
}

function dibujarTablero(tablero) {
  size = canvas.width / tablero.length;

  for (let i = 0; i < tablero.length; i++) {
    for (let j = 0; j < tablero[i].length; j++) {
      ctx.beginPath();
      ctx.fillStyle = `rgb(${tablero[i][j]},${100},${220})`;
      ctx.fillRect(i * size, j * size, size, size);
      ctx.fill();
    }
  }
}

let limites = [-7, 7];
let step = 0.5;
let dominio = generarDominio(limites, step);

let tablero = generarFuncion(dominio);
dibujarTablero(tablero);

let ParticlesAlgorithms = new Particles(puntos, canvas, ctx, circleRadius);
ParticlesAlgorithms.createParticles();
ParticlesAlgorithms.initAnimation();

mostrar();

//requestAnimationFrame(animate);

/*
void draw(){

  despliegaBest();
  //mueve puntos
  for(int i = 0;i<puntos;i++){
    fl[i].move();
    fl[i].Eval(surf);
  }
  
}
*/

const canvas = document.querySelector("#canvas1");
const ctx = canvas.getContext("2d");
const img = document.getElementById("patterImage");
const informacion = document.querySelector(".informacion");
canvas.width = 512;
canvas.height = 512;

//ctx.drawImage(img, 0, 0);

let puntos = 20;
let ParticlesS = []; // arreglo de partículas

circleRadius = 10; // radio del círculo, solo para despliegue
let gbestx = 2500,
  gbesty = 2500,
  gbest = 2500; // posición y fitness del mejor global

let w = 5000; // inercia: baja (~50): explotación, alta (~5000): exploración (2000 ok)
let C1 = 30;
let C2 = 10; // learning factors (C1: own, C2: social) (ok)
let evals = 0;
let evals_to_best = 0; //número de evaluaciones, sólo para despliegue
let maxv = 3; // max velocidad (modulo)
let menorProbabilidadCruzamiento = 0.2;
let mayorProbabilidadCruzamiento = 0.8;

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.lineWidth = 1;
    this.x = Math.floor(Math.random() * this.canvas.width);
    this.y = Math.floor(Math.random() * this.canvas.height);
    this.pfit = 2500;
    this.fit = 2500;
    this.probabilidad =
      Math.random() *
        (mayorProbabilidadCruzamiento - menorProbabilidadCruzamiento) +
      menorProbabilidadCruzamiento;
  }

  eval() {
    //recibe imagen que define función de fitness
    evals++;
    //color c=surf.get(int(x),int(y)); // obtiene color de la imagen en posición (x,y)

    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.x >= this.canvas.width) this.x = this.canvas.width - 1;
    if (this.y >= this.canvas.height) this.y = this.canvas.height - 1;

    this.fit = valores[Math.floor(this.x)][Math.floor(this.y)];

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
    }
    //return fit; //retorna la componente roja
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
    this.seleccionados = [];
    this.cruzamientos = [];
    this.probabilidad =
      Math.random() *
        (mayorProbabilidadCruzamiento - menorProbabilidadCruzamiento) +
      menorProbabilidadCruzamiento;
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
    ctx.drawImage(canvasImage, 0, 0);
    //dibujarFigura(valores, size);
    for (let i = 0; i < this.puntos; i++) {
      this.particles[i].display();
    }
    this.despliegaBest();
    this.seleccion();
    this.cruzamiento();
    for (let i = 0; i < this.puntos; i++) {
      this.particles[i].eval();
    }
  }

  seleccion() {
    this.seleccionados = [];
    let largo = Math.floor(this.particles.length / 2);

    for (let i = 0; i < largo; i++) {
      if (this.particles[2 * i].fit > this.particles[2 * i + 1]) {
        this.seleccionados.push(this.particles[2 * i]);
      } else {
        this.seleccionados.push(this.particles[2 * i + 1]);
      }
    }

    if (largo % 2 != 0) {
      this.seleccionados.push(this.particles[this.particles.length - 1]);
    }
  }

  cruzamiento() {
    this.cruzamientos = [];
    let seleccionado_reproduccion = [];

    let largo = Math.floor(this.seleccionados.length);

    for (let i = 0; i < largo; i++) {
      //console.log(this.seleccionados[i].probabilidad, this.probabilidad);
      if (this.seleccionados[i].probabilidad > this.probabilidad) {
        seleccionado_reproduccion.push(this.seleccionados[i]);
      } else {
        this.cruzamientos.push(this.seleccionados[i]);
      }
      console.log(seleccionado_reproduccion, seleccionado_reproduccion.length);
      /*
      if (seleccionado_reproduccion.length == 2) {
        for (let j = 0; j < 2; j++) {
          let particle = new Particle(this.canvas);
          let fatherParticleX = seleccionado_reproduccion[0].x;
          let fatherParticleY = seleccionado_reproduccion[0].y;
          let motherParticleX = seleccionado_reproduccion[1].x;
          let motherParticleY = seleccionado_reproduccion[1].y;
          particle.x =
            Math.random() * (fatherParticleX - motherParticleX) +
            motherParticleX;
          particle.y =
            Math.random() * (fatherParticleY - motherParticleY) +
            motherParticleY;
          this.cruzamientos.push(particle);
        }
        seleccionado_reproduccion = [];
      }
      */
    }

    if (seleccionado_reproduccion.length == 1) {
      this.cruzamientos.push(seleccionado_reproduccion[0]);
    }
    console.log(this.cruzamientos.length, seleccionado_reproduccion.length);
  }
}

const delayFunction = (ms) => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        resolve();
      }, ms);
    } catch (err) {
      console.log(err);
    }
  });
};

const mostrar = async () => {
  while (true) {
    await delayFunction(10000);
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ParticlesAlgorithms.initAnimation();
  }
};

function generarDominio(limites, cantidadPixeles) {
  let diferencia =
    (Math.abs(limites[0]) + Math.abs(limites[1])) / cantidadPixeles;
  let dominio = [];
  for (let i = limites[0] + diferencia; i <= limites[1]; i += diferencia)
    dominio.push(i);

  console.log(dominio);
  return dominio;
}

function rastringin(vector) {
  let ac = 0,
    n = 2;
  for (let i = 1; i <= n; i++) {
    ac += vector[i - 1] ** 2 - 10 * Math.cos(2 * Math.PI * vector[i - 1]);
  }
  return 10 * n + ac;
}

function generarFuncion(dominio) {
  let valor;
  let size = canvas.width / dominio.length;
  let figura = [];
  let valores = [];
  for (let i = 0; i < dominio.length; i++) {
    for (let j = 0; j < dominio.length; j++) {
      valor = rastringin([dominio[i], dominio[j]]);
      figura.push(valor);
    }
    valores.push(figura);
    figura = [];
  }
  return [valores, size];
}

function dibujarFigura(valores, size) {
  for (let i = 0; i < valores.length; i++) {
    for (let j = 0; j < valores[i].length; j++) {
      ctx.beginPath();
      ctx.fillStyle = `hsl(${valores[i][j] + 130}, 100%, 30%)`;
      ctx.fillRect(i * size, j * size, size, size);
      ctx.fill();
    }
  }
  let imageX = new Image();
  imageX.src = canvas.toDataURL();
  return imageX;
}

let limites = [-3, 7];
let cantidadPixeles = 512;
let dominio = generarDominio(limites, cantidadPixeles);
let [valores, size] = generarFuncion(dominio);
let canvasImage = dibujarFigura(valores, size);
//dibujarTablero(tablero);

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
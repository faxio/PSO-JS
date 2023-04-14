const canvas = document.querySelector("#canvas1");
const ctx = canvas.getContext("2d");
const img = document.getElementById("patterImage");
const informacion = document.querySelector(".informacion");
canvas.width = 512;
canvas.height = 512;

// Datos para gráficas

let maxGenGraph = 30000;
let historialBest = [];
let historialFitnes = [];
let iteraciones = [];

// Referencia para gráficas
const grafica = document.querySelector("#grafica").getContext("2d");

let puntos = 100;
let ParticlesS = []; // arreglo de partículas

circleRadius = 10; // radio del círculo, solo para despliegue
let gbestx = 2500,
  gbesty = 2500,
  gbest = 2500, // posición y fitness del mejor global
  promedio = 10;

let w = 2000; // inercia: baja (~50): explotación, alta (~5000): exploración (2000 ok)
let C1 = 0.2;
let C2 = 0.1; // learning factors (C1: own, C2: social) (ok)
let evals = 0;
let evals_to_best = 0; //número de evaluaciones, sólo para despliegue
let maxv = 3; // max velocidad (modulo)

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.lineWidth = 1;
    this.x = Math.floor(Math.random() * this.canvas.width);
    this.y = Math.floor(Math.random() * this.canvas.height);
    this.vx = Math.random() * (1 + 1) - 1;
    this.vy = Math.random() * (1 + 1) - 1;
    this.pfit = 200;
    this.fit = 200;
  }

  eval() {
    //recibe imagen que define función de fitness
    evals++;
    //color c=surf.get(int(x),int(y)); // obtiene color de la imagen en posición (x,y)

    //graficaBest.data.datasets[0] = historialBest;
    //graficaBest.data.datasets[1] = historialFitnes;
    //graficaBest.update();

    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.x > this.canvas.width) this.x = this.canvas.width - 1;
    if (this.y > this.canvas.height) this.y = this.canvas.height - 1;

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

  move() {
    /*
    this.vx =
      this.vx +
      Math.random() * C1 * (this.px - this.x) +
      Math.random() * C2 * (gbestx - this.x);
    this.vy =
      this.vy +
      Math.random() * C1 * (this.py - this.y) +
      Math.random() * C2 * (gbesty - this.y);
    */
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
    this.particlesAllFits = 0;
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

    for (let i = 0; i < this.particles.length; i++) {
      promedio += this.particles[i].fit;
    }
    promedio = promedio / this.particles.length;
  }

  initAnimation() {
    ctx.drawImage(canvasImage, 0, 0);
    //dibujarFigura(valores, size);
    for (let i = 0; i < this.puntos; i++) {
      this.particles[i].display();
    }
    this.despliegaBest();
    for (let i = 0; i < this.puntos; i++) {
      this.particles[i].eval();
      this.particles[i].move();
      this.particlesAllFits += this.particles[i].fit;
    }
    historialBest.push(this.particlesAllFits / this.particles.length);
    this.particlesAllFits = 0;
    historialFitnes.push(gbest);
    iteraciones.push(historialBest.length - 1);

    if (evals >= maxGenGraph) {
      console.log(historialBest, historialFitnes);
      const data = {
        labels: iteraciones,
        datasets: [
          {
            label: "Promedio de fit",
            data: historialBest, // La data es un arreglo que debe tener la misma cantidad de valores que la cantidad de etiquetas
            backgroundColor: "rgba(54, 162, 235, 0.2)", // Color de fondo
            borderColor: "rgba(54, 162, 235, 1)", // Color del borde
            borderWidth: 1, // Ancho del borde
          },
          {
            label: "Best Value fit",
            data: historialFitnes, // La data es un arreglo que debe tener la misma cantidad de valores que la cantidad de etiquetas
            backgroundColor: "rgba(255, 159, 64, 0.2)", // Color de fondo
            borderColor: "rgba(255, 159, 64, 1)", // Color del borde
            borderWidth: 1, // Ancho del borde
          },
        ],
      };

      new Chart(grafica, {
        type: "line", // Tipo de gráfica)
        data: data,
      });
    }
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
  while (evals <= maxGenGraph + 1) {
    await delayFunction(1);
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ParticlesAlgorithms.initAnimation();
  }
  if (evals > maxGenGraph - 1) {
    ParticlesAlgorithms = [];
    canvas.remove();
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

/*

function graficar(){
  let graficaBest = new Chart(grafica, {
    type: "line", // Tipo de gráfica)
    data: {
      datasets: [
        datosVentas2020,
        datosVentas2021,
        // Aquí más datos...
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
}

function remover(grafica) {
  grafica.destroy()
}

*/

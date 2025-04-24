let pelota;
let barra;
let bloques = [];
let peligros = [];
let columnas = 6;
let filas = 3;
let puntos = 0;
let vidas = 3;
let nivel = 1;
let gameOver = false;
let ganaste = false;
let hitSound;
let pelotaActiva = false;

function preload() {
    hitSound = loadSound("hit.mp3");
}

function setup() {
    let canvas = createCanvas(600, 400);
    canvas.parent("juego");
    barra = new Barra();
    pelota = new Pelota();
    crearBloques();
}

function draw() {
    background(0);
    barra.mostrar();
    barra.mover();

    pelota.mostrar();
    if (pelotaActiva) pelota.mover();

    mostrarInfo();

    let bloquesDestructiblesRestantes = 0;
    let bloqueIndestructiblePresente = false;

    for (let i = bloques.length - 1; i >= 0; i--) {
        bloques[i].mostrar();
        if (bloques[i].tipo !== "irrompible") {
            bloquesDestructiblesRestantes++;
        } else {
            bloqueIndestructiblePresente = true;
        }
        if (pelota.chocaCon(bloques[i])) {
            bloques[i].golpeado();
            pelota.dy *= -1;
            if (hitSound.isLoaded()) hitSound.play();
            if (bloques[i].resistencia <= 0) {
                bloques.splice(i, 1);
                puntos++;
            }
        }
    }

    if (pelota.chocaConBarra(barra)) {
        pelota.dy *= -1;
    }

    if (pelota.y > height) {
        vidas--;
        reiniciarPelota();
        if (vidas <= 0) {
            gameOver = true;
            noLoop();
        }
    }

    if (nivel === 3 && bloquesDestructiblesRestantes === 0 && bloqueIndestructiblePresente && !gameOver && !ganaste) {
        ganaste = true;
        noLoop();
    } else if (bloques.length === 0 && !gameOver && !ganaste) {
        siguienteNivel();
    }

    for (let i = peligros.length - 1; i >= 0; i--) {
        peligros[i].mostrar();
        peligros[i].mover();

        if (peligros[i].colisionaCon(barra)) {
            vidas--;
            peligros.splice(i, 1);
            if (vidas <= 0) {
                gameOver = true;
                noLoop();
            }
        } else if (peligros[i].fueraDePantalla()) {
            peligros.splice(i, 1);
        }
    }

    if ((nivel === 2 || nivel === 3) && frameCount % 240 === 0) {
        let x = random(50, width - 50);
        peligros.push(new Peligro(x, 0));
    }

    if (ganaste) {
        textSize(32);
        fill(0, 255, 255);
        textAlign(CENTER, CENTER);
        text("¡GANASTE!\nPresiona ENTER para jugar otra vez", width / 2, height / 2);
        return;
    }

    if (gameOver) {
        textSize(32);
        fill(255, 200, 20);
        textAlign(CENTER, CENTER);
        text("GAME OVER\nPresiona ENTER para reiniciar", width / 2, height / 2);
        return;
    }

    if (!pelotaActiva && !gameOver && !ganaste) {
        textSize(16);
        fill(200);
        textAlign(CENTER);
        text("Presiona ESPACIO para lanzar la pelota", width / 2, height / 2 + 40);
    }
}

function mostrarInfo() {
    fill(255);
    textSize(14);
    text(`Puntos: ${puntos}  Vidas: ${vidas}  Nivel: ${nivel}, Usa ← y → `, 210, 20);
}

function reiniciarPelota() {
    pelota = new Pelota();
    pelotaActiva = false;
}

function crearBloques() {
    bloques = [];

    let bloqueAncho = 65;
    let bloqueAlto = 20;
    let espacio = 10;
    let totalAncho = columnas * (bloqueAncho + espacio) - espacio;
    let margenIzquierdo = (width - totalAncho) / 2;

    let numFilas = 4;
    if (nivel === 2) numFilas = 5;
    else if (nivel === 3) numFilas = 6;

    for (let fila = 0; fila < numFilas; fila++) {
        for (let col = 0; col < columnas; col++) {
            let tipo = "normal";
            let resistencia = 1;

            if (nivel === 2 && fila === 0 && col === 2) {
                resistencia = 3;
            }

            if (nivel === 3) {
                if ((fila === 0 && col === 1) || (fila === 1 && col === 4)) {
                    resistencia = 3;
                } else if (fila === 2 && col === 3) {
                    tipo = "irrompible";
                }
            }

            let x = margenIzquierdo + col * (bloqueAncho + espacio);
            let y = 40 + fila * (bloqueAlto + espacio);
            bloques.push(new Bloque(x, y, tipo, resistencia));
        }
    }
}

function siguienteNivel() {
    nivel++;
    if (nivel > 3) {
        ganaste = true;
        noLoop();
        return;
    }
    crearBloques();
    reiniciarPelota();
    pelota.aumentarVelocidad(nivel);
}

function keyPressed() {
    if ((gameOver || ganaste) && keyCode === ENTER) {
        reiniciarJuego();
    }
    if (!pelotaActiva && keyCode === 32) {
        pelotaActiva = true;
    }
}

function reiniciarJuego() {
    puntos = 0;
    vidas = 3;
    nivel = 1;
    gameOver = false;
    ganaste = false;
    crearBloques();
    reiniciarPelota();
    loop();
}

class Pelota {
    constructor() {
        this.x = width / 2;
        this.y = height / 2;
        this.r = 10;
        this.dx = 2;
        this.dy = -2;
    }

    mostrar() {
        fill(255);
        ellipse(this.x, this.y, this.r * 2);
    }

    mover() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x < 0 || this.x > width) this.dx *= -1;
        if (this.y < 0) this.dy *= -1;
    }

    chocaCon(b) {
        return this.x > b.x && this.x < b.x + b.w &&
               this.y > b.y && this.y < b.y + b.h;
    }

    chocaConBarra(barra) {
        return this.x > barra.x && this.x < barra.x + barra.w &&
               this.y + this.r > barra.y && this.y - this.r < barra.y + barra.h;
    }

    aumentarVelocidad(nivel) {
        this.dx = 2 + nivel * 0.3;
        this.dy = -2 - nivel * 0.3;
    }
}

class Barra {
    constructor() {
        this.w = 100;
        this.h = 15;
        this.x = width / 2 - this.w / 2;
        this.y = height - this.h - 10;
        this.vel = 6;
    }

    mostrar() {
        fill(0, 255, 0);
        rect(this.x, this.y, this.w, this.h);
    }

    mover() {
        if (keyIsDown(LEFT_ARROW)) this.x -= this.vel;
        if (keyIsDown(RIGHT_ARROW)) this.x += this.vel;
        this.x = constrain(this.x, 0, width - this.w);
    }
}

class Bloque {
    constructor(x, y, tipo, resistencia) {
        this.x = x;
        this.y = y;
        this.w = 65;
        this.h = 20;
        this.tipo = tipo;
        this.resistencia = resistencia;
    }

    mostrar() {
        if (this.tipo === "irrompible") {
            fill(100);
        } else if (this.resistencia === 3) {
            fill(255, 0, 255);
        } else if (this.resistencia === 2) {
            fill(255, 165, 0);
        } else {
            fill(255, 255, 0);
        }
        rect(this.x, this.y, this.w, this.h);
    }

    golpeado() {
        if (this.tipo !== "irrompible") {
            this.resistencia--;
        }
    }
}

class Peligro {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 10;
        this.vel = 2;
    }

    mostrar() {
        fill(255, 0, 0);
        ellipse(this.x, this.y, this.r * 2);
    }

    mover() {
        this.y += this.vel;
    }

    colisionaCon(barra) {
        return this.x > barra.x && this.x < barra.x + barra.w &&
               this.y + this.r > barra.y && this.y - this.r < barra.y + barra.h;
    }

    fueraDePantalla() {
        return this.y > height;
    }
}
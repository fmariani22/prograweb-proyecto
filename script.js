let tareas = JSON.parse(localStorage.getItem('tareas')) || [];
let temporizadorActivo = false;
let temporizadorIntervalo;

// Fondo de estrellas y satélites
const canvasEstrellas = document.getElementById('estrellas');
const ctxEstrellas = canvasEstrellas.getContext('2d');
const canvasEstela = document.getElementById('estela');
const ctxEstela = canvasEstela.getContext('2d');
let particulas = [];
let estrellas = [];
let satelites = [];

function initCanvas() {
    canvasEstrellas.width = window.innerWidth;
    canvasEstrellas.height = window.innerHeight;
    canvasEstela.width = window.innerWidth;
    canvasEstela.height = window.innerHeight;
}

function initEstrellas() {
    estrellas = [];
    const colores = ['#FFFFFF', '#F4A261', '#E76F51'];
    for (let i = 0; i < 120; i++) {
        estrellas.push({
            x: Math.random() * canvasEstrellas.width,
            y: Math.random() * canvasEstrellas.height,
            tamano: i < 84 ? Math.random() * 1 + 1 : i < 108 ? Math.random() * 2 + 2 : Math.random() * 3 + 3,
            color: colores[Math.floor(Math.random() * colores.length)],
            vx: -Math.random() * 0.9 - 0.45, // Diagonal hacia abajo-izquierda
            vy: Math.random() * 0.9 + 0.45
        });
    }
}

function initSatelites() {
    satelites = [];
    for (let i = 0; i < 6; i++) {
        satelites.push({
            x: Math.random() * canvasEstrellas.width,
            y: Math.random() * canvasEstrellas.height,
            vx: (Math.random() - 0.5) * 4.05, // 3x velocidad estrellas
            vy: (Math.random() - 0.5) * 4.05,
            tamano: Math.random() * 4 + 2 // 2-6px
        });
    }
}

function dibujarEstrellasYSatelites() {
    ctxEstrellas.clearRect(0, 0, canvasEstrellas.width, canvasEstrellas.height);
    estrellas.forEach(e => {
        ctxEstrellas.beginPath();
        ctxEstrellas.arc(e.x, e.y, e.tamano, 0, Math.PI * 2);
        ctxEstrellas.fillStyle = e.color;
        ctxEstrellas.fill();
        e.x += e.vx;
        e.y += e.vy;
        if (e.x < 0 || e.y > canvasEstrellas.height) {
            e.x = canvasEstrellas.width + Math.random() * 100; // Reaparecer en la derecha
            e.y = -Math.random() * 100; // Arriba
        }
    });
    satelites.forEach(s => {
        ctxEstrellas.beginPath();
        ctxEstrellas.arc(s.x, s.y, s.tamano, 0, Math.PI * 2);
        ctxEstrellas.fillStyle = '#D1D5DB';
        ctxEstrellas.fill();
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0 || s.x > canvasEstrellas.width || s.y < 0 || s.y > canvasEstrellas.height) {
            s.x = Math.random() * canvasEstrellas.width;
            s.y = Math.random() * canvasEstrellas.height;
        }
    });
}

function dibujarEstela() {
    ctxEstela.clearRect(0, 0, canvasEstela.width, canvasEstela.height);
    particulas = particulas.filter(p => p.vida > 0);
    particulas.forEach(p => {
        ctxEstela.beginPath();
        ctxEstela.arc(p.x, p.y, p.tamano, 0, Math.PI * 2);
        ctxEstela.fillStyle = `rgba(255, 255, 255, ${p.vida / 100})`;
        ctxEstela.fill();
        p.x -= p.vx;
        p.y -= p.vy;
        p.vida -= 2;
    });
}

function crearParticula(x, y) {
    const angulo = Math.random() * Math.PI * 2;
    const velocidad = Math.random() * 2 + 1;
    particulas.push({
        x,
        y,
        tamano: Math.random() * 2 + 1,
        vx: Math.cos(angulo) * velocidad,
        vy: Math.sin(angulo) * velocidad,
        vida: 100
    });
}

canvasEstela.addEventListener('mousemove', (e) => {
    if (!tareas.some(t => t.estado === 'pendiente') && window.innerWidth >= 768 && document.querySelector('#pendientes').classList.contains('active')) {
        for (let i = 0; i < 2; i++) {
            crearParticula(e.clientX, e.clientY);
        }
    }
});

window.addEventListener('resize', () => {
    initCanvas();
    initEstrellas();
    initSatelites();
});
initCanvas();
initEstrellas();
initSatelites();
setInterval(dibujarEstrellasYSatelites, 100);
setInterval(dibujarEstela, 1000 / 60);

// Funciones de la aplicación
function mostrarPestana(id) {
    document.querySelectorAll('.pestana').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelector(`button[onclick="mostrarPestana('${id}')"]`).classList.add('active');
    actualizarUI();
}

function abrirModalCrear() {
    document.getElementById('modal-crear').style.display = 'flex';
    document.getElementById('titulo-tarea').value = '';
    document.getElementById('descripcion-tarea').value = '';
    document.getElementById('deadline-tarea').value = '';
}

function cerrarModalCrear() {
    document.getElementById('modal-crear').style.display = 'none';
}

function abrirModalEditar(id) {
    const tarea = tareas.find(t => t.id === id);
    document.getElementById('editar-titulo').value = tarea.titulo;
    document.getElementById('editar-descripcion').value = tarea.descripcion;
    document.getElementById('editar-deadline').value = tarea.deadline ? new Date(tarea.deadline).toISOString().slice(0, 16) : '';
    document.getElementById('modal-editar').dataset.id = id;
    document.getElementById('modal-editar').style.display = 'flex';
}

function cerrarModalEditar() {
    document.getElementById('modal-editar').style.display = 'none';
}

function crearTarea() {
    const titulo = document.getElementById('titulo-tarea').value.trim();
    const descripcion = document.getElementById('descripcion-tarea').value.trim();
    const deadline = document.getElementById('deadline-tarea').value;
    if (!titulo) {
        alert('El título es obligatorio.');
        return;
    }
    const tarea = {
        id: Date.now(),
        titulo,
        descripcion,
        deadline,
        estado: 'pendiente',
        creada: new Date().toISOString(),
        completada: null
    };
    tareas.push(tarea);
    guardarTareas();
    cerrarModalCrear();
    actualizarUI();
}

function guardarEdicion() {
    const id = parseInt(document.getElementById('modal-editar').dataset.id);
    const tarea = tareas.find(t => t.id === id);
    tarea.titulo = document.getElementById('editar-titulo').value.trim();
    tarea.descripcion = document.getElementById('editar-descripcion').value.trim();
    tarea.deadline = document.getElementById('editar-deadline').value;
    guardarTareas();
    cerrarModalEditar();
    actualizarUI();
}

function marcarCompletada(id) {
    const tarea = tareas.find(t => t.id === id);
    tarea.estado = 'completada';
    tarea.completada = new Date().toISOString();
    guardarTareas();
    actualizarUI();
}

function volverAPendiente(id) {
    const tarea = tareas.find(t => t.id === id);
    tarea.estado = 'pendiente';
    tarea.completada = null;
    guardarTareas();
    actualizarUI();
}

function borrarTarea(id) {
    if (confirm('¿Seguro que quieres eliminar esta tarea?')) {
        tareas = tareas.filter(t => t.id !== id);
        guardarTareas();
        actualizarUI();
    }
}

function guardarTareas() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
}

function calcularTiempoTranscurrido(creada, completada) {
    const diff = new Date(completada) - new Date(creada);
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos}m`;
}

function calcularDeadline(deadline) {
    if (!deadline) return '';
    const ahora = new Date();
    const fechaDeadline = new Date(deadline);
    if (ahora > fechaDeadline) return '<span class="tarde">TARDE</span>';
    const diff = fechaDeadline - ahora;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${dias} días, ${horas} horas`;
}

function actualizarUI() {
    const ahora = new Date();
    tareas = tareas.filter(t => {
        if (t.estado === 'completada' && (ahora - new Date(t.completada)) > 7 * 24 * 60 * 60 * 1000) {
            return false;
        }
        return true;
    });
    guardarTareas();

    const grilla = document.getElementById('grilla-pendientes');
    const agregarBtn = document.getElementById('agregar-tarea');
    const hayPendientes = tareas.some(t => t.estado === 'pendiente');
    grilla.innerHTML = '';
    if (hayPendientes) {
        agregarBtn.classList.remove('centrado');
        agregarBtn.classList.add('derecha');
    } else {
        agregarBtn.classList.remove('derecha');
        agregarBtn.classList.add('centrado');
    }

    tareas.filter(t => t.estado === 'pendiente').forEach(tarea => {
        const div = document.createElement('div');
        div.className = 'tarea';
        const deadlineTexto = calcularDeadline(tarea.deadline);
        let descripcionHTML = '';
        if (tarea.descripcion && tarea.descripcion.trim() !== '') {
            descripcionHTML = `<p class="descripcion">${tarea.descripcion}</p>`;
        }
        div.innerHTML = `
            <h2>${tarea.titulo}</h2>
            ${descripcionHTML}
            <p class="deadline">Deadline: ${deadlineTexto || 'Sin deadline'}</p>
            <button class="completar" onclick="marcarCompletada(${tarea.id})">Completar</button>
            <button class="editar" onclick="abrirModalEditar(${tarea.id})">Editar</button>
            <button class="borrar" onclick="borrarTarea(${tarea.id})">Borrar</button>
        `;
        grilla.appendChild(div);
    });

    const lista = document.getElementById('lista-completadas');
    lista.innerHTML = '';
    tareas.filter(t => t.estado === 'completada')
        .sort((a, b) => new Date(b.completada) - new Date(a.completada))
        .forEach(tarea => {
            const div = document.createElement('div');
            div.className = 'completada';
            const tiempo = calcularTiempoTranscurrido(tarea.creada, tarea.completada);
            div.innerHTML = `
                <div class="info">
                    <h2>${tarea.titulo}</h2>
                </div>
                <div class="detalles">
                    <p>Completada: ${new Date(tarea.completada).toLocaleString('es-AR', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                    <p>Tiempo: ${tiempo}</p>
                </div>
                <button onclick="volverAPendiente(${tarea.id})">Volver a Pendiente</button>
            `;
            lista.appendChild(div);
        });
}

function actualizarReloj() {
    if (!temporizadorActivo) {
        const ahora = new Date().toLocaleString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        document.getElementById('reloj').textContent = ahora;
    }
}

function iniciarTemporizador() {
    const horas = parseInt(document.getElementById('input-horas').value) || 0;
    const minutos = parseInt(document.getElementById('input-minutos').value) || 0;
    const segundosTotales = horas * 3600 + minutos * 60;
    if (segundosTotales <= 0) {
        alert('Ingresa un tiempo válido.');
        return;
    }
    document.getElementById('input-horas').value = '';
    document.getElementById('input-minutos').value = '';
    temporizadorActivo = true;
    let segundosRestantes = segundosTotales;
    clearInterval(temporizadorIntervalo);
    temporizadorIntervalo = setInterval(() => {
        const minutosRest = Math.floor(segundosRestantes / 60);
        const segundos = segundosRestantes % 60;
        document.getElementById('reloj').textContent = `${minutosRest}:${segundos < 10 ? '0' : ''}${segundos}`;
        segundosRestantes--;
        if (segundosRestantes < 0) {
            clearInterval(temporizadorIntervalo);
            temporizadorActivo = false;
            const alarma = document.getElementById('alarma');
            alarma.play().catch(error => {
                console.log('Error al reproducir la alarma:', error);
                // Intento adicional para reproducir después de un retraso
                setTimeout(() => alarma.play(), 100);
            });
            alert('¡Temporizador finalizado!');
            actualizarReloj();
        }
    }, 1000);
}

function reiniciarTemporizador() {
    clearInterval(temporizadorIntervalo);
    temporizadorActivo = false;
    document.getElementById('input-horas').value = '';
    document.getElementById('input-minutos').value = '';
    actualizarReloj();
}

// Inicialización
setInterval(actualizarReloj, 1000);
setInterval(() => {
    if (tareas.some(t => t.estado === 'pendiente')) actualizarUI();
}, 1000 * 60 * 60); // Actualizar deadlines cada hora
actualizarReloj();
actualizarUI();
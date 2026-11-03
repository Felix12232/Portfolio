
'use strict';

class Carrusel {
    constructor(contenedor) {
        this.contenedor = contenedor;

        this.imagenes = Array.from(
            this.contenedor.querySelectorAll('.imagen-proyecto')
        );

        // Tiempo entre imágenes: 3000 milisegundos = 3 segundos
        this.intervalo = 3000;

        this.indice = this.imagenes.findIndex(
            imagen => imagen.classList.contains('activa')
        );

        if (this.indice === -1) {
            this.indice = 0;
        }

        this.temporizador = null;
        this.puntos = [];
        this.pausadoPorUsuario = false;

        if (this.imagenes.length < 2) {
            return;
        }

        this.crearIndicadores();
        this.mostrar(this.indice);
        this.registrarEventos();
        this.iniciar();
    }

    crearIndicadores() {
        const navegacion = document.createElement('div');

        navegacion.className = 'carrusel-indicadores';

        this.puntos = this.imagenes.map((imagen, indice) => {
            const punto = document.createElement('button');

            punto.type = 'button';
            punto.setAttribute(
                'aria-label',
                `Mostrar imagen ${indice + 1}`
            );

            punto.addEventListener('click', () => {
                this.mostrar(indice);
                this.reiniciar();
            });

            navegacion.appendChild(punto);

            return punto;
        });

        this.contenedor.appendChild(navegacion);
    }

    mostrar(indice) {
        this.indice =
            (indice + this.imagenes.length) % this.imagenes.length;

        this.imagenes.forEach((imagen, i) => {
            imagen.classList.toggle('activa', i === this.indice);
        });

        this.puntos.forEach((punto, i) => {
            punto.classList.toggle('activo', i === this.indice);

            punto.setAttribute(
                'aria-current',
                i === this.indice ? 'true' : 'false'
            );
        });
    }

    siguiente() {
        this.mostrar(this.indice + 1);
    }

    iniciar() {
        if (
            this.temporizador !== null ||
            this.pausadoPorUsuario ||
            document.hidden ||
            this.contenedor.matches(':hover') ||
            this.contenedor.contains(document.activeElement)
        ) {
            return;
        }

        this.temporizador = setInterval(() => {
            this.siguiente();
        }, this.intervalo);
    }

    detener() {
        if (this.temporizador !== null) {
            clearInterval(this.temporizador);
            this.temporizador = null;
        }
    }

    reiniciar() {
        this.detener();
        this.iniciar();
    }

    registrarEventos() {
        this.contenedor.addEventListener('mouseenter', () => {
            this.detener();
        });

        this.contenedor.addEventListener('mouseleave', () => {
            this.iniciar();
        });

        this.contenedor.addEventListener('focusin', () => {
            this.detener();
        });

        this.contenedor.addEventListener('focusout', () => {
            // Espera a que el foco pase al siguiente elemento
            requestAnimationFrame(() => this.iniciar());
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.detener();
            } else {
                this.iniciar();
            }
        });

        // Respeta la preferencia de movimiento reducido del usuario
        const movimientoReducido = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        );

        if (movimientoReducido.matches) {
            this.pausadoPorUsuario = true;
        }

        movimientoReducido.addEventListener('change', evento => {
            this.pausadoPorUsuario = evento.matches;

            if (this.pausadoPorUsuario) {
                this.detener();
            } else {
                this.iniciar();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-carrusel]').forEach(contenedor => {
        new Carrusel(contenedor);
    });
});

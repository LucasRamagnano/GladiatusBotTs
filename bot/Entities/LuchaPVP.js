class LuchaPVP {
    constructor(lugar, selectorBoton) {
        this.prioridad = datosContext.prioridades.arena;
        this.estado = tareaEstado.enEspera;
        this.analizar_proxima = false;
        this.tipo_class = 'LuchaPVP';
        this.timed_out_miliseconds = 5000;
        this.lugar = lugar;
        this.selectorBoton = selectorBoton;
    }
    changeEstado(newEstado) {
        this.estado = newEstado;
    }
    getEstado() {
        return this.estado;
    }
    estamosEnTuLugar() {
        return $('#arenaPage .awesome-tabs.current').html() === this.lugar;
    }
    atacar() {
        return $('.attack')[0];
    }
    irATuLugar() {
        let returnValue;
        if ($('#arenaPage').length === 0) {
            returnValue = $(this.selectorBoton)[0];
        }
        else if (!this.estamosEnTuLugar()) {
            returnValue = $('#arenaPage .awesome-tabs:contains(\'' + this.lugar + '\')')[0];
        }
        return returnValue;
    }
    getProximoClick() {
        if (this.estamosEnTuLugar() && !this.analizar_proxima) {
            this.analizar_proxima = true;
            let resultado;
            if (this.sosArena()) {
                if (estadoEjecucion.indiceArenaProximo.puntaje > 130) {
                    let indiceToAttack;
                    $('#own2 a').toArray().forEach((e, index) => {
                        if (e.textContent.trim() == estadoEjecucion.indiceArenaProximo.nombre)
                            indiceToAttack = index;
                    });
                    return Promise.resolve($('#own2 .attack')[indiceToAttack]);
                }
                else
                    return Promise.resolve($('form .button1')[0]);
            }
            else {
                if (estadoEjecucion.indiceTurmaProximo.puntaje > 80) {
                    let indiceToAttack;
                    $('#own3 a').toArray().forEach((e, index) => {
                        if (e.textContent.trim() == estadoEjecucion.indiceTurmaProximo.nombre)
                            indiceToAttack = index;
                    });
                    return Promise.resolve($('#own3 .attack')[indiceToAttack]);
                }
                else
                    return Promise.resolve($('form .button1')[0]);
                //return Promise.resolve(this.atacar());
            }
        }
        else if (this.analizar_proxima) {
            this.estado = tareaEstado.finalizada;
            if (this.sosArena()) {
                //pedir que analize arena
                //pedir proximo click
                let link = $('#cooldown_bar_arena a').attr('href');
                mandarMensajeBackground({ header: MensajeHeader.ANALIZAR_ARENA, link: link });
            }
            else {
                //pedir que analize turma
                //pedir proximo click
                let link = $('#cooldown_bar_ct a').attr('href');
                mandarMensajeBackground({ header: MensajeHeader.ANALIZAR_TURMA, linkTurma: link });
            }
            return Promise.resolve(tareasControlador.getPronosticoClick());
        }
        else {
            return Promise.resolve(this.irATuLugar());
        }
    }
    fromJsonString(jsonGuardado) {
        this.lugar = jsonGuardado.lugar;
        this.selectorBoton = jsonGuardado.selectorBoton;
        this.estado = jsonGuardado.estado;
        this.tipo_class = jsonGuardado.tipo_class;
        this.analizar_proxima = jsonGuardado.analizar_proxima;
        return this;
    }
    seCancela() {
        return (!datosContext.modulos.correrArena && this.sosArena()) ||
            (!datosContext.modulos.correrTurma && !this.sosArena()) ||
            (this.sosArena() && getPorcentajeVida() < datosContext.personaje.porcentajeMinimoParaCurar);
    }
    sosArena() {
        return this.lugar == 'Arena Provinciarum' || this.lugar == 'Arena';
    }
    equals(t) {
        return t.tipo_class == this.tipo_class && this.lugar == t.lugar;
    }
    getHomeClick() {
        return $(this.selectorBoton)[0];
    }
    puedeDesbloquearse() {
        return true;
    }
}

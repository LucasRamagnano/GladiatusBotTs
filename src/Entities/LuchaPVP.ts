class LuchaPVP implements Tarea {
    prioridad : tareaPrioridad = datosContext.prioridades.arena;
    lugar: string;
    selectorBoton: string;
    private estado: tareaEstado = tareaEstado.enEspera;
    analizar_proxima: boolean = false;
    tipo_class: string = 'LuchaPVP';
    timed_out_miliseconds = 5000;
    puntajeArena = 130;
    puntajeTurma = 80;

    constructor();
    constructor(lugar: string, selectorBoton: string);
    constructor(lugar?: string, selectorBoton?: string) {
        this.lugar = lugar;
        this.selectorBoton = selectorBoton;
    }

    changeEstado(newEstado: tareaEstado): void {
        this.estado = newEstado;
    }

    getEstado(): tareaEstado {
        return this.estado;
    }

    estamosEnTuLugar():boolean {
        return $('#arenaPage .awesome-tabs.current').html() === this.lugar;
    }

    atacar(): HTMLElement {
        return $('.attack')[0];
    }

    irATuLugar(): HTMLElement {
        let returnValue: HTMLElement;
        if($('#arenaPage').length === 0) {
            returnValue = $(this.selectorBoton)[0];
        }else if(!this.estamosEnTuLugar()) {
            returnValue = $('#arenaPage .awesome-tabs:contains(\'' + this.lugar+'\')')[0];
        }
        return returnValue;
    }

    getProximoClick(): Promise<HTMLElement> {
        if(this.estamosEnTuLugar() && !this.analizar_proxima){
            this.analizar_proxima = true;
            let resultado;
            if(this.sosArena()) {
                if(estadoEjecucion.indiceArenaProximo.puntaje > this.puntajeArena) {
                    let indiceToAttack;
                    $('#own2 a').toArray().forEach((e, index)=>{
                        if(e.textContent.trim() == estadoEjecucion.indiceArenaProximo.nombre)
                            indiceToAttack = index
                    })
                    return Promise.resolve($('#own2 .attack')[indiceToAttack]);
                }
                else
                    return Promise.resolve($('form .button1')[0]);
            }else {
                if(estadoEjecucion.indiceTurmaProximo.puntaje > this.puntajeTurma) {
                    let indiceToAttack;
                    $('#own3 a').toArray().forEach((e, index)=>{
                        if(e.textContent.trim() == estadoEjecucion.indiceTurmaProximo.nombre)
                            indiceToAttack = index
                    })
                    return Promise.resolve($('#own3 .attack')[indiceToAttack]);
                }
                else
                    return Promise.resolve($('form .button1')[0]);
                //return Promise.resolve(this.atacar());
            }
        }else if(this.analizar_proxima) {
            this.estado = tareaEstado.finalizada;
            if(this.sosArena()) {
                //pedir que analize arena
                //pedir proximo click
                let link = $('#cooldown_bar_arena a').attr('href');
                mandarMensajeBackground({header: MensajeHeader.ANALIZAR_ARENA, link: link })
            }else {
                //pedir que analize turma
                //pedir proximo click
                let link = $('#cooldown_bar_ct a').attr('href');
                mandarMensajeBackground({header: MensajeHeader.ANALIZAR_TURMA, linkTurma: link})
            }
            return Promise.resolve(tareasControlador.getPronosticoClick());
        }
        else {
            return Promise.resolve(this.irATuLugar());
        }
    }

    fromJsonString(jsonGuardado: any) {
        this.lugar  = jsonGuardado.lugar;
        this.selectorBoton = jsonGuardado.selectorBoton;
        this.estado = jsonGuardado.estado;
        this.tipo_class = jsonGuardado.tipo_class;
        this.analizar_proxima = jsonGuardado.analizar_proxima;
        return this;
    }

    seCancela(): boolean {
        return (!datosContext.modulos.correrArena && this.sosArena()) ||
                (!datosContext.modulos.correrTurma && !this.sosArena()) ||
                (this.sosArena() && getPorcentajeVida() < datosContext.personaje.porcentajeMinimoParaCurar);
    }

    sosArena(): boolean {
        return this.lugar == 'Arena Provinciarum' || this.lugar == 'Arena';
    }

    equals(t: Tarea): boolean {
        return t.tipo_class == this.tipo_class && this.lugar == (t as LuchaPVP).lugar;
    }

    getHomeClick(): HTMLElement {
        return $(this.selectorBoton)[0];
    }

    puedeDesbloquearse(): boolean {
        return true;
    }

}
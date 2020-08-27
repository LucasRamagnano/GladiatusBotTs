class LuchaPVP implements Tarea {
    lugar: string;
    selectorBoton: string;
    estado: tareaEstado;
    tipo_class: string = 'LuchaPVP';

    constructor();
    constructor(lugar: string, selectorBoton: string);
    constructor(lugar?: string, selectorBoton?: string) {
        this.lugar = lugar;
        this.selectorBoton = selectorBoton;
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
        if(this.estamosEnTuLugar()){
            mandarMensajeBackground({header: MensajeHeader.HAY_COMIDA});
            this.estado = tareaEstado.finalizada;
            return Promise.resolve(this.atacar());
        }else {
            return Promise.resolve(this.irATuLugar());
        }
    }

    fromJsonString(jsonGuardado: any) {
        this.lugar  = jsonGuardado.lugar;
        this.selectorBoton = jsonGuardado.selectorBoton;
        this.estado = jsonGuardado.estado;
        this.tipo_class = jsonGuardado.tipo_class;
        return this;
    }

    seCancela(): boolean {
        return (!globalConfig.modulos.correrArena && this.sosArena()) ||
                (!globalConfig.modulos.correrMazmorra && !this.sosArena()) ||
                (this.sosArena() && getPorcentajeVida() < globalConfig.personaje.porcentajeMinimoParaCurar);
    }

    sosArena(): boolean {
        return this.lugar == 'Arena Provinciarum' || this.lugar == 'Arena';
    }

    equals(t: Tarea): boolean {
        return t.tipo_class == this.tipo_class && this.lugar == (t as LuchaPVP).lugar;
    }


}
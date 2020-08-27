class LuchaPVP {
    constructor(lugar, selectorBoton) {
        this.tipo_class = 'LuchaPVP';
        this.lugar = lugar;
        this.selectorBoton = selectorBoton;
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
        if (this.estamosEnTuLugar()) {
            mandarMensajeBackground({ header: MensajeHeader.HAY_COMIDA });
            this.estado = tareaEstado.finalizada;
            return Promise.resolve(this.atacar());
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
        return this;
    }
    seCancela() {
        return (!globalConfig.modulos.correrArena && this.sosArena()) ||
            (!globalConfig.modulos.correrMazmorra && !this.sosArena()) ||
            (this.sosArena() && getPorcentajeVida() < globalConfig.personaje.porcentajeMinimoParaCurar);
    }
    sosArena() {
        return this.lugar == 'Arena Provinciarum' || this.lugar == 'Arena';
    }
    equals(t) {
        return t.tipo_class == this.tipo_class && this.lugar == t.lugar;
    }
}

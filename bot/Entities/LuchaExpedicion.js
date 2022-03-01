class LuchaExpedicion {
    constructor(indiceLugar, indiceEnemigo) {
        this.prioridad = globalConfig.prioridades.expedicion;
        this.tipo_class = 'LuchaExpedicion';
        this.timed_out_miliseconds = 5000;
        this.indiceEnemigo = indiceEnemigo;
        this.indiceLugar = indiceLugar;
    }
    botonesHabilitados() {
        return $('#expedition_list button')[0] != undefined && !$('#expedition_list button')[0].classList.contains('disabled');
    }
    estamosEnTuLugar() {
        /*var expedicionSeleccionada = $('#locationPage #submenu2 > .menuitem.active');
        return expedicionSeleccionada.length && expedicionSeleccionada[0].innerText.trim() == this.lugar;*/
        return $('#submenu2 a.menuitem')[this.indiceLugar].classList.contains('active');
    }
    irATuLugar() {
        //Por nombre
        // $('#submenu2 a.menuitem:contains(\'' + this.lugar + '\')')[0].click();
        return $('#submenu2 a.menuitem')[this.indiceLugar];
    }
    atacar() {
        //el indici tiene q salir de this.enemigo
        return $('.expedition_box button')[this.indiceEnemigo];
    }
    analizarPlace() {
        let expedicionBox = $('.expedition_box')[this.indiceEnemigo];
        let dataTooltip = $(expedicionBox).find('div')[0].getAttribute('data-tooltip');
        let nombreEnemigo = dataTooltip.substring(4, dataTooltip.indexOf('","white'));
        let nombreLugar = $('#submenu2 a.menuitem.active')[0].innerText;
        mandarMensajeBackground({ header: MensajeHeader.ACTUALIZAR_EXPEDICION, lugar: nombreLugar, enemigo: nombreEnemigo });
    }
    estamosEnLocation() {
        return $('#locationPage').length == 1;
    }
    getProximoClick() {
        if (this.estamosEnTuLugar() && this.botonesHabilitados()) {
            this.analizarPlace();
            this.estado = tareaEstado.finalizada;
            return Promise.resolve(this.atacar());
        }
        else if (this.estamosEnTuLugar() && !this.estamosEnLocation()) {
            return Promise.resolve($('td a.awesome-tabs')[0]);
        }
        else {
            return Promise.resolve(this.irATuLugar());
        }
    }
    fromJsonString(jsonGuardado) {
        this.indiceEnemigo = jsonGuardado.indiceEnemigo;
        this.indiceLugar = jsonGuardado.indiceLugar;
        this.estado = jsonGuardado.estado;
        this.tipo_class = jsonGuardado.tipo_class;
        return this;
    }
    seCancela() {
        return !globalConfig.modulos.correrExpedicion ||
            getPorcentajeVida() < globalConfig.personaje.porcentajeMinimoParaCurar;
    }
    equals(t) {
        return t.tipo_class == this.tipo_class;
    }
    getHomeClick() {
        return $('#submenu2 a.menuitem')[this.indiceLugar];
    }
    puedeDesbloquearse() {
        return true;
    }
}

class LuchaExpedicion implements Tarea{
    prioridad : tareaPrioridad = globalConfig.prioridades.expedicion;
    indiceLugar: number;
    indiceEnemigo: number;
    estado: tareaEstado;
    tipo_class: string = 'LuchaExpedicion';

    constructor();
    constructor(indiceLugar: number, indiceEnemigo: number);
    constructor(indiceLugar?: number, indiceEnemigo?: number) {
        this.indiceEnemigo = indiceEnemigo;
        this.indiceLugar = indiceLugar;
    }
    
    botonesHabilitados(): boolean {
        return $('#expedition_list button')[0] != undefined && !$('#expedition_list button')[0].classList.contains('disabled');
    }

    estamosEnTuLugar(): boolean {
        /*var expedicionSeleccionada = $('#locationPage #submenu2 > .menuitem.active');
        return expedicionSeleccionada.length && expedicionSeleccionada[0].innerText.trim() == this.lugar;*/
        return $('#submenu2 a.menuitem')[this.indiceLugar].classList.contains('active');
    }

    irATuLugar(): HTMLElement {
        //Por nombre
        // $('#submenu2 a.menuitem:contains(\'' + this.lugar + '\')')[0].click();
        return $('#submenu2 a.menuitem')[this.indiceLugar];
    }

    atacar(): HTMLElement {
        //el indici tiene q salir de this.enemigo
        return $('.expedition_box button')[this.indiceEnemigo];
    }

    analizarPlace(): void {
        let expedicionBox = $('.expedition_box')[this.indiceEnemigo];
        let dataTooltip = $(expedicionBox).find('div')[0].getAttribute('data-tooltip');
        let nombreEnemigo = dataTooltip.substring(4,dataTooltip.indexOf('","white'));
        let nombreLugar = $('#submenu2 a.menuitem.active')[0].innerText;
        mandarMensajeBackground({header: MensajeHeader.ACTUALIZAR_EXPEDICION, lugar: nombreLugar, enemigo: nombreEnemigo});
    }

    estamosEnLocation(): boolean {
        return $('#locationPage').length == 1;
    }

    getProximoClick(): Promise<HTMLElement> {
        if(this.estamosEnTuLugar() && this.botonesHabilitados()) {
            this.analizarPlace();
            mandarMensajeBackground({header: MensajeHeader.HAY_COMIDA});
            this.estado = tareaEstado.finalizada;
            return Promise.resolve(this.atacar());
        }else if( this.estamosEnTuLugar() && !this.estamosEnLocation()) {
            return Promise.resolve($('td a.awesome-tabs')[0]);
        }else {
            return Promise.resolve(this.irATuLugar());
        }
    }

    fromJsonString(jsonGuardado: any) {
        this.indiceEnemigo  = jsonGuardado.indiceEnemigo;
        this.indiceLugar = jsonGuardado.indiceLugar;
        this.estado = jsonGuardado.estado;
        this.tipo_class = jsonGuardado.tipo_class;
        return this;
    }

    seCancela(): boolean {
        return !globalConfig.modulos.correrExpedicion &&
                getPorcentajeVida()<globalConfig.personaje.porcentajeMinimoParaCurar;
    }

    equals(t: Tarea): boolean {
        return t.tipo_class == this.tipo_class;
    }

    getHomeClick(): HTMLElement {
        return $('#submenu2 a.menuitem')[this.indiceLugar];
    }


}
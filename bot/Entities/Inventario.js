class Inventario {
    constructor() {
        this.prioridad = globalConfig.prioridades.curar;
        this.tipo_class = 'Inventario';
        this.vecesABuscar = 10;
    }
    getProximoClick() {
        if (this.estamosEnVisionGeneral() && estaApuntandoPersonaje()) {
            //TODO VER QUE HACER CON CORRER DE NUEVO
            correrDeNuevo = false;
            return new Promise((resolve, fallo) => { this.buscarComidaYCurar(resolve, fallo); });
        }
        else if (estaEnVisionGeneral()) {
            return Promise.resolve($('.charmercsel')[0]);
        }
        else {
            return Promise.resolve($('#mainmenu > div:nth-child(1) a')[0]);
        }
    }
    buscarComidaYCurar(resolve, reject) {
        if (this.vecesABuscar <= 0) {
            //Mando no hay comida
            //Voy a vision general
            mandarMensajeBackground({ header: MensajeHeader.NO_HAY_COMIDA });
            this.estado = tareaEstado.cancelada;
            resolve($('#mainmenu > div:nth-child(1) a')[0]);
        }
        else if ($('#inv div[data-tooltip*=\'ndose: Cura\']').length === 0) {
            $('a.awesome-tabs[data-available*=\"true\"]')[this.proximaHoja()].click();
            setTimeout(() => {
                this.buscarComidaYCurar(resolve, reject);
            }, 250);
            this.vecesABuscar = this.vecesABuscar - 1;
        }
        else {
            this.curar();
            this.estado = tareaEstado.finalizada;
            window.setTimeout(() => resolve($('#mainmenu > div:nth-child(1) a')[0]), 500);
        }
    }
    curar() {
        this.ponerIdDeComida();
        $('#a_comer').simulate("drag-n-drop", { dragTarget: $("#avatar") });
    }
    proximaHoja() {
        let hojaAt = this.getHojaAt();
        if (hojaAt + 1 >= this.cantidadHojaDisponibles())
            return 0;
        else
            return hojaAt + 1;
    }
    getHojaAt() {
        return Array.from($('a.awesome-tabs[data-available*=\"true\"]')).findIndex(e => e.classList.contains('current'));
    }
    ;
    cantidadHojaDisponibles() {
        return $('a.awesome-tabs[data-available*=\"true\"]').length;
    }
    ponerIdDeComida() {
        //Selecciono el que esta sobresaltado amarillo, sino agarro cuallquiera que en el atributo de html tenga "ndose: Cura"
        if ($('div[style*="filter: drop-shadow(black 0px 0px 1px) drop-shadow(yellow 0px 0px 3px) drop-shadow(yellow 0px 0px 3px);"]').length !== 0)
            $('div[style*="filter: drop-shadow(black 0px 0px 1px) drop-shadow(yellow 0px 0px 3px) drop-shadow(yellow 0px 0px 3px);"]').attr('id', 'a_comer');
        else
            $('#inv div[data-tooltip*=\'ndose: Cura\']').first().attr('id', 'a_comer');
    }
    estamosEnVisionGeneral() {
        return $('#overviewPage #avatar').length == 1;
    }
    fromJsonString(guardado) {
        this.estado = guardado.estado;
        this.tipo_class = guardado.tipo_class;
        this.vecesABuscar = guardado.vecesABuscar;
        return this;
    }
    seCancela() {
        return false;
    }
    equals(t) {
        return t.tipo_class == this.tipo_class;
    }
    getHomeClick() {
        return $('#mainmenu > div:nth-child(1) a')[0];
    }
}

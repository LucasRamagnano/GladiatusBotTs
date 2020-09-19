class ControladorDePaquetes implements Tarea{

    estadoPaquete: paquete_estados;
    paqueteComprado: Paquete;
    estado: tareaEstado;
    tipo_class: string = 'ControladorDePaquetes';

    fromJsonString(guardado: any): Guardable {
        this.estado = guardado.estado;
        this.estadoPaquete = guardado.estadoPaquete;
        this.paqueteComprado = guardado.paqueteComprado;
        return this;
    }
    /*this.paqueteComprado = new Paquete("[[[\"Madera\",\"white\"],[\"Valor 36 <div class=\\\"",111,
                                        "JTU",5000,1,null);*/
    constructor()
    constructor(estadoPaquete: paquete_estados,paqueteComprado: Paquete)
    constructor(estadoPaquete?: paquete_estados,paqueteComprado?: Paquete) {
        this.estadoPaquete = estadoPaquete;
        this.paqueteComprado = paqueteComprado;
    }

    getOroActual(): number {
        let oroHtml = $('#sstat_gold_val').html();
        return Number.parseInt(oroHtml.replace(/\./g,''));
    }

    estamosEnMercado(): boolean {
        return $('#guildMarketPage').length > 0
    }

    buscarMejorPaquete(oroActual): Paquete{
        
        let mejorPaquete = null;
        $('#market_item_table tr').each(function() {
            if($(this).find('th').length == 0) {
               let paquete = crearPackDesdeTr(this);
                if (paquete.precio > oroActual || paquete.precio < 50000 || paquete.origen === globalConfig.personaje.nombre) {
                    //nada
                }else if(mejorPaquete===null) {
                    mejorPaquete = paquete;
                }else if(Math.abs((mejorPaquete.precio-oroActual))>Math.abs((paquete.precio-oroActual))) {
                    mejorPaquete = paquete;
                }
            }
        });
        return mejorPaquete;
    }

    buscarPaqueteComprado(): HTMLElement {
        let todosLosPaquetes =  $('.packageItem .ui-draggable').toArray();
        return todosLosPaquetes.find(elem => elem.getAttribute('data-tooltip').includes(this.paqueteComprado.itemNombre))
    } 

    buscarPaqueteCompradoEnInventario(): HTMLElement {
        let todosLosPaquetes =  $('#inv .ui-droppable').toArray();
        return todosLosPaquetes.filter(elem=>elem.getAttribute('data-tooltip')!=null).find(elem => elem.getAttribute('data-tooltip').includes(this.paqueteComprado.itemNombre));
    } 

    comprar(): Promise<HTMLElement> {
        if(!this.estamosEnMercado()) {
            return Promise.resolve($(".icon.market-icon")[0]);
        }else {
            let paquete = this.buscarMejorPaquete(this.getOroActual());
            if(paquete === null ) {
                this.actualizarEstadoPaquete(paquete_estados.NO_HAY_DISPONIBLES);
                this.estado = tareaEstado.toTheEnd;
                return Promise.resolve($(".icon.market-icon")[0]);
            }else {
                mandarMensajeBackground({
                    header: MensajeHeader.CONTENT_SCRIPT_PKT_COMPRADO,
                    paqueteComprado: paquete
                });
                this.paqueteComprado = paquete;
                this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_COMPRA);
                return Promise.resolve(paquete.link);
            }
        }
    }

    agarrarPaquete(): Promise<HTMLElement> {
        if($('#packagesPage').length == 0) {
            return Promise.resolve($('#menue_packages')[0]);
        }else {
            let paqueteAMover = this.buscarPaqueteComprado();
            if(paqueteAMover == null) {
                this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_AGARRE);
                return Promise.resolve($('#menue_packages')[0]);
            }else {
                ($(paqueteAMover) as any).simulate("drag-n-drop", { dragTarget: $("#sstat_gold_val")});
                return new Promise<HTMLElement>((resolve) =>
                    window.setTimeout(() => {
                        this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_AGARRE);
                        ($(paqueteAMover) as any).simulate("drag-n-drop", { dragTarget: $("#inv > div:nth-child(9)")});
                        window.setTimeout(()=>{ resolve($('#menue_packages')[0]);},1000)
                    },1500)
                );
            }
            
        }
    }

    verificarAgarre(): Promise<HTMLElement>  {
        let estaEnELInventario = $('#inv .ui-droppable').toArray().some(e=>e.getAttribute('data-tooltip').includes(this.paqueteComprado.itemNombre));
        if(estaEnELInventario) {
            this.actualizarEstadoPaquete(paquete_estados.DEVOLVER);
            estadoEjecucion.intestosPaquetes = 0;
            return Promise.resolve($(".icon.market-icon")[0]);
        }else {
            this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_COMPRA);
            estadoEjecucion.intestosPaquetes = estadoEjecucion.intestosPaquetes+1;
            return Promise.resolve($('#menue_packages')[0]);
        }
    }

    devolver(): Promise<HTMLElement> {
        if(!this.estamosEnMercado()) {
            return Promise.resolve($(".icon.market-icon")[0]);
        }else {
            let itemAVender = this.buscarPaqueteCompradoEnInventario();
            /*
            Ak llega siempre con paquete o por lo menos deberia ser asi.
            if(itemAVender == null) {
                this.actualizarEstadoPaquete(paquete_estados.COMPRAR);
                this.estado = tareaEstado.finalizada;
                return Promise.resolve($('#menue_packages')[0]);
            }else */
            if(this.paqueteComprado.precio*0.04>this.getOroActual()){
                this.actualizarEstadoPaquete(paquete_estados.JUNTAR_PLATA);
                this.estado = tareaEstado.toTheEnd;
                return Promise.resolve($('a[title=\'Panteón\']')[0]);
            }else {
                ($(itemAVender) as any).simulate("drag-n-drop", { dragTarget: $("#market_sell")});
                this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_DEVOLUCION);
                return new Promise((resolve) => window.setTimeout(()=>{this.ponerALaVenta(resolve)},1000));
            }
        }
    }

    verificarDevolucion() : Promise<HTMLElement> {
        if(!this.estamosEnMercado()) {
            return Promise.resolve($(".icon.market-icon")[0]);
        }else {
            let estaEnELInventario = $('#inv .ui-droppable').toArray().some(e=>e.getAttribute('data-tooltip').includes(this.paqueteComprado.itemNombre));
            if(estaEnELInventario) {
                this.actualizarEstadoPaquete(paquete_estados.DEVOLVER);
                estadoEjecucion.intestosPaquetes =  estadoEjecucion.intestosPaquetes + 1;
                return Promise.resolve($(".icon.market-icon")[0]);
            }else {
                this.estado = tareaEstado.finalizada;
                this.actualizarEstadoPaquete(paquete_estados.COMPRAR);
                return Promise.resolve($(".icon.market-icon")[0]);
            }
        }
    }

    ponerALaVenta(resolve) {
        (<HTMLInputElement[]><unknown>$('#preis'))[0].value = this.paqueteComprado.precio.toString();
        (<HTMLInputElement[]><unknown>$('#dauer'))[0].value = '3';
        this.actualizarEstadoPaquete(paquete_estados.COMPRAR);
        window.setTimeout(()=>{resolve($('#market_sell_box .awesome-button')[0])},500)
    }


    actualizarEstadoPaquete(estadoNuevo) {
        this.estadoPaquete = estadoNuevo;
        mandarMensajeBackground({header: MensajeHeader.CONTENT_SCRIPT_CAMBIO_PKT, estadoPaquete: estadoNuevo});
    }

    getProximoClick(): Promise<HTMLElement> {
        let hoja = 1; //cero es la primera
        let resultado : Promise<HTMLElement> ;
        let jQueryResult = $('a.awesome-tabs[data-available*=\"true\"]');
        if (jQueryResult.length >= hoja + 1)
            jQueryResult[hoja].click();

        this.paqueteComprado = estadoEjecucion.paquete;
        this.estadoPaquete = estadoEjecucion.paqueteEstado;

        if (this.estadoPaquete === paquete_estados.COMPRAR && this.getOroActual() > globalConfig.personaje.oroBaseParaPaquete) {
            estadoEjecucion.intestosPaquetes = 0;
            resultado = this.comprar();
        }else if(estadoEjecucion.intestosPaquetes == 5) {
            this.estado = tareaEstado.cancelada;
            this.actualizarEstadoPaquete(paquete_estados.COMPRAR);
            console.log("REVISAR PAQUETES.")
            resultado = Promise.resolve($('#mainmenu > div:nth-child(1) a')[0]);
        }else if(this.estadoPaquete === paquete_estados.VERIFICAR_COMPRA) {
            resultado = this.agarrarPaquete();
        }else if(this.estadoPaquete === paquete_estados.DEVOLVER) {
            resultado = this.devolver();
        }else if(this.estadoPaquete === paquete_estados.JUNTAR_PLATA || this.estadoPaquete === paquete_estados.NO_HAY_DISPONIBLES) {
            this.estado = tareaEstado.toTheEnd;
            resultado = Promise.resolve($('a[title=\'Panteón\']')[0]);
        }else if(this.estadoPaquete === paquete_estados.VERIFICAR_AGARRE) {
            resultado = this.verificarAgarre();
        }else if(this.estadoPaquete === paquete_estados.VERIFICAR_DEVOLUCION) {
            resultado = this.verificarDevolucion();
        }else {
            this.estado = tareaEstado.cancelada;
            this.actualizarEstadoPaquete(paquete_estados.COMPRAR);
            resultado = Promise.resolve($('#mainmenu > div:nth-child(1) a')[0]);
        }
        console.log(estadoEjecucion);
        mandarMensajeBackground({header: MensajeHeader.CAMBIO_INTENTO_PAQUETES, intentos: estadoEjecucion.intestosPaquetes})
        return resultado;
    }

    seCancela(): boolean {
        return !globalConfig.modulos.correrPaquetes;
    }

    equals(t: Tarea): boolean {
        return t.tipo_class == this.tipo_class;
    }


}
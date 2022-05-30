class ControladorDeRefinamiento implements Tarea {
    private estado: tareaEstado = tareaEstado.enEspera;
    prioridad: tareaPrioridad = datosContext.prioridades.refinamiento;
    timed_out_miliseconds: number = 60000;
    tipo_class: string = 'ControladorDeRefinamiento';
    itemUsableARefinar: ItemUsable;
    estadoRefinamiento: EstadoRefinamiento = EstadoRefinamiento.REFINAR;
    debuguear: boolean = true;
    hojaToPutItem = 0;

    constructor()
    constructor(itemRefinar:ItemUsable)
    constructor(itemRefinar?:ItemUsable) {
        this.itemUsableARefinar = itemRefinar;
    }

    changeEstado(newEstado: tareaEstado): void {
        this.estado = newEstado;
    }

    equals(t: Tarea): boolean {
        return t.tipo_class == t.tipo_class;
    }

    fromJsonString(jsonGuardado: any): Guardable {
        this.estado = jsonGuardado.estado;
        this.estadoRefinamiento = jsonGuardado.estadoRefinamiento;
        if(jsonGuardado.hasOwnProperty('itemUsableARefinar'))
            this.itemUsableARefinar  = <ItemUsable>(new ItemUsable().fromJsonString(jsonGuardado.itemUsableARefinar));
        this.tipo_class = jsonGuardado.tipo_class;
        return this;
    }

    getEstado(): tareaEstado {
        return this.estado;
    }

    getHomeClick(): HTMLElement {
        return this.getBotonBancoTrabajo();
    }

    getProximoClick(): Promise<HTMLElement> {
        let toReturn: Promise<HTMLElement> = null;
        if(this.estamosBancoTrabajo() && this.estaApuntandoPersonaje()) {
            if(this.estadoRefinamiento == EstadoRefinamiento.REFINAR) {
                toReturn = this.refinar();
            }else if(this.estadoRefinamiento == EstadoRefinamiento.PONER_RECURSOS) {
                this.estado = tareaEstado.finalizada;
                toReturn = tareasControlador.getPronosticoClick();
            }
        } else if(this.estamosBancoTrabajo()) {
            toReturn = Promise.resolve($('.charmercsel')[0]);
        } else {
            toReturn = Promise.resolve(this.getBotonBancoTrabajo());
        }
        return toReturn;
    }

    puedeDesbloquearse(): boolean {
        return false;
    }

    seCancela(): boolean {
        return !datosContext.modulos.correrRefinamiento;
    }

    estamosBancoTrabajo(): boolean {
        return $('#forgePage').length != 0 && $('#mainnav .awesome-tabs')[2].classList.contains('current')
    }

    getBotonBancoTrabajo() :HTMLElement {
        return $('a.menuitem').filter((e,element)=>element.innerHTML.includes('Banco de trabajo'))[0];
    }

    estaApuntandoPersonaje() {
        let jQueryResult = $('.charmercsel');
        return jQueryResult[0] === undefined ||
            jQueryResult[0].classList.contains('active');
    }

    private async refinar() {
        await this.moverItemInventario();
        let toClick = await this.ponerRefinamiento();
        return toClick;
    }

    private async moverItemInventario()  {
        this.itemUsableARefinar = new ItemUsable($('#char .ui-draggable')[4].getAttribute('data-tooltip'));
        let itemToMove = $('#char > .ui-droppable')
                            .filter((e,element) => element.innerHTML.toLowerCase().includes(this.itemUsableARefinar.getName().toLowerCase())).children();
        let inventario = $('.inventoryBox');
        await ItemUtils.ponerHojaNumero(this.hojaToPutItem,inventario);
        this.itemUsableARefinar.setHtmlElement(itemToMove[0]);
        await ItemUtils.moverItem(this.itemUsableARefinar,inventario[0]);
    }

    private async ponerRefinamiento() : Promise<HTMLElement> {
        let itemToMove = $('#inv > .ui-draggable')
            .filter((e,element) => element.innerHTML.toLowerCase().includes(this.itemUsableARefinar.getName().toLowerCase()));
        let bancoDeTrabajo = $('#itembox');
        this.itemUsableARefinar.setHtmlElement(itemToMove[0]);
        await ItemUtils.moverItem(this.itemUsableARefinar,bancoDeTrabajo[0]);
        this.estadoRefinamiento = EstadoRefinamiento.PONER_RECURSOS;
        return $('#rent .awesome-button')[0];
    }
}
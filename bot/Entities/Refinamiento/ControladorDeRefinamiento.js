var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ControladorDeRefinamiento {
    constructor(itemRefinar) {
        this.estado = tareaEstado.enEspera;
        this.prioridad = datosContext.prioridades.refinamiento;
        this.timed_out_miliseconds = 60000;
        this.tipo_class = 'ControladorDeRefinamiento';
        this.estadoRefinamiento = EstadoRefinamiento.REFINAR;
        this.debuguear = true;
        this.hojaToPutItem = 0;
        this.itemUsableARefinar = itemRefinar;
    }
    changeEstado(newEstado) {
        this.estado = newEstado;
    }
    equals(t) {
        return t.tipo_class == t.tipo_class;
    }
    fromJsonString(jsonGuardado) {
        this.estado = jsonGuardado.estado;
        this.estadoRefinamiento = jsonGuardado.estadoRefinamiento;
        if (jsonGuardado.hasOwnProperty('itemUsableARefinar'))
            this.itemUsableARefinar = (new ItemUsable().fromJsonString(jsonGuardado.itemUsableARefinar));
        this.tipo_class = jsonGuardado.tipo_class;
        return this;
    }
    getEstado() {
        return this.estado;
    }
    getHomeClick() {
        return this.getBotonBancoTrabajo();
    }
    getProximoClick() {
        let toReturn = null;
        if (this.estamosBancoTrabajo() && this.estaApuntandoPersonaje()) {
            if (this.estadoRefinamiento == EstadoRefinamiento.REFINAR) {
                toReturn = this.refinar();
            }
            else if (this.estadoRefinamiento == EstadoRefinamiento.PONER_RECURSOS) {
                this.estado = tareaEstado.finalizada;
                toReturn = tareasControlador.getPronosticoClick();
            }
        }
        else if (this.estamosBancoTrabajo()) {
            toReturn = Promise.resolve($('.charmercsel')[0]);
        }
        else {
            toReturn = Promise.resolve(this.getBotonBancoTrabajo());
        }
        return toReturn;
    }
    puedeDesbloquearse() {
        return false;
    }
    seCancela() {
        return !datosContext.modulos.correrRefinamiento;
    }
    estamosBancoTrabajo() {
        return $('#forgePage').length != 0 && $('#mainnav .awesome-tabs')[2].classList.contains('current');
    }
    getBotonBancoTrabajo() {
        return $('a.menuitem').filter((e, element) => element.innerHTML.includes('Banco de trabajo'))[0];
    }
    estaApuntandoPersonaje() {
        let jQueryResult = $('.charmercsel');
        return jQueryResult[0] === undefined ||
            jQueryResult[0].classList.contains('active');
    }
    refinar() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.moverItemInventario();
            let toClick = yield this.ponerRefinamiento();
            return toClick;
        });
    }
    moverItemInventario() {
        return __awaiter(this, void 0, void 0, function* () {
            this.itemUsableARefinar = new ItemUsable($('#char .ui-draggable')[4].getAttribute('data-tooltip'));
            let itemToMove = $('#char > .ui-droppable')
                .filter((e, element) => element.innerHTML.toLowerCase().includes(this.itemUsableARefinar.getName().toLowerCase())).children();
            let inventario = $('.inventoryBox');
            yield ItemUtils.ponerHojaNumero(this.hojaToPutItem, inventario);
            this.itemUsableARefinar.setHtmlElement(itemToMove[0]);
            yield ItemUtils.moverItem(this.itemUsableARefinar, inventario[0]);
        });
    }
    ponerRefinamiento() {
        return __awaiter(this, void 0, void 0, function* () {
            let itemToMove = $('#inv > .ui-draggable')
                .filter((e, element) => element.innerHTML.toLowerCase().includes(this.itemUsableARefinar.getName().toLowerCase()));
            let bancoDeTrabajo = $('#itembox');
            this.itemUsableARefinar.setHtmlElement(itemToMove[0]);
            yield ItemUtils.moverItem(this.itemUsableARefinar, bancoDeTrabajo[0]);
            this.estadoRefinamiento = EstadoRefinamiento.PONER_RECURSOS;
            return $('#rent .awesome-button')[0];
        });
    }
}

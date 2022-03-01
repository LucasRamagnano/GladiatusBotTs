var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Inventario {
    constructor() {
        this.prioridad = globalConfig.prioridades.curar;
        this.tipo_class = 'Inventario';
        this.vecesABuscar = 10;
        this.timed_out_miliseconds = 10000;
    }
    getProximoClick() {
        if (this.estamosEnVisionGeneral() && estaApuntandoPersonaje()) {
            return this.buscarComidaYCurar();
        }
        else if (estaEnVisionGeneral()) {
            return Promise.resolve($('.charmercsel')[0]);
        }
        else {
            return Promise.resolve($('#mainmenu > div:nth-child(1) a')[0]);
        }
    }
    buscarComidaYCurar() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.vecesABuscar <= 0) {
                //Mando no hay comida
                //Voy a vision general
                this.estado = tareaEstado.bloqueada;
                this.timeBlocked = Date.now().valueOf();
                return tareasControlador.getPronosticoClick();
            }
            else if ($('#inv div[data-tooltip*=\'ndose: Cura\']').length === 0) {
                $('a.awesome-tabs[data-available*=\"true\"]')[this.proximaHoja()].click();
                this.vecesABuscar--;
                yield this.wait(250);
                this.buscarComidaYCurar();
            }
            else {
                this.curar();
                this.estado = tareaEstado.finalizada;
                yield this.wait(500);
                return tareasControlador.getPronosticoClick();
            }
        });
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
        this.timeBlocked = guardado.timeBlocked;
        return this;
    }
    seCancela() {
        return getPorcentajeVida() > globalConfig.personaje.porcentajeMinimoParaCurar;
    }
    equals(t) {
        return t.tipo_class == this.tipo_class;
    }
    getHomeClick() {
        return $('#mainmenu > div:nth-child(1) a')[0];
    }
    puedeDesbloquearse() {
        let milisecondsNow = Date.now().valueOf();
        let dif = milisecondsNow - this.timeBlocked;
        return Math.floor(dif / 60000) >= 10;
    }
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

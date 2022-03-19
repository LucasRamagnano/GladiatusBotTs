var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Comandos {
    constructor() {
        this.fundicion = new ComandosModuloFundicion();
    }
}
class ComandosModuloFundicion {
    agregarFiltro(query, calidad = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            let filtros = yield ControladorDeFundicion.getFilters();
            if (query.length < 4) {
                console.log('Filtro muy corto, minimo 4 caracteres.');
            }
            else if (!(calidad >= 0 && calidad <= 5)) {
                console.log('Calidad invalidad, 0:blanca, [...], 5:rojo');
            }
            else if (filtros.some(e => e.query == query)) { //TODO , perimir por calidad, pero repite subasta, probar ...Set
                console.log('Ya existe este filtro.');
            }
            else {
                filtros.push(new FiltroPaquete(calidad, query));
                let toSave = {};
                toSave[Keys.FILTRO_ITEMS] = filtros;
                chrome.storage.local.set(toSave, () => { this.actualizarSubastasFundibles(); });
            }
        });
    }
    removerFiltro(query) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ControladorDeFundicion.removerFundicionFiltro(query);
            this.actualizarSubastasFundibles();
        });
    }
    mostrarFiltros(query = '') {
        return __awaiter(this, void 0, void 0, function* () {
            let filtros = yield ControladorDeFundicion.getFilters();
            let toShow = filtros.filter(e => e.query.toLowerCase().includes(query.toLowerCase()));
            if (toShow.length > 0)
                toShow.forEach(e => { console.log(e.toString()); });
            else
                console.log('No se encontraron filtros...');
        });
    }
    resetFiltros() {
        return __awaiter(this, void 0, void 0, function* () {
            yield ControladorDeFundicion.resetFiltrosItems();
            this.actualizarSubastasFundibles();
        });
    }
    actualizarSubastasFundibles() {
        return __awaiter(this, void 0, void 0, function* () {
            ctrlSubastaFundicion.aBuscar = yield ControladorSubastas.getKeysFundicion();
            ctrlSubastaFundicionMercenario.aBuscar = yield ControladorSubastas.getKeysFundicion();
        });
    }
}
//class OtrosModulos{}

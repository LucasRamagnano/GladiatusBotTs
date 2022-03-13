var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class PaginaAnalisis {
    constructor(paginaNumero, linkPagina) {
        this.paginaNumero = paginaNumero;
        this.linkPagina = linkPagina;
        ControladorDeFundicion.getFilters();
    }
    analizar() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield fetch(this.linkPagina, { cache: 'no-store' });
                let paginaPaquete = yield response.text();
                let paquetesOro = $(paginaPaquete).find('#packages .packageItem').toArray();
                let resultado = paquetesOro.filter(e => e.innerHTML.includes('Oro'))
                    .map((e) => Number.parseInt($(e).find('.ui-draggable').attr('data-price-gold')))
                    .reduce((e1, e2) => e1 + e2, 0);
                this.oroPagina = resultado;
            }
            catch (e) {
                this.oroPagina = 0;
                console.log(e);
            }
        });
    }
}
class AnalisisPaquetesBackground {
    constructor(linkBase) {
        this.debuguear = true;
        this.linkBase = linkBase;
    }
    analizarPaquetes() {
        return __awaiter(this, void 0, void 0, function* () {
            let paginasToFiler;
            let response = yield fetch(this.linkBase, { cache: 'no-store' });
            let paginaPaquete = yield response.text();
            let totalPaginas = parseInt($($(paginaPaquete).find('.paging')[0]).find('.paging_numbers a').last().text());
            paginasToFiler = this.inicializarPaginas(totalPaginas);
            Consola.log(this.debuguear, 'Analizando paquetes background');
            let toDo = [];
            for (const e of paginasToFiler) {
                toDo.push(e.analizar());
            }
            yield Promise.all(toDo);
            Consola.log(this.debuguear, 'Paquetes analizados');
            let oroTotal = paginasToFiler.map(e1 => e1.oroPagina).reduce((e1, e2) => e1 + e2, 0);
            console.log('Oro Total: ' + oroTotal);
        });
    }
    //https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=packages&f=0&fq=-1&qry=&sh=23e80dbf675470c47f33358abfee157b&page=2&page=1
    inicializarPaginas(numerosDePaginas) {
        let paginas = [];
        for (let i = 1; i <= numerosDePaginas; i++) {
            paginas.push(new PaginaAnalisis(i, this.linkBase.replace('page=1', 'page=' + i)));
        }
        return paginas;
    }
}

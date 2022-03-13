class PaginaAnalisis{
    paginaNumero:number;
    linkPagina: string;

    oroPagina:number;


    constructor(paginaNumero: number, linkPagina: string) {
        this.paginaNumero = paginaNumero;
        this.linkPagina = linkPagina;
        ControladorDeFundicion.getFilters();
    }

    async analizar() {
        try {
            let response = await fetch(this.linkPagina, {cache: 'no-store'});
            let paginaPaquete = await response.text();
            let paquetesOro = $(paginaPaquete).find('#packages .packageItem').toArray();
            let resultado = paquetesOro.filter(e => e.innerHTML.includes('Oro'))
                .map((e) => Number.parseInt($(e).find('.ui-draggable').attr('data-price-gold')))
                .reduce((e1, e2) => e1 + e2,0);
            this.oroPagina = resultado;
        }catch (e) {
            this.oroPagina = 0;
            console.log(e);
        }
    }
}

class AnalisisPaquetesBackground {

    linkBase: string;
    debuguear: boolean = true;


    constructor(linkBase: string) {
        this.linkBase = linkBase;
    }

    async analizarPaquetes() {
        let paginasToFiler: PaginaAnalisis[];

        let response = await fetch(this.linkBase, {cache: 'no-store'});
        let paginaPaquete = await response.text();
        let totalPaginas = parseInt($($(paginaPaquete).find('.paging')[0]).find('.paging_numbers a').last().text())
        paginasToFiler = this.inicializarPaginas(totalPaginas);
        Consola.log(this.debuguear,'Analizando paquetes background');
        let toDo: Promise<void>[] = [];
        for (const e of paginasToFiler) {
            toDo.push(e.analizar());
        }
        await Promise.all(toDo);
        Consola.log(this.debuguear,'Paquetes analizados');
        let oroTotal = paginasToFiler.map(e1=>e1.oroPagina).reduce((e1,e2)=>e1+e2,0);
        console.log('Oro Total: ' + oroTotal);
    }
    //https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=packages&f=0&fq=-1&qry=&sh=23e80dbf675470c47f33358abfee157b&page=2&page=1
    inicializarPaginas(numerosDePaginas:number) {
        let paginas: PaginaAnalisis[] = [];
        for(let i = 1;i<=numerosDePaginas;i++) {
            paginas.push(new PaginaAnalisis(i,this.linkBase.replace('page=1','page='+i)));
        }
        return paginas;
    }

}
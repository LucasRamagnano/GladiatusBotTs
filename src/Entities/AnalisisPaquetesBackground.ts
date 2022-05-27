class PaginaAnalisis{
    paginaNumero:number;
    linkPagina: string;

    paquetes:Item[] =[];

    constructor(paginaNumero: number, linkPagina: string) {
        this.paginaNumero = paginaNumero;
        this.linkPagina = linkPagina;
    }

    async analizar() {
        try {
            let response = await fetch(this.linkPagina, {cache: 'no-store'});
            let paginaPaquete = await response.text();
            let paquetesOro = $(paginaPaquete).find('#packages .packageItem').toArray();
            this.paquetes = ItemBuilder.createItemFromPackageItem(paquetesOro);
        }catch (e) {
            this.paquetes = [];
            console.log(e);
        }
    }

    getQtyType(tipoPkt: ItemTypes):number {
        return this.getPaquetesType(tipoPkt).length;
    }

    getPaquetesType(tipoPkt: ItemTypes):Item[] {
        return this.paquetes.filter(e=> e.getTipo() == tipoPkt);
    }

    getPaquetesDeOro(): ItemOro[] {
        return this.paquetes.filter(e=> e.getTipo() == ItemTypes.ItemOro).map(e => <ItemOro>e);
    }

    getValorPaquetesDeOro():number {
        return this.getPaquetesDeOro().reduce((e1,e2)=>e1 + e2.oroValor,0)
    }
}

class AnalisisPaquetesBackground {

    linkBase: string;
    debuguear: boolean = true;
    paginasToFiler: PaginaAnalisis[];

    constructor(linkBase: string) {
        this.linkBase = linkBase;
    }

    async analizarPaquetes():Promise<number> {
        let response = await fetch(this.linkBase, {cache: 'no-store'});
        let paginaPaquete = await response.text();
        let totalPaginas = parseInt($($(paginaPaquete).find('.paging')[0]).find('.paging_numbers a').last().text())
        this.paginasToFiler = this.inicializarPaginas(totalPaginas);
        Consola.log(this.debuguear,'Analizando paquetes background');
        let toDo: Promise<void>[] = [];
        for (const e of this.paginasToFiler) {
            toDo.push(e.analizar());
        }
        await Promise.all(toDo);
        Consola.log(this.debuguear,'Paquetes analizados');
        let oroTotal = this.paginasToFiler.map(e1=>e1.getValorPaquetesDeOro()).reduce((e1,e2)=>e1+e2,0);
        let toAnalyze = [ItemTypes.ItemComida, ItemTypes.ItemPergamino, ItemTypes.ItemUsable, ItemTypes.ItemUnknown, ItemTypes.ItemRecurso];
        for(let e of toAnalyze) {
            let itemsTotales = this.paginasToFiler.map(e1=>e1.getQtyType(e)).reduce((e1,e2)=>e1+e2,0);
            console.log(e + ': ' + itemsTotales);
        }

        console.log('Oro Total: ' + oroTotal);
        return oroTotal;
    }

    getItemsUsables():ItemUsable[] {
        let items:Item[] = [];
        this.paginasToFiler
            .forEach((e)=> {
                items = items.concat(e.getPaquetesType(ItemTypes.ItemUsable));
            })
        return items.map(e=>{return <ItemUsable>e})
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
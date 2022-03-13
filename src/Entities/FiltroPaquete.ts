enum calidadesItemsPaquetes{
    ESTANDAR = 0, VERDE = 1, AZUL = 2, PURPURA = 3, NARANJA = 4, ROJO =5
}

class FiltroPaquete{
    calidad: calidadesItemsPaquetes = calidadesItemsPaquetes.ESTANDAR;
    query: string = '';
    hayItemsFundibles: boolean = true;

    constructor(calidad: calidadesItemsPaquetes, query: string) {
        this.calidad = calidad;
        this.query = query;
    }

    isFilterSeteado() {
        return (<HTMLSelectElement>$('select[name="fq"]')[0]).selectedIndex == this.calidad
                && $('input[name="qry"]')[0].getAttribute('value') == this.getLastQueryWord();
    }

    setearFiltro() {
        (<HTMLSelectElement>$('select[name="fq"]')[0]).selectedIndex = this.calidad;
        $('input[name="qry"]')[0].setAttribute('value',this.getLastQueryWord());
    }

    getLink() {
        let linkBase = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=packages&f=0&fq=0&qry=&sh='+estadoEjecucion.sh;
        linkBase = linkBase.replace('fq=0','fq='+(this.calidad - 1));
        linkBase = linkBase.replace('qry=','qry='+this.getLastQueryWord());
        return linkBase;
    }

    getLastQueryWord() {
        let lastQueryWord = this.query.split(' ');
        return lastQueryWord[lastQueryWord.length-1];
    }
}
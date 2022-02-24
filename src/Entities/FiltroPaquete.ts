enum calidadesItemsPaquetes{
    ESTANDAR = 0, VERDE = 1, AZUL = 2, PURPURA = 3, NARANJA = 4, ROJO =5
}

class FiltroPaquete{
    calidad: calidadesItemsPaquetes = calidadesItemsPaquetes.ESTANDAR;
    query: string = '';

    constructor(calidad: calidadesItemsPaquetes, query: string) {
        this.calidad = calidad;
        this.query = query;
    }

    isFilterSeteado() {
        return (<HTMLSelectElement>$('select[name="fq"]')[0]).selectedIndex == this.calidad
                && $('input[name="qry"]')[0].getAttribute('value') == this.query;
    }

    setearFiltro() {
        (<HTMLSelectElement>$('select[name="fq"]')[0]).selectedIndex = this.calidad;
        $('input[name="qry"]')[0].setAttribute('value',this.query);
    }
}
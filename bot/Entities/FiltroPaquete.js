var calidadesItemsPaquetes;
(function (calidadesItemsPaquetes) {
    calidadesItemsPaquetes[calidadesItemsPaquetes["ESTANDAR"] = 0] = "ESTANDAR";
    calidadesItemsPaquetes[calidadesItemsPaquetes["VERDE"] = 1] = "VERDE";
    calidadesItemsPaquetes[calidadesItemsPaquetes["AZUL"] = 2] = "AZUL";
    calidadesItemsPaquetes[calidadesItemsPaquetes["PURPURA"] = 3] = "PURPURA";
    calidadesItemsPaquetes[calidadesItemsPaquetes["NARANJA"] = 4] = "NARANJA";
    calidadesItemsPaquetes[calidadesItemsPaquetes["ROJO"] = 5] = "ROJO";
})(calidadesItemsPaquetes || (calidadesItemsPaquetes = {}));
class FiltroPaquete {
    constructor(calidad, query) {
        this.calidad = calidadesItemsPaquetes.ESTANDAR;
        this.query = '';
        this.calidad = calidad;
        this.query = query;
    }
    isFilterSeteado() {
        return $('select[name="fq"]')[0].selectedIndex == this.calidad
            && $('input[name="qry"]')[0].getAttribute('value') == this.query;
    }
    setearFiltro() {
        $('select[name="fq"]')[0].selectedIndex = this.calidad;
        $('input[name="qry"]')[0].setAttribute('value', this.query);
    }
}

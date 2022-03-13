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
        this.hayItemsFundibles = true;
        this.calidad = calidad;
        this.query = query;
    }
    isFilterSeteado() {
        return $('select[name="fq"]')[0].selectedIndex == this.calidad
            && $('input[name="qry"]')[0].getAttribute('value') == this.getLastQueryWord();
    }
    setearFiltro() {
        $('select[name="fq"]')[0].selectedIndex = this.calidad;
        $('input[name="qry"]')[0].setAttribute('value', this.getLastQueryWord());
    }
    getLink() {
        let linkBase = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=packages&f=0&fq=0&qry=&sh=' + estadoEjecucion.sh;
        linkBase = linkBase.replace('fq=0', 'fq=' + (this.calidad - 1));
        linkBase = linkBase.replace('qry=', 'qry=' + this.getLastQueryWord());
        return linkBase;
    }
    getLastQueryWord() {
        let lastQueryWord = this.query.split(' ');
        return lastQueryWord[lastQueryWord.length - 1];
    }
}

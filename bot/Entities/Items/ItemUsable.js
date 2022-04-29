class ItemUsable {
    constructor(raw_data) {
        this.stasToInclude = ['daño', 'armadura', 'salud', 'fuerza', 'habilidad', 'agilidad', 'constitución', 'carisma', 'inteligencia', 'ataque',
            'curación', 'bloqueo', 'endurecimiento', 'amenaza', 'nivel', 'valor', 'durabilidad', 'refinamiento'];
        this.stats = [];
        this.tipo_class = 'ItemUsable';
        this.rawData = raw_data;
    }
    fromJsonString(guardado) {
        this.stats = guardado.stats;
        this.rawData = guardado.rawData;
        return this;
    }
    getCalidad() {
        return QualityItemControler.getColorFromRaw(this.rawData);
    }
    getStats() {
        if (this.stats.length == 0) {
            this.procesarRawData();
        }
        return this.stats;
    }
    getNivel() {
        let nivelStat = this.getStats().filter(e => e.toLowerCase().includes('nivel'))[0];
        return parseInt(nivelStat.replace('Nivel', '').trim());
    }
    getTipo() {
        return ItemTypes.ItemUsable;
    }
    //00e1
    procesarRawData() {
        this.stats = [];
        let estadisticasSinProcesar = this.rawData.split('"');
        estadisticasSinProcesar = estadisticasSinProcesar
            .map(e => e.replace('<div class=', ''))
            .map(e => e.replace('\\', 'barrita'))
            .map(e => e.replace('barritau00f1', 'ñ'))
            .map(e => e.replace('barritau00f3', 'ó'))
            .map(e => e.replace('barritau00e1', 'á'))
            .map(e => e.replace('barrita', ''))
            .map(e => {
            try {
                return decodeURIComponent(JSON
                    .parse('"' + e.replace(/\%/g, 'porcentaje') + '"'))
                    .replace('porcentaje', '\%');
            }
            catch (e) {
                return 'error';
            }
        });
        let name = estadisticasSinProcesar[1];
        let estadisticas = estadisticasSinProcesar.filter(elem => this.stasToInclude.some(estat => elem.toLocaleLowerCase().includes(estat)));
        this.stats = [name].concat(estadisticas);
        let ixRef = this.stats.findIndex((e) => e.toLowerCase().includes('refinamiento'));
        this.stats = this.stats.slice(0, ixRef + 1);
    }
    getMostrableElement() {
        try {
            this.procesarRawData();
            return this.getStats().map((e, ix) => {
                let p = document.createElement('p');
                p.textContent = e;
                if (ix == 0)
                    p.classList.add(this.getCalidad().color);
                return p;
            });
        }
        catch (e) {
            let p = document.createElement('p');
            p.textContent = e;
            return [p];
        }
    }
    setHtmlElement(elem) {
        this.htmlElement = elem;
    }
    getHtmlElement() {
        return this.htmlElement;
    }
    esAgarrable() {
        return !this.rawData.includes('Antonius') && this.getCalidad().qualityColor < QualityColors.PURPLE;
    }
    getTimeAgarre() {
        return 200;
    }
}

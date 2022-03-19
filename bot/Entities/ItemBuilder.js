class ItemTemp extends Guardable {
    //color:string;
    constructor(rawData) {
        super();
        this.stasToInclude = ['daño', 'armadura', 'salud', 'fuerza', 'habilidad', 'agilidad', 'constitución', 'carisma', 'inteligencia', 'ataque',
            'curación', 'bloqueo', 'endurecimiento', 'amenaza', 'nivel'];
        this.statsFinales = [];
        this.rawData = rawData;
    }
    procesarRawData() {
        if (this.statsFinales.length != 0)
            return;
        let estadisticasSinProcesar = this.rawData.split('"');
        estadisticasSinProcesar = estadisticasSinProcesar.map(e => {
            try {
                return decodeURIComponent(JSON.parse('"' + e.replace(/\%/g, 'porcentaje') + '"')).replace('porcentaje', '\%');
            }
            catch (e) {
                return 'error';
            }
        });
        let name = estadisticasSinProcesar[1];
        let estadisticas = estadisticasSinProcesar.filter(elem => this.stasToInclude.some(estat => elem.toLocaleLowerCase().includes(estat)));
        this.statsFinales = [name].concat(estadisticas);
        let ix = this.statsFinales.findIndex((e) => e.includes('Nivel'));
        this.statsFinales = this.statsFinales.slice(0, ix + 1);
    }
    getMostrableElement() {
        try {
            this.procesarRawData();
            return this.statsFinales.map((e, ix) => {
                let p = document.createElement('p');
                p.textContent = e;
                if (ix == 0)
                    p.classList.add(this.getColor());
                return p;
            });
        }
        catch (e) {
            let p = document.createElement('p');
            p.textContent = e;
            return [p];
        }
    }
    getLevel() {
        this.procesarRawData();
        return parseInt(this.statsFinales[this.statsFinales.length - 1].replace('Nivel', '').trim());
    }
    getColor() {
        let colors = [{ code: 'lime', color: 'green', index: 0 }, { code: '#5159F7', color: 'blue', index: 0 }, { code: '#E303E0', color: 'purple', index: 0 }, { code: '#FF6A00', color: 'gold', index: 0 }];
        let colorPick = colors.filter(e => this.rawData.includes(e.code))
            .map(e => { e.index = this.rawData.indexOf(e.code); return e; })
            .sort((e1, e2) => e1.index > e2.index ? 1 : -1)[0];
        return colorPick.color;
    }
}
class ItemBuilder {
    static createItemFromPackageItem(elem) {
    }
}

class Guardable {
    fromJsonString(guardado) {
        return null;
    }
    ;
}
class AuctionKey {
    constructor(key) {
        this.contador = 0;
        this.levelMaximo = 0;
        this.key = key;
    }
    encontrado() {
        this.contador++;
    }
    analizarNivel(nuevoLevel) {
        try {
            if (parseInt(nuevoLevel) > this.levelMaximo) {
                this.levelMaximo = parseInt(nuevoLevel);
            }
        }
        catch (e) {
            //console.log(e);
        }
    }
}
class SubastaResultado {
    constructor(busquedas, busquedaFecha, tusSubastas) {
        this.tusSubastas = [];
        this.busquedas = busquedas;
        this.busquedaFecha = busquedaFecha;
        this.tusSubastas = tusSubastas;
    }
    sortResultado(e1, e2) {
        let numberOfWordE1 = Math.min(e1.key.split(' ').length, 2);
        let numberOfWordE2 = Math.min(e2.key.split(' ').length, 2);
        let w1Analyze = e1.key.split(' ').reverse()[0].toLocaleLowerCase();
        let w2Analyze = e2.key.split(' ').reverse()[0].toLocaleLowerCase();
        if (numberOfWordE1 != numberOfWordE2) {
            return numberOfWordE1 > numberOfWordE2 ? 1 : -1;
        }
        else if (e1.contador != 0 && e2.contador != 0) {
            return w1Analyze > w2Analyze ? 1 : -1;
        }
        else if (e1.contador != 0) {
            return -1;
        }
        else if (e2.contador != 0) {
            return 1;
        }
        else {
            return w1Analyze > w2Analyze ? 1 : -1;
        }
    }
    getMostrable(link_subasta, isMercenario) {
        return this.busquedas.sort((e1, e2) => this.sortResultado(e1, e2)).map((e) => {
            let lastWord = e.key.split(' ').pop();
            let a = document.createElement('a');
            a.textContent = e.key + ': ' + e.contador + ' (' + e.levelMaximo + ')';
            a.target = '_self';
            e.contador > 0 ? a.classList.add("hay-items") : a.classList.add("vacio");
            if (!isMercenario)
                a.href = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=auction&qry=' + encodeURIComponent(lastWord) + '&itemLevel=00&itemType=0&itemQuality=-1&sh=' + link_subasta.split('=')[link_subasta.split('=').length - 1];
            else
                a.href = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=auction&qry=' + encodeURIComponent(lastWord) + '&itemLevel=00&itemType=0&itemQuality=-1&ttype=3&sh=' + link_subasta.split('=')[link_subasta.split('=').length - 1];
            return a;
        });
    }
    getTusSubastas() {
        return this.tusSubastas.map((e) => {
            let p = document.createElement('p');
            p.textContent = e;
            return p;
        });
    }
    getMostrableFecha() {
        let p = document.createElement('p');
        console.log('busqueda fecha' + this.busquedaFecha.getMilliseconds());
        let diffMilliseconds = Math.abs(Date.now() - this.busquedaFecha.valueOf());
        console.log('Dif millli ' + diffMilliseconds);
        let diferenciaSegundos = Math.floor((diffMilliseconds / 1000));
        p.textContent = 'Actualizado hace ' + diferenciaSegundos + ' segundos';
        return p;
    }
}
class Consola {
    static log(mostrar, mensaje) {
        if (mostrar)
            console.log(mensaje);
    }
}
var itemContainerNumber;
(function (itemContainerNumber) {
    itemContainerNumber[itemContainerNumber["CASCO"] = 2] = "CASCO";
    itemContainerNumber[itemContainerNumber["ARMA"] = 3] = "ARMA";
    itemContainerNumber[itemContainerNumber["ARMADURA"] = 5] = "ARMADURA";
    itemContainerNumber[itemContainerNumber["ESCUDO"] = 4] = "ESCUDO";
    itemContainerNumber[itemContainerNumber["GUANTE"] = 9] = "GUANTE";
    itemContainerNumber[itemContainerNumber["ZAPATO"] = 10] = "ZAPATO";
    itemContainerNumber[itemContainerNumber["ANILLO_1"] = 6] = "ANILLO_1";
    itemContainerNumber[itemContainerNumber["ANILLO_2"] = 7] = "ANILLO_2";
    itemContainerNumber[itemContainerNumber["AMULETO"] = 11] = "AMULETO";
})(itemContainerNumber || (itemContainerNumber = {}));
class ItemsPlayers {
    constructor(casco, arma, armadura, escudo, guante, zapato, anillo_1, anillo_2, amuleto) {
        this.casco = new StatsItems(casco);
        this.arma = new StatsItems(arma);
        this.armadura = new StatsItems(armadura);
        this.escudo = new StatsItems(escudo);
        this.guante = new StatsItems(guante);
        this.zapato = new StatsItems(zapato);
        this.anillo_1 = new StatsItems(anillo_1);
        this.anillo_2 = new StatsItems(anillo_2);
        this.amuleto = new StatsItems(amuleto);
    }
}
class StatsItems {
    constructor(rawData) {
        this.stasToInclude = ['daño', 'armadura', 'salud', 'fuerza', 'habilidad', 'agilidad', 'constitución', 'carisma', 'inteligencia', 'ataque',
            'curación', 'bloqueo', 'endurecimiento', 'amenaza', 'nivel'];
        this.statsFinales = [];
        this.rawData = rawData;
    }
    procesarRawData() {
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
    }
    getMostrableElement() {
        try {
            this.procesarRawData();
            return this.statsFinales.map((e) => {
                let p = document.createElement('p');
                p.textContent = e;
                return p;
            });
        }
        catch (e) {
            let p = document.createElement('p');
            p.textContent = e;
            return [p];
        }
    }
}

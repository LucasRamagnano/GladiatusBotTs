class LuchaMazmorra {
    constructor(dificultad, hacerBoss, indiceLugar) {
        this.tipo_class = 'LuchaMazmorra';
        this.dificultad = dificultad;
        this.hacerBoss = hacerBoss;
        this.indiceLugar = indiceLugar;
    }
    noEstaIniciada() {
        return $('input[value*=\"' + this.dificultad + '\"]').length == 1;
    }
    iniciar() {
        return $('input[value*=\"' + this.dificultad + '\"]')[0];
    }
    proximoEsBoss() {
        return $('.map_label').html() === 'Jefe';
    }
    cancelarMazmorra() {
        return $('input[name*="dungeonId"] + input')[0];
    }
    hayEnemigo() {
        return $('img[usemap*="#dmap"] + img').length > 0;
    }
    atacar() {
        return $('img[usemap*="#dmap"] + img')[0];
    }
    estamosEnTuLugar() {
        return $('#submenu2 a.menuitem')[this.indiceLugar].classList.contains('active');
    }
    irATuLugar() {
        //$('#cooldown_bar_dungeon .cooldown_bar_link')[0].click();
        return $('#submenu2 a.menuitem')[this.indiceLugar];
    }
    estamosEnDungeon() {
        return $('#dungeonPage').length == 1;
    }
    irADungeon() {
        return $('td a.awesome-tabs')[1];
    }
    getProximoClick() {
        if (!this.estamosEnTuLugar()) {
            return Promise.resolve(this.irATuLugar());
        }
        else if (!this.estamosEnDungeon()) {
            return Promise.resolve(this.irADungeon());
        }
        else if (this.noEstaIniciada()) {
            return Promise.resolve(this.iniciar());
        }
        else if (!this.hacerBoss && this.proximoEsBoss()) {
            return Promise.resolve(this.cancelarMazmorra());
        }
        else if (!this.hayEnemigo()) {
            return Promise.resolve(this.irATuLugar());
        }
        else {
            this.estado = tareaEstado.finalizada;
            return Promise.resolve(this.atacar());
        }
    }
    fromJsonString(jsonGuardado) {
        this.dificultad = jsonGuardado.dificultad;
        this.indiceLugar = jsonGuardado.indiceLugar;
        this.hacerBoss = jsonGuardado.hacerBoss;
        this.estado = jsonGuardado.estado;
        return this;
    }
    seCancela() {
        return !globalConfig.modulos.correrMazmorra;
    }
    equals(t) {
        return this.tipo_class == t.tipo_class;
    }
    getHomeClick() {
        return $('#submenu2 a.menuitem')[this.indiceLugar];
    }
}

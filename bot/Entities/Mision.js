class Mision {
    constructor(oro, honor, exp, esPorTiempo, tieneItem, seguidos, tipoM, textM, link, jqueryElement) {
        this.oro = oro;
        this.honor = honor;
        this.experiencia = exp;
        this.esPorTiempo = esPorTiempo;
        this.tieneItem = tieneItem;
        this.seNecesitaConsecutividad = seguidos;
        this.text = textM;
        this.tipo = tipoM;
        this.linkAccept = link;
        this.jqueryElement = jqueryElement;
    }
    calcularPuntaje() {
        let basicos = this.oro / 1000 + this.honor / 100 + this.experiencia;
        let otros = this.puntajeTiempo() + this.puntajeSeguidas() + this.puntajeTieneItem();
        return basicos + otros;
    }
    puntajeTiempo() {
        return (this.esPorTiempo) ? -2 : 0;
    }
    puntajeSeguidas() {
        return (this.seNecesitaConsecutividad) ? -5 : 0;
    }
    puntajeTieneItem() {
        return (this.tieneItem) ? 1 : 0;
    }
    //TODO revisar tiempo de expediciones
    esPosible() {
        if (this.tipo === 'Mazmorra' || this.tipo === 'Trabajo') {
            return false;
        }
        else if (this.tipo === 'Expedicion') {
            return this.analizarTextMision(globalConfig.expedicion) && globalConfig.modulos.correrExpedicion && this.daElTiempoParaHacerla();
        }
        else if (this.tipo === 'Arena') {
            return globalConfig.modulos.correrArena && this.daElTiempoParaHacerla();
        }
        else if (this.tipo === 'Turma') {
            return globalConfig.modulos.correrTurma && this.daElTiempoParaHacerla();
        }
        else {
            return true;
        }
    }
    aceptarButton() {
        return this.linkAccept;
    }
    //revisar nombre
    analizarTextMision(expedicion) {
        let indiceDosPuntos = this.text.indexOf(':');
        let lugarExpedicion = this.text.substring(0, indiceDosPuntos);
        let vencerBoss = this.text.toLowerCase().includes('jefe') && expedicion.enemigoNu === 3;
        return expedicion.lugar === lugarExpedicion && (this.text.toLowerCase().includes(expedicion.enemigo.toLocaleLowerCase()) ||
            this.text.toLowerCase().includes('cualesquiera') ||
            vencerBoss);
    }
    tieneNumero() {
        return this.text.split(" ").filter(e => typeof (e) === 'number').length !== 0;
    }
    getNumero() {
        return Number.parseInt(this.text.split(" ").filter(e => typeof (e) === 'number')[0]);
    }
    getTiempoMaximoParaHacerla() {
        let texto = $(this.jqueryElement).find('.quest_slot_time').text().trim();
        let relojMinutos = parseInt(texto.substring(3, 5));
        let relojHoras = parseInt(texto.substring(0, 2));
        return relojMinutos * 60 + relojHoras * 60 * 60;
    }
    //REVISAAAR
    getTiempoEstimadoParaHacerla() {
        if (this.tieneNumero()) {
            return this.getNumero() * Mision.tiemposEspera[this.tipo.toLowerCase()];
        }
    }
    //REVISAAAR
    getTiempoEstimadoParaHacerlaExpediciones() {
        let puntosDisponibles = parseInt($('#expeditionpoints_value_point').text());
        if (puntosDisponibles >= this.getNumero()) {
            return this.getNumero() * Mision.tiemposEspera[this.tipo.toLowerCase()];
        }
        else {
            return (this.getNumero() - puntosDisponibles) * Mision.tiemposRecarga[this.tipo.toLowerCase()] + puntosDisponibles * Mision.tiemposEspera[this.tipo.toLowerCase()];
        }
    }
    daElTiempoParaHacerla() {
        if (this.esPorTiempo && this.tipo !== tipoMisiones.EXPEDICION) {
            return this.getTiempoEstimadoParaHacerla() < this.getTiempoMaximoParaHacerla();
        }
        else if (this.esPorTiempo && this.tipo === tipoMisiones.EXPEDICION) {
            return this.getTiempoMaximoParaHacerla() < this.getTiempoEstimadoParaHacerlaExpediciones();
        }
        else {
            return true;
        }
    }
}
Mision.tiemposEspera = {
    expedicion: 150,
    mazmorra: 150,
    arena: 150,
    aurma: 150
};
Mision.tiemposRecarga = {
    expedicion: 1380,
    mazmorra: 1380
};

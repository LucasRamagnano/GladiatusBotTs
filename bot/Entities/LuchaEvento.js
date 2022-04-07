class LuchaEvento {
    constructor() {
        this.estado = tareaEstado.enEspera;
        this.prioridad = datosContext.prioridades.evento;
        this.tipo_class = 'LuchaEvento';
        this.timed_out_miliseconds = 5000;
    }
    changeEstado(newEstado) {
        this.estado = newEstado;
    }
    getEstado() {
        return this.estado;
    }
    getHomeClick() {
        return $('#banner_event_link')[0];
    }
    equals(t) {
        return this.tipo_class === t.tipo_class;
    }
    fromJsonString(guardado) {
        this.estado = guardado.estado;
        return this;
    }
    getProximoClick() {
        if (!this.estamosEnTuLugar()) {
            return Promise.resolve(this.getHomeClick());
        }
        else {
            this.estado = tareaEstado.finalizada;
            //
            return Promise.resolve($('.awesome-button.expedition_button:not(.disabled)')[1]);
        }
    }
    seCancela() {
        return LuchaEvento.estasEnCooldown();
    }
    estamosEnTuLugar() {
        return window.location.href.includes('serverQuest') || window.location.href.includes('wild_farm');
    }
    static estasEnCooldown() {
        return $('#ServerQuestTime span').length <= 1 ||
            $('#ServerQuestTime span')[1].textContent.includes(':') ||
            $('#ServerQuestTime span')[1].textContent.includes('-') ||
            $('#ServerQuestTime span')[0].textContent == '0';
    }
    puedeDesbloquearse() {
        return true;
    }
}

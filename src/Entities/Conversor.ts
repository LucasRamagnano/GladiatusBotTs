function toInputArray(elemento:JQuery<HTMLElement>): JQuery<HTMLInputElement> {
    return jQuery(<HTMLInputElement[]><any>elemento);
}

function toInput(elemento:HTMLElement): HTMLInputElement {
    return <HTMLInputElement>elemento
}
function aguardarElemento(seletor, callback) {
  const existente = document.querySelector(seletor);
  if (existente) {
    callback(existente);
    return;
  }

  const observer = new MutationObserver(() => {
    const el = document.querySelector(seletor);
    if (el) {
      observer.disconnect();
      callback(el);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

aguardarElemento("#inpdata", function (campo) {
  campo.addEventListener("change", function () {
    const valor = this.value;
    if (!valor) return;

    let dia;
    if (valor.includes("-")) {
      dia = parseInt(valor.split("-")[2], 10);
    } else if (valor.includes("/")) {
      dia = parseInt(valor.split("/")[0], 10);
    }

    if (isNaN(dia)) return;

    if (dia % 2 !== 0) {
      alert("A data informada possui dia ímpar. Selecione uma data com dia par.");
    }
  });
});o

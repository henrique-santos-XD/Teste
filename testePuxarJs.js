(function () {
  console.log("JS carregado com sucesso");

  const campoData = document.querySelector("#inpdata");
  console.log("Campo encontrado:", campoData);

  if (!campoData) {
    console.warn("Campo #inpdata não encontrado");
    return;
  }

  let ultimoValorValidado = "";

  function validarDataParImpar() {
    const valor = (campoData.value || "").trim();
    console.log("Validando valor:", valor);

    if (!valor) return;
    if (valor === ultimoValorValidado) return;

    let dia;

    // formato DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
      dia = parseInt(valor.split("/")[0], 10);
    }
    // formato YYYY-MM-DD
    else if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      dia = parseInt(valor.split("-")[2], 10);
    } else {
      console.warn("Formato de data não reconhecido:", valor);
      return;
    }

    ultimoValorValidado = valor;

    if (dia % 2 !== 0) {
      alert("A data informada possui dia ímpar. Selecione uma data com dia par.");
      campoData.value = "";
      ultimoValorValidado = "";
      campoData.dispatchEvent(new Event("input", { bubbles: true }));
      campoData.dispatchEvent(new Event("change", { bubbles: true }));
      campoData.focus();
    }
  }

  campoData.addEventListener("change", validarDataParImpar);
  campoData.addEventListener("blur", validarDataParImpar);
  campoData.addEventListener("input", function () {
    // valida somente quando a data estiver completa
    if ((campoData.value || "").trim().length === 10) {
      validarDataParImpar();
    }
  });

  console.log("Validação conectada com sucesso");
})();
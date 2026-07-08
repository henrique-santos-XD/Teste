(function () {
  const campoData = document.querySelector("#inpdata");
  if (!campoData) return;

  function validarDataParImpar() {
    const valor = campoData.value;
    if (!valor) return;

    // tenta extrair o dia da data
    let dia;

    // formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      dia = parseInt(valor.split("-")[2], 10);
    }
    // formato DD/MM/YYYY
    else if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
      dia = parseInt(valor.split("/")[0], 10);
    } else {
      return;
    }

    if (dia % 2 !== 0) {
      alert("A data informada é ímpar. Selecione uma data com dia par.");
      campoData.value = "";
      campoData.focus();
    }
  }

  campoData.addEventListener("change", validarDataParImpar);
})();
document.querySelector("#inpdata").addEventListener("change", function () {
  const valor = this.value;

  if (!valor) return;

  let dia;

  if (valor.includes("-")) {
    // formato YYYY-MM-DD (input type="date")
    dia = parseInt(valor.split("-")[2], 10);
  } else if (valor.includes("/")) {
    // formato DD/MM/YYYY (campo texto com máscara)
    dia = parseInt(valor.split("/")[0], 10);
  }

  if (isNaN(dia)) return;

  if (dia % 2 === 0) {
    // Dia par: deixa passar, não faz nada
  } else {
    // Dia ímpar: bloqueia com alerta
    alert("A data informada possui dia ímpar. Selecione uma data com dia par.");
  }
});
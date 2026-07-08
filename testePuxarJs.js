(function () {
  const SELETOR_CAMPO = "#inpdata";
  const INTERVALO_BUSCA_CAMPO = 500;
  const INTERVALO_MONITORAMENTO = 300;
  const TEMPO_MAXIMO_BUSCA = 15000;

  let campoData = null;
  let ultimoValorLido = null;
  let ultimoValorValidado = null;
  let monitoramentoAtivo = false;
  let bloqueandoExecucao = false;

  function log(...args) {
    console.log("[validacao-par-impar]", ...args);
  }

  function obterDiaDaData(valor) {
    if (!valor) return null;
    const v = String(valor).trim();

    // DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
      return parseInt(v.split("/")[0], 10);
    }

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      return parseInt(v.split("-")[2], 10);
    }

    return null;
  }

  function limparCampoComEventos(el) {
    if (!el) return;

    el.value = "";

    // dispara eventos para o Zeev perceber a limpeza
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));

    try {
      el.setAttribute("value", "");
    } catch (e) {}

    setTimeout(() => {
      try {
        el.focus();
      } catch (e) {}
    }, 50);
  }

  function validarValorAtual(origem = "desconhecida") {
    if (!campoData || bloqueandoExecucao) return;

    const valor = (campoData.value || "").trim();

    if (!valor) {
      ultimoValorLido = "";
      ultimoValorValidado = "";
      return;
    }

    if (valor === ultimoValorValidado) return;

    const dia = obterDiaDaData(valor);
    if (dia == null) {
      log(`Formato ainda inválido ou incompleto (${origem}):`, valor);
      ultimoValorLido = valor;
      return;
    }

    log(`Validando (${origem}) ->`, valor, "| dia =", dia);

    ultimoValorLido = valor;
    ultimoValorValidado = valor;

    if (dia % 2 !== 0) {
      bloqueandoExecucao = true;

      alert("A data informada possui dia ímpar. Selecione uma data com dia par.");

      limparCampoComEventos(campoData);

      ultimoValorLido = "";
      ultimoValorValidado = "";

      setTimeout(() => {
        bloqueandoExecucao = false;
      }, 200);
    }
  }

  function conectarEventosNoCampo(el) {
    if (!el || el.dataset.validacaoParImparConectada === "S") return;

    el.addEventListener("input", () => {
      const valor = (el.value || "").trim();
      ultimoValorLido = valor;

      if (valor.length >= 10) {
        validarValorAtual("input");
      }
    });

    el.addEventListener("change", () => {
      validarValorAtual("change");
    });

    el.addEventListener("blur", () => {
      validarValorAtual("blur");
    });

    el.dataset.validacaoParImparConectada = "S";
    log("Eventos conectados ao campo");
  }

  function iniciarMonitoramentoDeValor() {
    if (monitoramentoAtivo) return;
    monitoramentoAtivo = true;

    setInterval(() => {
      if (!campoData || bloqueandoExecucao) return;

      if (!document.body.contains(campoData)) {
        log("Campo foi recriado/removido. Tentando localizar novamente...");
        campoData = document.querySelector(SELETOR_CAMPO);

        if (campoData) {
          log("Campo reencontrado após recriação");
          conectarEventosNoCampo(campoData);
        }
        return;
      }

      const valorAtual = (campoData.value || "").trim();

      if (valorAtual !== ultimoValorLido) {
        log("Mudança silenciosa detectada:", valorAtual);
        ultimoValorLido = valorAtual;

        if (valorAtual.length >= 10) {
          validarValorAtual("monitoramento");
        }
      }
    }, INTERVALO_MONITORAMENTO);
  }

  function iniciarBuscaDoCampo() {
    const inicio = Date.now();

    const timerBusca = setInterval(() => {
      const encontrado = document.querySelector(SELETOR_CAMPO);

      if (encontrado) {
        campoData = encontrado;
        log("Campo encontrado:", campoData);

        conectarEventosNoCampo(campoData);
        iniciarMonitoramentoDeValor();

        clearInterval(timerBusca);
        return;
      }

      if (Date.now() - inicio > TEMPO_MAXIMO_BUSCA) {
        clearInterval(timerBusca);
        log(`Campo ${SELETOR_CAMPO} não encontrado após ${TEMPO_MAXIMO_BUSCA}ms`);
      }
    }, INTERVALO_BUSCA_CAMPO);
  }

  function iniciarQuandoDOMCarregar() {
    log("Aguardando DOM carregar...");

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        log("DOM carregado com sucesso");
        iniciarBuscaDoCampo();
      });
    } else {
      log("DOM já estava carregado");
      iniciarBuscaDoCampo();
    }
  }

  iniciarQuandoDOMCarregar();
})();
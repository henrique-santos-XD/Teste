(function () {
  const CONFIG = {
    seletorCampo: "#inpdata",
    intervaloBuscaCampo: 400,
    intervaloMonitoramento: 250,
    tempoMaximoBusca: 20000,
    debug: true
  };

  let campo = null;
  let ultimoValor = null;
  let ultimoValorValidado = null;
  let bloqueado = false;
  let observer = null;
  let monitor = null;

  function log(...args) {
    if (CONFIG.debug) {
      console.log("[PAR/IMPAR DATA]", ...args);
    }
  }

  function parseDia(valor) {
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

  function limparCampo(el) {
    if (!el) return;

    el.value = "";
    try { el.setAttribute("value", ""); } catch (e) {}

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));

    setTimeout(() => {
      try { el.focus(); } catch (e) {}
    }, 50);
  }

  function validar(origem) {
    if (!campo || bloqueado) return;

    const valor = (campo.value || "").trim();
    log("validar()", { origem, valor });

    if (!valor) {
      ultimoValor = "";
      ultimoValorValidado = "";
      return;
    }

    // evita repetir no mesmo valor
    if (valor === ultimoValorValidado) {
      return;
    }

    const dia = parseDia(valor);
    if (dia == null) {
      log("Formato ainda incompleto/não reconhecido:", valor);
      ultimoValor = valor;
      return;
    }

    ultimoValor = valor;
    ultimoValorValidado = valor;

    if (dia % 2 !== 0) {
      bloqueado = true;

      alert("A data informada possui dia ímpar. Selecione uma data com dia par.");

      limparCampo(campo);

      ultimoValor = "";
      ultimoValorValidado = "";

      setTimeout(() => {
        bloqueado = false;
      }, 300);
    } else {
      log("Data válida (dia par):", valor);
    }
  }

  function conectarEventos(el) {
    if (!el) return;
    if (el.dataset.parImparConectado === "S") return;

    log("Conectando eventos no campo", el);

    el.addEventListener("input", () => {
      log("Evento input:", el.value);
      ultimoValor = el.value;
      if ((el.value || "").trim().length >= 10) {
        validar("input");
      }
    });

    el.addEventListener("change", () => {
      log("Evento change:", el.value);
      validar("change");
    });

    el.addEventListener("blur", () => {
      log("Evento blur:", el.value);
      validar("blur");
    });

    // útil quando o usuário seleciona no calendário e clica em outro lugar
    document.addEventListener("click", () => {
      if (campo && campo.value) {
        validar("document-click");
      }
    });

    el.dataset.parImparConectado = "S";
  }

  function observarAtributos(el) {
    if (!el) return;
    if (observer) observer.disconnect();

    observer = new MutationObserver(() => {
      if (!campo || bloqueado) return;

      const valorAtual = (campo.value || "").trim();
      if (valorAtual && valorAtual !== ultimoValor) {
        log("MutationObserver detectou mudança:", valorAtual);
        ultimoValor = valorAtual;
        validar("mutation");
      }
    });

    observer.observe(el, {
      attributes: true,
      attributeFilter: ["value"]
    });

    log("MutationObserver conectado");
  }

  function iniciarMonitoramento(el) {
    if (monitor) clearInterval(monitor);

    monitor = setInterval(() => {
      if (!campo || bloqueado) return;

      // se o Zeev recriar o campo, reconecta
      if (!document.body.contains(campo)) {
        log("Campo saiu do DOM. Tentando localizar novamente...");
        localizarCampo();
        return;
      }

      const valorAtual = (campo.value || "").trim();

      if (valorAtual !== ultimoValor) {
        log("Monitor detectou mudança silenciosa:", valorAtual);
        ultimoValor = valorAtual;

        if (valorAtual.length >= 10) {
          validar("monitor");
        }
      }
    }, CONFIG.intervaloMonitoramento);

    log("Monitoramento iniciado");
  }

  function prepararCampo(el) {
    campo = el;
    log("Campo encontrado:", campo);

    conectarEventos(campo);
    observarAtributos(campo);
    iniciarMonitoramento(campo);

    // valida valor já preenchido, caso o Zeev traga algo pronto
    setTimeout(() => validar("valor-inicial"), 300);
    setTimeout(() => validar("valor-inicial-2"), 1000);
  }

  function localizarCampo() {
    const el = document.querySelector(CONFIG.seletorCampo);
    if (el) {
      prepararCampo(el);
      return true;
    }
    return false;
  }

  function aguardarCampo() {
    const inicio = Date.now();

    const timer = setInterval(() => {
      if (localizarCampo()) {
        clearInterval(timer);
        return;
      }

      if (Date.now() - inicio > CONFIG.tempoMaximoBusca) {
        clearInterval(timer);
        log("Campo não encontrado no tempo limite:", CONFIG.seletorCampo);
      }
    }, CONFIG.intervaloBuscaCampo);
  }

  function init() {
    log("Script iniciado");

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        log("DOM carregado");
        aguardarCampo();
      });
    } else {
      log("DOM já carregado");
      aguardarCampo();
    }
  }

  init();
})();
const API = "https://script.google.com/macros/s/AKfycbzGS_1qPHENhrzndQy5mysQjVGrJwd7Mmy5sUJW6-1G4DXe99KzklBBEJYIWrYAnm2-/exec";

const listaDiv = document.getElementById("lista");
const filtroMes = document.getElementById("filtroMes");
const filtroAno = document.getElementById("filtroAno");

/* ================= MENSAGENS WHATS ================= */
function gerarMsg(nome, servico, hora, tipo) {
  const cliente = nome || "cliente";
  const serv = servico || "serviço";
  const h = hora || "--:--";

  if (tipo === "1D") {
    return `Olá ${cliente}, tudo bem?
Só passando para lembrar que você tem um horário marcado amanhã às ${h}.
Te espero!`;
  }

  if (tipo === "1H") {
    return `Olá ${cliente}, tudo bem?
Seu horário é daqui a 1 hora, às ${h}.
Te espero!`;
  }

  if (tipo === "CONFIRMAR") {
    return `Olá ${cliente}, tudo bem?
Seu horário para ${serv} às ${h} está confirmado.
Te espero!`;
  }

  if (tipo === "CANCELAR") {
    return `Olá ${cliente}, tudo bem?
Seu horário das ${h} foi cancelado.
Podemos reagendar?`;
  }
}

function abrirWhats(tel, msg) {
  if (!tel) {
    alert("Telefone não informado");
    return;
  }
  const numero = tel.replace(/\D/g, "");
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`);
}

/* ================= DATA ================= */
function formatarData(dataStr) {
  const data = new Date(dataStr + "T00:00:00");
  const dias = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();

  return `${dias[data.getDay()]} – ${dia}/${mes}/${ano}`;
}

/* ================= CARD ================= */
function criarCard(c) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <p><strong>Cliente:</strong> ${c.nome || "Não informado"}</p>
    <p><strong>Serviço:</strong> ${c.servico || "—"}</p>
    <p><strong>Horário:</strong> ${c.hora || "--:--"}</p>

    <div class="botoes">
      <button class="btn-1d"
        onclick="abrirWhats('${c.telefone}', gerarMsg('${c.nome}','${c.servico}','${c.hora}','1D'))">
        Lembrete 1D
      </button>

      <button class="btn-1h"
        onclick="abrirWhats('${c.telefone}', gerarMsg('${c.nome}','${c.servico}','${c.hora}','1H'))">
        Lembrete 1H
      </button>

      <button class="btn-confirmar"
        onclick="abrirWhats('${c.telefone}', gerarMsg('${c.nome}','${c.servico}','${c.hora}','CONFIRMAR'))">
        Confirmar
      </button>

      <button class="btn-cancelar"
        onclick="abrirWhats('${c.telefone}', gerarMsg('${c.nome}','${c.servico}','${c.hora}','CANCELAR'))">
        Cancelar
      </button>
    </div>
  `;

  return card;
}

/* ================= CARREGAR AGENDA ================= */
function carregarAgenda() {
  fetch(API)
    .then(res => res.json())
    .then(dados => {
      listaDiv.innerHTML = "";

      if (!dados || dados.length === 0) {
        listaDiv.innerHTML = "<p style='text-align:center'>Não há agendamentos.</p>";
        return;
      }

      const grupos = {};
      const hojeStr = new Date().toISOString().split("T")[0];

      dados.forEach(c => {
        if (!c.data) return;

        const dataObj = new Date(c.data + "T00:00:00");
        const diaSemana = dataObj.getDay();

        if (diaSemana === 0 || diaSemana === 6) return;

        const ano = dataObj.getFullYear();
        const mes = dataObj.getMonth();

        if (filtroAno.value && Number(filtroAno.value) !== ano) return;
        if (filtroMes.value !== "" && Number(filtroMes.value) !== mes) return;

        if (!grupos[c.data]) grupos[c.data] = [];
        grupos[c.data].push(c);
      });

      if (Object.keys(grupos).length === 0) {
        listaDiv.innerHTML = "<p style='text-align:center'>Nenhum agendamento encontrado.</p>";
        return;
      }

      const semanaDiv = document.createElement("div");
      semanaDiv.className = "semana";

      Object.keys(grupos).sort().forEach(data => {
        const diaDiv = document.createElement("div");
        diaDiv.className = "dia";

        if (data === hojeStr) diaDiv.classList.add("hoje");

        const h3 = document.createElement("h3");
        h3.textContent = formatarData(data);
        diaDiv.appendChild(h3);

        grupos[data].sort((a, b) => a.hora.localeCompare(b.hora));
        grupos[data].forEach(c => diaDiv.appendChild(criarCard(c)));

        semanaDiv.appendChild(diaDiv);
      });

      listaDiv.appendChild(semanaDiv);
    })
    .catch(err => {
      console.error(err);
      listaDiv.innerHTML = "<p>Erro ao carregar agenda.</p>";
    });
}

/* ================= INPUT DATA TEXTO ================= */
function formatarDataInput(input) {
  let valor = input.value.replace(/\D/g, "");
  if (valor.length > 2) valor = valor.slice(0, 2) + "/" + valor.slice(2);
  if (valor.length > 5) valor = valor.slice(0, 5) + "/" + valor.slice(5, 9);
  input.value = valor;
}

filtroMes.addEventListener("change", carregarAgenda);
filtroAno.addEventListener("change", carregarAgenda);
window.onload = carregarAgenda;

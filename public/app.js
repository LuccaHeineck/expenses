async function checkAuth() {
  try {
    const res = await fetch("/api/me", { credentials: "same-origin" });
    if (!res.ok) {
      sessionStorage.removeItem("user");
      window.location.href = "/login";
      return null;
    }
    const u = await res.json();
    sessionStorage.setItem("user", JSON.stringify(u));
    return u;
  } catch (err) {
    sessionStorage.removeItem("user");
    window.location.href = "/login";
    return null;
  }
}

async function fetchLancamentos() {
  const res = await fetch("/api/lancamentos", { credentials: "same-origin" });
  if (!res.ok) {
    if (res.status === 401) {
      sessionStorage.removeItem("user");
      window.location.href = "/login";
      return [];
    }
    throw new Error("Erro ao buscar");
  }
  return res.json();
}

let currentItems = [];
let editingId = null;
const notificationEmailKey = "notificationEmail";

function getNotificationEmail() {
  return (localStorage.getItem(notificationEmailKey) || "").trim();
}

function toInputDate(dateValue) {
  if (!dateValue) return "";
  return String(dateValue).slice(0, 10);
}

function findItemById(id) {
  return currentItems.find((it) => String(it.id) === String(id));
}

async function saveInlineEdit(id, row) {
  const body = {
    descricao: row.querySelector('input[name="descricao"]').value,
    data_lancamento: row.querySelector('input[name="data_lancamento"]').value,
    valor: parseFloat(row.querySelector('input[name="valor"]').value),
    tipo_lancamento: row.querySelector('select[name="tipo_lancamento"]').value,
    situacao: row.querySelector('select[name="situacao"]').value,
    email: getNotificationEmail(),
  };

  const res = await fetch("/api/lancamentos/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Erro ao atualizar lançamento");
  }
}

function renderTable(items) {
  const tbody = document.querySelector("#table tbody");
  tbody.innerHTML = "";
  for (const it of items) {
    const tr = document.createElement("tr");
    if (editingId === it.id) {
      tr.innerHTML = `
        <td data-label="ID">${it.id}</td>
        <td data-label="Descrição"><input name="descricao" value="${it.descricao}" /></td>
        <td data-label="Data"><input name="data_lancamento" type="date" value="${toInputDate(it.data_lancamento)}" /></td>
        <td data-label="Valor"><input name="valor" type="number" step="0.01" value="${it.valor}" /></td>
        <td data-label="Tipo">
          <select name="tipo_lancamento">
            <option value="RECEITA" ${it.tipo_lancamento === "RECEITA" ? "selected" : ""}>RECEITA</option>
            <option value="DESPESA" ${it.tipo_lancamento === "DESPESA" ? "selected" : ""}>DESPESA</option>
          </select>
        </td>
        <td data-label="Situação">
          <select name="situacao">
            <option value="PAGO" ${it.situacao === "PAGO" ? "selected" : ""}>PAGO</option>
            <option value="PENDENTE" ${it.situacao === "PENDENTE" ? "selected" : ""}>PENDENTE</option>
          </select>
        </td>
        <td data-label="Ações">
          <button data-id="${it.id}" class="save">Salvar</button>
          <button data-id="${it.id}" class="cancel">Cancelar</button>
        </td>
      `;
    } else {
      tr.innerHTML = `
        <td data-label="ID">${it.id}</td>
        <td data-label="Descrição">${it.descricao}</td>
        <td data-label="Data">${it.data_lancamento}</td>
        <td data-label="Valor">${it.valor}</td>
        <td data-label="Tipo">${it.tipo_lancamento}</td>
        <td data-label="Situação">${it.situacao}</td>
        <td data-label="Ações">
          <button data-id="${it.id}" class="edit">Editar</button>
          <button data-id="${it.id}" class="del">Excluir</button>
        </td>
      `;
    }
    tbody.appendChild(tr);
  }
}

async function initApp() {
  const user = await checkAuth();
  if (!user) return;
  document.getElementById("user").textContent = `Usuário: ${user.nome}`;

  document.getElementById("logout").addEventListener("click", async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch (err) {}
    sessionStorage.removeItem("user");
    window.location.href = "/login";
  });

  document.getElementById("export-pdf").addEventListener("click", async () => {
    const button = document.getElementById("export-pdf");
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = "Gerando PDF...";

    try {
      const res = await fetch("/api/lancamentos/export/pdf", {
        credentials: "same-origin",
      });

      if (!res.ok) {
        throw new Error("Erro ao exportar PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "lancamentos.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      alert("Não foi possível gerar o PDF.");
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  });

  const form = document.getElementById("form");
  const emailInput = form.querySelector('input[name="email"]');
  const savedEmail = localStorage.getItem(notificationEmailKey);
  if (savedEmail) {
    emailInput.value = savedEmail;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get("email") || "").trim();
    localStorage.setItem(notificationEmailKey, email);
    const body = {
      descricao: fd.get("descricao"),
      data_lancamento: fd.get("data_lancamento"),
      valor: parseFloat(fd.get("valor")),
      email,
      tipo_lancamento: fd.get("tipo_lancamento"),
      situacao: fd.get("situacao"),
    };
    await fetch("/api/lancamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "same-origin",
    });
    form.reset();
    emailInput.value = email;
    await loadAndRender();
  });

  document
    .querySelector("#table tbody")
    .addEventListener("click", async (e) => {
      const target = e.target;
      if (target.classList.contains("edit")) {
        const id = target.dataset.id;
        const item = findItemById(id);
        if (!item) return;
        editingId = item.id;
        renderTable(currentItems);
        return;
      }

      if (target.classList.contains("cancel")) {
        editingId = null;
        renderTable(currentItems);
        return;
      }

      if (target.classList.contains("save")) {
        const id = target.dataset.id;
        const row = target.closest("tr");
        try {
          await saveInlineEdit(id, row);
          editingId = null;
          await loadAndRender();
        } catch (err) {
          alert("Não foi possível salvar a edição.");
        }
        return;
      }

      if (target.classList.contains("del")) {
        const id = target.dataset.id;
        await fetch("/api/lancamentos/" + id, {
          method: "DELETE",
          credentials: "same-origin",
        });
        await loadAndRender();
      }
    });

  await loadAndRender();
}

async function loadAndRender() {
  currentItems = await fetchLancamentos();
  renderTable(currentItems);
}

if (location.pathname === "/app") {
  initApp();
}

async function checkAuth() {
  const user = sessionStorage.getItem("user");
  if (user) return JSON.parse(user);

  // try to validate session with server via cookie
  try {
    const res = await fetch("/api/me", { credentials: "same-origin" });
    if (!res.ok) {
      window.location.href = "/login";
      return null;
    }
    const u = await res.json();
    sessionStorage.setItem("user", JSON.stringify(u));
    return u;
  } catch (err) {
    window.location.href = "/login";
    return null;
  }
}

async function fetchLancamentos() {
  const res = await fetch("/api/lancamentos", { credentials: "same-origin" });
  if (!res.ok) throw new Error("Erro ao buscar");
  return res.json();
}

function renderTable(items) {
  const tbody = document.querySelector("#table tbody");
  tbody.innerHTML = "";
  for (const it of items) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${it.id}</td>
      <td>${it.descricao}</td>
      <td>${it.data_lancamento}</td>
      <td>${it.valor}</td>
      <td>${it.tipo_lancamento}</td>
      <td>${it.situacao}</td>
      <td>
        <button data-id="${it.id}" class="del">Excluir</button>
      </td>
    `;
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

  const form = document.getElementById("form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const body = {
      descricao: fd.get("descricao"),
      data_lancamento: fd.get("data_lancamento"),
      valor: parseFloat(fd.get("valor")),
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
    await loadAndRender();
  });

  document
    .querySelector("#table tbody")
    .addEventListener("click", async (e) => {
      const target = e.target;
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
  const items = await fetchLancamentos();
  renderTable(items);
}

if (location.pathname === "/app") {
  initApp();
}

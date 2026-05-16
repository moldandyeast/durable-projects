import { layoutPage } from "./shared";

const ADMIN_FONT_HEAD = `<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap" rel="stylesheet"/>`;

/** Authoring shell — `/admin/api/*`. Swiss minimal UI; Editor / Collaborators / Clients as separate views. */
export function adminTemplate(): string {
  const inner = `
<div class="admin-shell">
  <header class="admin-header">
    <div class="admin-header__row">
      <span class="admin-wordmark">Studio</span>
      <a href="/" class="admin-header__exit">Public site</a>
    </div>
    <nav class="admin-nav" aria-label="Admin sections">
      <button type="button" class="admin-nav__btn is-active" data-view="editor">Editor</button>
      <button type="button" class="admin-nav__btn" data-view="collaborators">Collaborators</button>
      <button type="button" class="admin-nav__btn" data-view="clients">Clients</button>
    </nav>
  </header>

  <main class="admin-main">
    <section id="view-editor" class="admin-view" aria-labelledby="editor-heading">
      <h1 id="editor-heading" class="admin-view-title">Project editor</h1>
      <section class="admin-panel">
        <label class="admin-label" for="proj-select">Project</label>
        <select id="proj-select"><option value="">— New —</option></select>
        <form id="proj-form" class="admin-grid">
          <div>
            <label class="admin-label" for="pf-title">Title</label>
            <input id="pf-title" name="title" placeholder="" required />
          </div>
          <div>
            <label class="admin-label" for="pf-summary">Summary</label>
            <input id="pf-summary" name="summary" placeholder="" />
          </div>
          <div>
            <label class="admin-label" for="pf-tags">Tags</label>
            <input id="pf-tags" name="tags" placeholder="Comma-separated" />
          </div>
          <div>
            <label class="admin-label" for="pf-client">Client</label>
            <select id="pf-client" name="client_id"><option value="">— None —</option></select>
          </div>
          <div>
            <label class="admin-label" for="pf-sort">Sort date</label>
            <input id="pf-sort" name="sort_date" placeholder="YYYY-MM-DD" />
          </div>
          <div>
            <label class="admin-label" for="pf-preview">Preview image URL</label>
            <input id="pf-preview" name="preview_image" placeholder="" />
          </div>
          <div>
            <label class="admin-label" for="pf-team-ids">Collaborator IDs</label>
            <input id="pf-team-ids" name="team_member_ids" placeholder="Slug ids, comma-separated" />
          </div>
          <div>
            <label class="admin-label" for="pf-gallery">Gallery JSON</label>
            <textarea id="pf-gallery" name="gallery_json" rows="4" placeholder='[{"url":"","caption":"","alt":""}]'></textarea>
          </div>
          <div>
            <label class="admin-label" for="pf-body">Body · Markdown</label>
            <textarea id="pf-body" name="body" rows="16" placeholder="#"></textarea>
          </div>
          <div class="admin-actions">
            <button type="submit" id="btn-save">Save</button>
            <button type="button" id="btn-new">New</button>
            <button type="button" id="btn-del">Archive</button>
          </div>
        </form>
      </section>
    </section>

    <section id="view-collaborators" class="admin-view" aria-labelledby="collab-heading" hidden>
      <h1 id="collab-heading" class="admin-view-title">Collaborators</h1>
      <section class="admin-panel">
        <h2>Directory</h2>
        <ul id="team-list" class="admin-list"></ul>
        <h2>Add collaborator</h2>
        <form id="team-form" class="admin-grid">
          <div>
            <label class="admin-label" for="tf-name">Name</label>
            <input id="tf-name" name="name" placeholder="" required />
          </div>
          <div>
            <label class="admin-label" for="tf-role">Role</label>
            <input id="tf-role" name="role" placeholder="Optional" />
          </div>
          <div>
            <label class="admin-label" for="tf-url">URL</label>
            <input id="tf-url" name="url" placeholder="Optional" />
          </div>
          <div><button type="submit">Add</button></div>
        </form>
      </section>
    </section>

    <section id="view-clients" class="admin-view" aria-labelledby="clients-heading" hidden>
      <h1 id="clients-heading" class="admin-view-title">Clients</h1>
      <section class="admin-panel">
        <h2>Directory</h2>
        <ul id="clients-list" class="admin-list"></ul>
        <h2>Add client</h2>
        <form id="client-form" class="admin-grid">
          <div>
            <label class="admin-label" for="cf-name">Name</label>
            <input id="cf-name" name="name" placeholder="" required />
          </div>
          <div>
            <label class="admin-label" for="cf-url">URL</label>
            <input id="cf-url" name="url" placeholder="Optional" />
          </div>
          <div><button type="submit">Add</button></div>
        </form>
      </section>
    </section>
  </main>
</div>

  <script>
    async function j(url, opt) {
      const r = await fetch(url, Object.assign({ headers: { "Content-Type": "application/json" } }, opt || {}));
      return r;
    }

    function showView(name) {
      var ids = { editor: "view-editor", collaborators: "view-collaborators", clients: "view-clients" };
      var navBtns = document.querySelectorAll(".admin-nav__btn");
      Object.keys(ids).forEach(function(key) {
        var el = document.getElementById(ids[key]);
        if (el) el.hidden = key !== name;
      });
      navBtns.forEach(function(btn) {
        var v = btn.getAttribute("data-view");
        var on = v === name;
        btn.classList.toggle("is-active", on);
        if (on) btn.setAttribute("aria-current", "page");
        else btn.removeAttribute("aria-current");
      });
      try {
        history.replaceState(null, "", "#" + name);
      } catch (e) {}
    }

    function viewFromHash() {
      var h = (location.hash || "#editor").replace(/^#/, "");
      if (h === "collaborators" || h === "clients" || h === "editor") return h;
      return "editor";
    }

    function bindNav() {
      document.querySelectorAll(".admin-nav__btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
          showView(btn.getAttribute("data-view"));
        });
      });
      window.addEventListener("hashchange", function() {
        showView(viewFromHash());
      });
      showView(viewFromHash());
    }

    function fillTeamList(members) {
      var ul = document.getElementById("team-list");
      ul.textContent = "";
      if (!members.length) {
        var empty = document.createElement("li");
        empty.className = "admin-list__empty";
        empty.textContent = "No collaborators yet.";
        ul.appendChild(empty);
        return;
      }
      members.forEach(function(m) {
        var li = document.createElement("li");
        var line = document.createElement("span");
        line.textContent = m.name + (m.role ? " — " + m.role : "");
        var meta = document.createElement("span");
        meta.className = "admin-list__meta";
        meta.textContent = m.id;
        li.appendChild(line);
        li.appendChild(meta);
        ul.appendChild(li);
      });
    }

    function fillClientsList(clients) {
      var ul = document.getElementById("clients-list");
      ul.textContent = "";
      if (!clients.length) {
        var empty = document.createElement("li");
        empty.className = "admin-list__empty";
        empty.textContent = "No clients yet.";
        ul.appendChild(empty);
        return;
      }
      clients.forEach(function(c) {
        var li = document.createElement("li");
        var line = document.createElement("span");
        line.textContent = c.name;
        var meta = document.createElement("span");
        meta.className = "admin-list__meta";
        meta.textContent = c.id;
        li.appendChild(line);
        li.appendChild(meta);
        ul.appendChild(li);
      });
    }

    async function loadLists() {
      const [tm, cl, pr] = await Promise.all([
        j("/admin/api/team/members"),
        j("/admin/api/clients"),
        j("/admin/api/projects"),
      ]);
      const team = await tm.json();
      const clients = await cl.json();
      const projects = await pr.json();

      fillTeamList(team.members || []);
      fillClientsList(clients.clients || []);

      var sel = document.getElementById("proj-select");
      while (sel.options.length > 1) sel.remove(1);
      (projects.projects || []).forEach(function(p) {
        var o = document.createElement("option");
        o.value = p.id;
        o.textContent = p.title + " · " + p.id;
        sel.appendChild(o);
      });

      var csel = document.getElementById("pf-client");
      while (csel.options.length > 1) csel.remove(1);
      (clients.clients || []).forEach(function(c) {
        var o = document.createElement("option");
        o.value = c.id;
        o.textContent = c.name + " · " + c.id;
        csel.appendChild(o);
      });
    }

    function parseGallery(txt) {
      try {
        var x = JSON.parse(txt || "[]");
        return Array.isArray(x) ? x : [];
      } catch (e) {
        return [];
      }
    }

    async function loadProject(id) {
      if (!id) {
        document.getElementById("proj-form").reset();
        document.getElementById("pf-client").value = "";
        return;
      }
      var r = await j("/admin/api/projects/" + id);
      var p = await r.json();
      var f = document.getElementById("proj-form");
      f.title.value = p.title || "";
      f.summary.value = p.summary || "";
      f.tags.value = (p.tags || []).join(", ");
      f.client_id.value = p.client_id || "";
      f.sort_date.value = p.sort_date || "";
      f.preview_image.value = p.preview_image || "";
      f.team_member_ids.value = (p.team_member_ids || []).join(", ");
      f.gallery_json.value = JSON.stringify(p.gallery_images || [], null, 2);
      f.body.value = p.body || "";
    }

    bindNav();

    document.getElementById("proj-select").addEventListener("change", function() {
      loadProject(this.value);
    });

    document.getElementById("team-form").addEventListener("submit", async function(ev) {
      ev.preventDefault();
      var f = ev.target;
      await j("/admin/api/team/members", {
        method: "POST",
        body: JSON.stringify({ name: f.name.value, role: f.role.value || undefined, url: f.url.value || undefined }),
      });
      f.reset();
      await loadLists();
    });

    document.getElementById("client-form").addEventListener("submit", async function(ev) {
      ev.preventDefault();
      var f = ev.target;
      await j("/admin/api/clients", {
        method: "POST",
        body: JSON.stringify({ name: f.name.value, url: f.url.value || undefined }),
      });
      f.reset();
      await loadLists();
    });

    document.getElementById("proj-form").addEventListener("submit", async function(ev) {
      ev.preventDefault();
      var f = ev.target;
      var id = document.getElementById("proj-select").value;
      var tags = f.tags.value.split(",").map(function(s) { return s.trim(); }).filter(Boolean);
      var teamIds = f.team_member_ids.value.split(",").map(function(s) { return s.trim(); }).filter(Boolean);
      var payload = {
        title: f.title.value,
        summary: f.summary.value,
        tags: tags,
        client_id: f.client_id.value || undefined,
        sort_date: f.sort_date.value || undefined,
        preview_image: f.preview_image.value || undefined,
        team_member_ids: teamIds,
        gallery_images: parseGallery(f.gallery_json.value),
        body: f.body.value,
      };
      if (id) {
        await j("/admin/api/projects/" + id, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await j("/admin/api/projects", { method: "POST", body: JSON.stringify(payload) });
      }
      await loadLists();
    });

    document.getElementById("btn-new").addEventListener("click", function() {
      document.getElementById("proj-select").value = "";
      loadProject("");
    });

    document.getElementById("btn-del").addEventListener("click", async function() {
      var id = document.getElementById("proj-select").value;
      if (!id || !confirm("Archive this project?")) return;
      await j("/admin/api/projects/" + id, { method: "DELETE" });
      document.getElementById("proj-select").value = "";
      await loadLists();
      loadProject("");
    });

    loadLists();
  </script>`;

  return layoutPage("Admin", inner, { bodyClass: "admin-app", extraHead: ADMIN_FONT_HEAD });
}

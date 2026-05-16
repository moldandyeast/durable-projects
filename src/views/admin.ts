import { layoutPage } from "./shared";

/** Minimal authoring shell — loads data via `/admin/api/*`. */
export function adminTemplate(): string {
  const inner = `
<main style="max-width:56rem;margin:0 auto;padding:1rem 1rem 3rem">
  <h1 style="margin-top:0">Projects admin</h1>
  <p class="muted"><a href="/">← Public site</a></p>

  <section style="margin:2rem 0;padding:1rem;border:1px solid var(--border);border-radius:8px;background:var(--card)">
    <h2 style="margin-top:0">Team members</h2>
    <div id="team-list" class="muted">Loading…</div>
    <form id="team-form" style="margin-top:1rem;display:grid;gap:0.5rem;max-width:28rem">
      <input name="name" placeholder="Name" required />
      <input name="role" placeholder="Role (optional)" />
      <input name="url" placeholder="URL (optional)" />
      <button type="submit">Add member</button>
    </form>
  </section>

  <section style="margin:2rem 0;padding:1rem;border:1px solid var(--border);border-radius:8px;background:var(--card)">
    <h2 style="margin-top:0">Clients</h2>
    <div id="clients-list" class="muted">Loading…</div>
    <form id="client-form" style="margin-top:1rem;display:grid;gap:0.5rem;max-width:28rem">
      <input name="name" placeholder="Name (e.g. IDEO)" required />
      <input name="url" placeholder="Client URL (optional)" />
      <button type="submit">Add client</button>
    </form>
  </section>

  <section style="margin:2rem 0;padding:1rem;border:1px solid var(--border);border-radius:8px;background:var(--card)">
    <h2 style="margin-top:0">Projects</h2>
    <label>Pick project <select id="proj-select"><option value="">— New —</option></select></label>
    <form id="proj-form" style="margin-top:1rem;display:grid;gap:0.6rem">
      <input name="title" placeholder="Title" required />
      <input name="summary" placeholder="Summary" />
      <input name="tags" placeholder="Tags (comma-separated)" />
      <label>Client <select name="client_id"><option value="">— None —</option></select></label>
      <input name="sort_date" placeholder="sort_date ISO (e.g. 2024-03-15)" />
      <input name="preview_image" placeholder="Preview image URL" />
      <label>Team member IDs (comma-separated slugs)</label>
      <input name="team_member_ids" placeholder="aaaaaaaa, bbbbbbbb" />
      <label>Gallery JSON array: [{"url":"…","caption":"","alt":""}]</label>
      <textarea name="gallery_json" rows="3" placeholder='[]'></textarea>
      <label>Body (markdown)</label>
      <textarea name="body" rows="14" placeholder="# Hello"></textarea>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
        <button type="submit" id="btn-save">Save</button>
        <button type="button" id="btn-new">New</button>
        <button type="button" id="btn-del" style="color:#b91c1c">Soft-delete</button>
      </div>
    </form>
  </section>

  <script>
    async function j(url, opt) {
      const r = await fetch(url, Object.assign({ headers: { "Content-Type": "application/json" } }, opt || {}));
      return r;
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

      document.getElementById("team-list").textContent = team.members.map(function(m) {
        return m.id + " · " + m.name + (m.role ? " (" + m.role + ")" : "");
      }).join("\\n") || "(none)";

      document.getElementById("clients-list").textContent = clients.clients.map(function(c) {
        return c.id + " · " + c.name;
      }).join("\\n") || "(none)";

      var sel = document.getElementById("proj-select");
      while (sel.options.length > 1) sel.remove(1);
      projects.projects.forEach(function(p) {
        var o = document.createElement("option");
        o.value = p.id;
        o.textContent = p.title + " (" + p.id + ")";
        sel.appendChild(o);
      });

      var csel = document.querySelector("[name=client_id]");
      while (csel.options.length > 1) csel.remove(1);
      clients.clients.forEach(function(c) {
        var o = document.createElement("option");
        o.value = c.id;
        o.textContent = c.name + " (" + c.id + ")";
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
        document.querySelector("[name=client_id]").value = "";
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
      if (!id || !confirm("Soft-delete this project?")) return;
      await j("/admin/api/projects/" + id, { method: "DELETE" });
      document.getElementById("proj-select").value = "";
      await loadLists();
      loadProject("");
    });

    loadLists();
  </script>
</main>`;

  return layoutPage("Admin — Projects", inner);
}

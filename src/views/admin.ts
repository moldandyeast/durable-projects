import { layoutPage } from "./shared";

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
        <form id="proj-form">
          <div class="admin-editor-layout">
            <aside class="admin-editor-meta">
              <div>
                <label class="admin-label" for="proj-select">Project</label>
                <select id="proj-select"><option value="">— New —</option></select>
              </div>
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
              <div class="admin-collab-wrap">
                <span id="client-picker-label" class="admin-label">Clients</span>
                <p class="admin-field-hint">Check to include; order follows when you select (first checked first).</p>
                <div id="client-picker" class="admin-collab-picker" role="group" aria-labelledby="client-picker-label"></div>
                <input type="hidden" id="pf-client-ids" name="client_ids" value="" />
              </div>
              <div class="admin-collab-wrap">
                <span id="via-picker-label" class="admin-label">Via clients</span>
                <p class="admin-field-hint">Optional intermediaries — same picker as above; order follows selection (e.g. WE3.co closest to the work first). Primary clients are omitted here.</p>
                <div id="via-picker" class="admin-collab-picker" role="group" aria-labelledby="via-picker-label"></div>
                <input type="hidden" name="via_client_ids" id="pf-via-ids" value="" />
              </div>
              <div class="admin-collab-wrap">
                <span id="collab-picker-label" class="admin-label">Collaborators</span>
                <p class="admin-field-hint">Check to include; order follows when you select.</p>
                <div id="collab-picker" class="admin-collab-picker" role="group" aria-labelledby="collab-picker-label"></div>
                <input type="hidden" name="team_member_ids" id="pf-team-ids" value="" />
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
                <label class="admin-label" for="pf-gallery">Gallery JSON</label>
                <textarea id="pf-gallery" name="gallery_json" rows="4" placeholder='[{"url":"","caption":"","alt":""}]'></textarea>
              </div>
              <div class="admin-actions-wrap">
                <div class="admin-actions">
                  <button type="submit" id="btn-save">Save</button>
                  <button type="button" id="btn-new">New</button>
                  <button type="button" id="btn-del">Archive</button>
                </div>
                <p id="proj-save-status" class="admin-save-status" role="status" aria-live="polite" aria-atomic="true"></p>
              </div>
            </aside>
            <div class="admin-editor-md">
              <label class="admin-label" for="pf-body">Markdown</label>
              <textarea id="pf-body" name="body" placeholder="#" spellcheck="false"></textarea>
            </div>
            <aside class="admin-editor-preview">
              <div class="admin-label" id="preview-label">Preview</div>
              <div id="md-preview" class="admin-preview-pane article-body" aria-labelledby="preview-label" aria-live="polite"></div>
            </aside>
          </div>
        </form>
      </section>
    </section>

    <section id="view-collaborators" class="admin-view" aria-labelledby="collab-heading" hidden>
      <div class="admin-view-head">
        <h1 id="collab-heading" class="admin-view-title">Collaborators</h1>
        <button type="button" class="admin-add-btn" id="open-collab-overlay" aria-haspopup="dialog" aria-controls="overlay-collab" title="Add collaborator">+</button>
      </div>
      <section class="admin-panel">
        <h2>Directory</h2>
        <ul id="team-list" class="admin-list"></ul>
      </section>
    </section>

    <section id="view-clients" class="admin-view" aria-labelledby="clients-heading" hidden>
      <div class="admin-view-head">
        <h1 id="clients-heading" class="admin-view-title">Clients</h1>
        <button type="button" class="admin-add-btn" id="open-client-overlay" aria-haspopup="dialog" aria-controls="overlay-client" title="Add client">+</button>
      </div>
      <section class="admin-panel">
        <h2>Directory</h2>
        <ul id="clients-list" class="admin-list"></ul>
      </section>
    </section>
  </main>

  <div id="overlay-collab" class="admin-overlay" hidden aria-hidden="true">
    <button type="button" class="admin-overlay__backdrop" tabindex="-1" aria-label="Dismiss"></button>
    <div class="admin-overlay__panel" role="dialog" aria-modal="true" aria-labelledby="overlay-collab-title">
      <div class="admin-overlay__head">
        <h2 id="overlay-collab-title" class="admin-overlay__title">Add collaborator</h2>
        <button type="button" class="admin-overlay__close" data-overlay-close="overlay-collab" aria-label="Close">&times;</button>
      </div>
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
        <div class="admin-overlay__actions">
          <button type="button" class="admin-btn admin-btn--ghost" data-overlay-close="overlay-collab">Cancel</button>
          <button type="submit">Add</button>
        </div>
      </form>
    </div>
  </div>

  <div id="overlay-client" class="admin-overlay" hidden aria-hidden="true">
    <button type="button" class="admin-overlay__backdrop" tabindex="-1" aria-label="Dismiss"></button>
    <div class="admin-overlay__panel" role="dialog" aria-modal="true" aria-labelledby="overlay-client-title">
      <div class="admin-overlay__head">
        <h2 id="overlay-client-title" class="admin-overlay__title">Add client</h2>
        <button type="button" class="admin-overlay__close" data-overlay-close="overlay-client" aria-label="Close">&times;</button>
      </div>
      <form id="client-form" class="admin-grid">
        <div>
          <label class="admin-label" for="cf-name">Name</label>
          <input id="cf-name" name="name" placeholder="" required />
        </div>
        <div>
          <label class="admin-label" for="cf-parent">Parent client</label>
          <select id="cf-parent" name="parent_client_id"><option value="">— None —</option></select>
        </div>
        <div>
          <label class="admin-label" for="cf-url">URL</label>
          <input id="cf-url" name="url" placeholder="Optional" />
        </div>
        <div class="admin-overlay__actions">
          <button type="button" class="admin-btn admin-btn--ghost" data-overlay-close="overlay-client">Cancel</button>
          <button type="submit">Add</button>
        </div>
      </form>
    </div>
  </div>
</div>

  <script>
    async function j(url, opt) {
      opt = opt || {};
      var headers = Object.assign({ "Content-Type": "application/json" }, opt.headers || {});
      return fetch(url, Object.assign({}, opt, { headers: headers }));
    }

    var previewTimer;
    var previewAbort;
    var projSaveStatusTimer;
    var cachedClients = [];
    var clientPickOrder = [];
    var viaPickOrder = [];
    var teamPickOrder = [];

    function clearProjSaveStatusSoon() {
      clearTimeout(projSaveStatusTimer);
      projSaveStatusTimer = setTimeout(function() {
        var el = document.getElementById("proj-save-status");
        if (!el) return;
        el.textContent = "";
        el.classList.remove("is-success", "is-error");
      }, 4800);
    }

    function setProjSaveStatus(kind, text) {
      var el = document.getElementById("proj-save-status");
      if (!el) return;
      clearTimeout(projSaveStatusTimer);
      el.classList.remove("is-success", "is-error");
      el.textContent = text || "";
      if (kind === "success") {
        el.classList.add("is-success");
        clearProjSaveStatusSoon();
      } else if (kind === "error") {
        el.classList.add("is-error");
      }
    }

    function clearProjSaveStatus() {
      clearTimeout(projSaveStatusTimer);
      var el = document.getElementById("proj-save-status");
      if (!el) return;
      el.textContent = "";
      el.classList.remove("is-success", "is-error");
    }

    function previewPlaceholder() {
      var pane = document.getElementById("md-preview");
      if (!pane) return;
      pane.innerHTML = '<p class="admin-preview-placeholder">Markdown preview</p>';
    }

    async function refreshPreview() {
      var ta = document.getElementById("pf-body");
      var pane = document.getElementById("md-preview");
      if (!ta || !pane) return;
      if (!ta.value.trim()) {
        previewPlaceholder();
        return;
      }
      if (previewAbort) previewAbort.abort();
      previewAbort = new AbortController();
      try {
        var r = await j("/admin/api/preview", {
          method: "POST",
          body: JSON.stringify({ body: ta.value }),
          signal: previewAbort.signal,
        });
        if (!r.ok) return;
        var data = await r.json();
        pane.innerHTML = data.html || "";
      } catch (e) {
        if (e.name === "AbortError") return;
      }
    }

    function schedulePreview() {
      clearTimeout(previewTimer);
      previewTimer = setTimeout(refreshPreview, 240);
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
      if (name === "editor") schedulePreview();
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

    var overlayFocusReturn = null;

    function syncOverlayScrollLock() {
      var oc = document.getElementById("overlay-collab");
      var ol = document.getElementById("overlay-client");
      if ((!oc || oc.hidden) && (!ol || ol.hidden)) {
        document.body.classList.remove("admin-overlay-open");
      }
    }

    function openOverlay(id) {
      var el = document.getElementById(id);
      if (!el) return;
      overlayFocusReturn = document.activeElement;
      el.hidden = false;
      el.setAttribute("aria-hidden", "false");
      document.body.classList.add("admin-overlay-open");
      var input = el.querySelector("input[name=name], input");
      if (input) input.focus();
    }

    function closeOverlay(id) {
      var el = typeof id === "string" ? document.getElementById(id) : id;
      if (!el || el.hidden) return;
      el.hidden = true;
      el.setAttribute("aria-hidden", "true");
      syncOverlayScrollLock();
      if (overlayFocusReturn && typeof overlayFocusReturn.focus === "function") {
        overlayFocusReturn.focus();
        overlayFocusReturn = null;
      }
    }

    function bindOverlays() {
      document.getElementById("open-collab-overlay").addEventListener("click", function() {
        openOverlay("overlay-collab");
      });
      document.getElementById("open-client-overlay").addEventListener("click", function() {
        openOverlay("overlay-client");
      });
      document.querySelectorAll(".admin-overlay__backdrop").forEach(function(btn) {
        btn.addEventListener("click", function() {
          var overlay = btn.closest(".admin-overlay");
          if (overlay) closeOverlay(overlay.id);
        });
      });
      document.querySelectorAll("[data-overlay-close]").forEach(function(btn) {
        btn.addEventListener("click", function() {
          closeOverlay(btn.getAttribute("data-overlay-close"));
        });
      });
      document.addEventListener("keydown", function(ev) {
        if (ev.key !== "Escape") return;
        var oc = document.getElementById("overlay-collab");
        var ol = document.getElementById("overlay-client");
        if (oc && !oc.hidden) closeOverlay("overlay-collab");
        else if (ol && !ol.hidden) closeOverlay("overlay-client");
      });
    }

    function appendCollabStyleRow(wrap, value, textLine, idLine, checked, onChange) {
      var row = document.createElement("label");
      row.className = "admin-collab-row";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = value;
      cb.checked = checked;
      cb.addEventListener("change", onChange);
      var span = document.createElement("span");
      span.className = "admin-collab-row__text";
      span.textContent = textLine;
      var sid = document.createElement("span");
      sid.className = "admin-collab-row__id";
      sid.textContent = idLine;
      row.appendChild(cb);
      row.appendChild(span);
      row.appendChild(sid);
      wrap.appendChild(row);
    }

    function getSelectedTeamIdsFromHidden() {
      var hid = document.getElementById("pf-team-ids");
      if (!hid.value.trim()) return [];
      return hid.value.split(",").map(function(s) { return s.trim(); }).filter(Boolean);
    }

    function syncTeamPickHidden() {
      var h = document.getElementById("pf-team-ids");
      if (h) h.value = teamPickOrder.join(",");
    }

    function applyTeamIdsToCheckboxes(ids) {
      teamPickOrder = (ids || []).slice();
      syncTeamPickHidden();
      document.querySelectorAll('#collab-picker input[type="checkbox"]').forEach(function(cb) {
        cb.checked = teamPickOrder.indexOf(cb.value) !== -1;
      });
    }

    function syncClientPickHidden() {
      var h = document.getElementById("pf-client-ids");
      if (h) h.value = clientPickOrder.join(",");
    }

    function renderClientPicker(clients) {
      var wrap = document.getElementById("client-picker");
      if (!wrap) return;
      var hid = document.getElementById("pf-client-ids");
      var preserved = (hid && hid.value ? hid.value : "").split(",").map(function(s) { return s.trim(); }).filter(Boolean);
      if (preserved.length) clientPickOrder = preserved.slice();
      var allow = {};
      clients.forEach(function(c) {
        allow[c.id] = true;
      });
      clientPickOrder = clientPickOrder.filter(function(id) {
        return allow[id];
      });
      wrap.textContent = "";
      if (!clients.length) {
        var empty = document.createElement("p");
        empty.className = "admin-collab-picker__empty";
        empty.textContent = "No clients yet — add some under Clients.";
        wrap.appendChild(empty);
        clientPickOrder = [];
        syncClientPickHidden();
        renderViaPicker(clients);
        return;
      }
      clients.forEach(function(c) {
        appendCollabStyleRow(wrap, c.id, c.name, c.id, clientPickOrder.indexOf(c.id) !== -1, function(ev) {
          var cb = ev.target;
          var id = cb.value;
          if (cb.checked) {
            if (clientPickOrder.indexOf(id) === -1) clientPickOrder.push(id);
          } else {
            clientPickOrder = clientPickOrder.filter(function(x) {
              return x !== id;
            });
          }
          syncClientPickHidden();
          renderViaPicker(clients);
        });
      });
      syncClientPickHidden();
      renderViaPicker(clients);
    }

    function applyClientIdsToCheckboxes(ids) {
      clientPickOrder = (ids || []).slice();
      syncClientPickHidden();
      document.querySelectorAll('#client-picker input[type="checkbox"]').forEach(function(cb) {
        cb.checked = clientPickOrder.indexOf(cb.value) !== -1;
      });
      renderViaPicker(cachedClients);
    }

    function syncViaPickHidden() {
      var h = document.getElementById("pf-via-ids");
      if (h) h.value = viaPickOrder.join(",");
    }

    function pruneViaPickAgainstPrimaries() {
      var primarySet = {};
      clientPickOrder.forEach(function(id) {
        primarySet[id] = true;
      });
      viaPickOrder = viaPickOrder.filter(function(id) {
        return !primarySet[id];
      });
    }

    function renderViaPicker(clients) {
      pruneViaPickAgainstPrimaries();
      var wrap = document.getElementById("via-picker");
      if (!wrap) return;
      var candidates = clients.filter(function(c) {
        return clientPickOrder.indexOf(c.id) === -1;
      });
      var allowVia = {};
      candidates.forEach(function(c) {
        allowVia[c.id] = true;
      });
      viaPickOrder = viaPickOrder.filter(function(id) {
        return allowVia[id];
      });
      wrap.textContent = "";
      if (!candidates.length) {
        var empty = document.createElement("p");
        empty.className = "admin-collab-picker__empty";
        empty.textContent = clientPickOrder.length ?
          "No other clients to list — all directory entries are primary, or add more under Clients."
        : "Select primary clients first, or add clients under Clients.";
        wrap.appendChild(empty);
        syncViaPickHidden();
        return;
      }
      candidates.forEach(function(c) {
        appendCollabStyleRow(wrap, c.id, c.name, c.id, viaPickOrder.indexOf(c.id) !== -1, function(ev) {
          var cb = ev.target;
          var id = cb.value;
          if (cb.checked) {
            if (viaPickOrder.indexOf(id) === -1) viaPickOrder.push(id);
          } else {
            viaPickOrder = viaPickOrder.filter(function(x) {
              return x !== id;
            });
          }
          syncViaPickHidden();
        });
      });
      syncViaPickHidden();
    }

    function computeViaIds() {
      syncViaPickHidden();
      return viaPickOrder.slice();
    }

    function renderCollaboratorPicker(members) {
      var preserved = getSelectedTeamIdsFromHidden();
      if (preserved.length) teamPickOrder = preserved.slice();
      var memberAllow = {};
      members.forEach(function(m) {
        memberAllow[m.id] = true;
      });
      teamPickOrder = teamPickOrder.filter(function(id) {
        return memberAllow[id];
      });
      var wrap = document.getElementById("collab-picker");
      wrap.textContent = "";
      if (!members.length) {
        var empty = document.createElement("p");
        empty.className = "admin-collab-picker__empty";
        empty.textContent = "No collaborators yet — add some under Collaborators.";
        wrap.appendChild(empty);
        teamPickOrder = [];
        syncTeamPickHidden();
        return;
      }
      members.forEach(function(m) {
        appendCollabStyleRow(
          wrap,
          m.id,
          m.name + (m.role ? " — " + m.role : ""),
          m.id,
          teamPickOrder.indexOf(m.id) !== -1,
          function(ev) {
            var cb = ev.target;
            var id = cb.value;
            if (cb.checked) {
              if (teamPickOrder.indexOf(id) === -1) teamPickOrder.push(id);
            } else {
              teamPickOrder = teamPickOrder.filter(function(x) {
                return x !== id;
              });
            }
            syncTeamPickHidden();
          },
        );
      });
      syncTeamPickHidden();
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
      var byId = {};
      clients.forEach(function(c) {
        byId[c.id] = c;
      });
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
        var parts = [];
        if (c.parent_client_id && byId[c.parent_client_id]) {
          parts.push("via " + byId[c.parent_client_id].name);
        }
        parts.push(c.id);
        meta.textContent = parts.join(" · ");
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
      cachedClients = clients.clients || [];
      renderClientPicker(cachedClients);
      renderCollaboratorPicker(team.members || []);

      var sel = document.getElementById("proj-select");
      while (sel.options.length > 1) sel.remove(1);
      (projects.projects || []).forEach(function(p) {
        var o = document.createElement("option");
        o.value = p.id;
        o.textContent = p.title + " · " + p.id;
        sel.appendChild(o);
      });

      var cfParent = document.getElementById("cf-parent");
      while (cfParent.options.length > 1) cfParent.remove(1);
      cachedClients.forEach(function(c) {
        var po = document.createElement("option");
        po.value = c.id;
        po.textContent = c.name + " · " + c.id;
        cfParent.appendChild(po);
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
        clientPickOrder = [];
        viaPickOrder = [];
        teamPickOrder = [];
        syncClientPickHidden();
        syncViaPickHidden();
        syncTeamPickHidden();
        renderClientPicker(cachedClients);
        applyTeamIdsToCheckboxes([]);
        previewPlaceholder();
        return;
      }
      var r = await j("/admin/api/projects/" + id);
      var p = await r.json();
      var f = document.getElementById("proj-form");
      f.title.value = p.title || "";
      f.summary.value = p.summary || "";
      f.tags.value = (p.tags || []).join(", ");
      var cids = (p.client_ids && p.client_ids.length) ? p.client_ids.slice() : (p.client_id ? [p.client_id] : []);
      clientPickOrder = cids.slice();
      syncClientPickHidden();
      viaPickOrder = (p.via_client_ids || []).slice();
      pruneViaPickAgainstPrimaries();
      syncViaPickHidden();
      renderClientPicker(cachedClients);
      applyTeamIdsToCheckboxes(p.team_member_ids || []);
      f.sort_date.value = p.sort_date || "";
      f.preview_image.value = p.preview_image || "";
      f.gallery_json.value = JSON.stringify(p.gallery_images || [], null, 2);
      f.body.value = p.body || "";
      schedulePreview();
    }

    bindNav();
    bindOverlays();

    document.getElementById("proj-select").addEventListener("change", function() {
      clearProjSaveStatus();
      loadProject(this.value);
    });

    document.getElementById("team-form").addEventListener("submit", async function(ev) {
      ev.preventDefault();
      var f = ev.target;
      var r = await j("/admin/api/team/members", {
        method: "POST",
        body: JSON.stringify({ name: f.name.value, role: f.role.value || undefined, url: f.url.value || undefined }),
      });
      if (!r.ok) return;
      f.reset();
      await loadLists();
      closeOverlay("overlay-collab");
    });

    document.getElementById("client-form").addEventListener("submit", async function(ev) {
      ev.preventDefault();
      var f = ev.target;
      var r = await j("/admin/api/clients", {
        method: "POST",
        body: JSON.stringify({
          name: f.name.value,
          url: f.url.value || undefined,
          parent_client_id: f.parent_client_id.value || undefined,
        }),
      });
      if (!r.ok) return;
      f.reset();
      await loadLists();
      closeOverlay("overlay-client");
    });

    document.getElementById("proj-form").addEventListener("submit", async function(ev) {
      ev.preventDefault();
      var f = ev.target;
      var btn = document.getElementById("btn-save");
      var id = document.getElementById("proj-select").value;
      var tags = f.tags.value.split(",").map(function(s) { return s.trim(); }).filter(Boolean);
      syncTeamPickHidden();
      var teamIds = teamPickOrder.slice();
      syncClientPickHidden();
      var clientIds = clientPickOrder.slice();
      var viaIds = computeViaIds();
      var payload = {
        title: f.title.value,
        summary: f.summary.value,
        tags: tags,
        client_ids: clientIds,
        via_client_ids: viaIds,
        sort_date: f.sort_date.value || undefined,
        preview_image: f.preview_image.value || undefined,
        team_member_ids: teamIds,
        gallery_images: parseGallery(f.gallery_json.value),
        body: f.body.value,
      };

      var st = document.getElementById("proj-save-status");
      clearTimeout(projSaveStatusTimer);
      if (st) {
        st.classList.remove("is-success", "is-error");
        st.textContent = "Saving…";
      }
      btn.disabled = true;

      try {
        var r = id
          ? await j("/admin/api/projects/" + id, { method: "PUT", body: JSON.stringify(payload) })
          : await j("/admin/api/projects", { method: "POST", body: JSON.stringify(payload) });

        if (!r.ok) {
          var errMsg = "Could not save.";
          var ct = (r.headers.get("content-type") || "").toLowerCase();
          if (ct.indexOf("json") !== -1) {
            try {
              var ej = await r.json();
              if (ej && typeof ej.error === "string") errMsg = ej.error;
              else if (ej && typeof ej.message === "string") errMsg = ej.message;
            } catch (e1) {}
          } else {
            try {
              var tx = await r.text();
              if (tx) errMsg = tx.length > 160 ? tx.slice(0, 160) + "…" : tx;
            } catch (e2) {}
          }
          setProjSaveStatus("error", errMsg);
          return;
        }

        var saved = null;
        try {
          saved = await r.json();
        } catch (e3) {}

        await loadLists();
        var sel = document.getElementById("proj-select");
        var nextId = id || (saved && saved.id ? saved.id : "");
        if (nextId) sel.value = nextId;
        await loadProject(sel.value || "");

        var timeStr = new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit" });
        setProjSaveStatus("success", "Saved · " + timeStr);
      } catch (err) {
        setProjSaveStatus("error", "Network error — try again.");
      } finally {
        btn.disabled = false;
      }
    });

    document.getElementById("btn-new").addEventListener("click", function() {
      clearProjSaveStatus();
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

    document.getElementById("pf-body").addEventListener("input", schedulePreview);

    loadLists();
    previewPlaceholder();
  </script>`;

  return layoutPage("Admin", inner, { bodyClass: "admin-app" });
}

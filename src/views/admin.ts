import { layoutPage } from "./shared";

/** Authoring shell — `/admin/api/*`. Swiss minimal UI; Editor / Collaborators / Clients as separate views. */
export function adminTemplate(): string {
  const inner = `
<div class="admin-shell">
  <header class="admin-header">
    <div class="admin-header__row">
      <span class="admin-wordmark">Studio</span>
      <div class="admin-header__links">
        <a href="/" class="admin-header__exit">Public site</a>
        <span class="admin-header__links-sep" aria-hidden="true">·</span>
        <button
          type="button"
          class="admin-header__link-btn"
          id="open-api-docs"
          aria-haspopup="dialog"
          aria-controls="overlay-api-docs"
        >
          API
        </button>
      </div>
    </div>
    <nav class="admin-nav" aria-label="Admin sections">
      <button type="button" class="admin-nav__btn is-active" data-view="editor">Editor</button>
      <button type="button" class="admin-nav__btn" data-view="collaborators">Collaborators</button>
      <button type="button" class="admin-nav__btn" data-view="clients">Clients</button>
    </nav>
  </header>

  <main class="admin-main">
    <section id="view-editor" class="admin-view" aria-label="Project editor">
      <section class="admin-panel">
        <form id="proj-form">
          <header class="admin-editor-toolbar">
            <div class="admin-editor-toolbar__left">
              <div class="admin-editor-toolbar__project">
                <label class="admin-label admin-editor-toolbar__label" for="proj-select">Project</label>
                <div class="admin-editor-toolbar__field">
                  <select id="proj-select" class="admin-editor-toolbar__select" aria-describedby="editor-toolbar-hint">
                    <option value="">New draft</option>
                  </select>
                  <span id="editor-toolbar-hint" class="admin-editor-toolbar__hint">Compose below · metadata lives in settings</span>
                </div>
              </div>
            </div>
            <div class="admin-editor-toolbar__right">
              <button
                type="button"
                class="admin-btn admin-btn--ghost admin-editor-toolbar__settings"
                id="open-project-settings"
                aria-haspopup="dialog"
                aria-controls="overlay-project-settings"
              >
                Settings
              </button>
              <div class="admin-editor-toolbar__actions">
                <button type="submit" id="btn-save" formnovalidate class="admin-btn admin-btn--toolbar-primary">
                  <span class="admin-btn__label">Save</span>
                  <kbd class="admin-kbd admin-kbd--inline">⌘S</kbd>
                </button>
                <button type="button" id="btn-new" class="admin-btn admin-btn--toolbar-secondary">New</button>
                <button type="button" id="btn-del" class="admin-btn admin-btn--toolbar-archive">Archive</button>
              </div>
              <p id="proj-save-status" class="admin-save-status admin-editor-toolbar__status" role="status" aria-live="polite" aria-atomic="true"></p>
            </div>
          </header>
          <div class="admin-editor-layout">
            <aside class="admin-editor-rail" aria-label="Images for markdown">
              <div class="admin-editor-rail__tabs" role="tablist" aria-label="Editor sidebar">
                <button
                  type="button"
                  class="admin-editor-rail__tab is-active"
                  role="tab"
                  aria-selected="true"
                  id="editor-tab-media"
                  aria-controls="editor-panel-media"
                >
                  Media
                </button>
              </div>
              <div class="admin-editor-rail__body" id="editor-panel-media" role="tabpanel" aria-labelledby="editor-tab-media">
                <p class="admin-editor-rail__hint">Drag or tap to insert into markdown</p>
                <div id="editor-media-strip" class="admin-editor-media-strip"></div>
                <p id="editor-media-empty" class="admin-editor-media-empty">Preview or gallery URLs from settings appear here.</p>
              </div>
            </aside>
            <div class="admin-editor-md">
              <div class="admin-md-head">
                <label class="admin-label" for="pf-body">Markdown</label>
                <div class="admin-md-tools" role="toolbar" aria-label="Insert markdown">
                  <button type="button" class="admin-md-tool" id="md-tool-bold" aria-label="Bold" title="Bold (⌘B / Ctrl+B)">
                    <span class="admin-md-tool__glyph admin-md-tool__b" aria-hidden="true">B</span>
                    <kbd class="admin-kbd admin-kbd--tool">⌘B</kbd>
                  </button>
                  <button type="button" class="admin-md-tool" id="md-tool-italic" aria-label="Italic" title="Italic (⌘I / Ctrl+I)">
                    <span class="admin-md-tool__glyph admin-md-tool__i" aria-hidden="true">I</span>
                    <kbd class="admin-kbd admin-kbd--tool">⌘I</kbd>
                  </button>
                  <button type="button" class="admin-md-tool admin-md-tool--wide" id="md-tool-link" aria-label="Link" title="Link (⌘K / Ctrl+K)">
                    <span class="admin-md-tool__glyph">Link</span>
                    <kbd class="admin-kbd admin-kbd--tool">⌘K</kbd>
                  </button>
                </div>
              </div>
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
</div>

  <div id="overlay-collab" class="admin-overlay" hidden aria-hidden="true">
    <button type="button" class="admin-overlay__backdrop" tabindex="-1" aria-label="Dismiss"></button>
    <div class="admin-overlay__panel admin-overlay__panel--sheet" role="dialog" aria-modal="true" aria-labelledby="overlay-collab-title">
      <div class="admin-overlay__head admin-overlay__head--rich">
        <div class="admin-overlay__title-stack">
          <p class="admin-overlay__eyebrow">Directory</p>
          <h2 id="overlay-collab-title" class="admin-overlay__heading">Add collaborator</h2>
          <p class="admin-overlay__lede admin-overlay__lede--compact">Creates a profile you can attach to projects.</p>
        </div>
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
    <div class="admin-overlay__panel admin-overlay__panel--sheet" role="dialog" aria-modal="true" aria-labelledby="overlay-client-title">
      <div class="admin-overlay__head admin-overlay__head--rich">
        <div class="admin-overlay__title-stack">
          <p class="admin-overlay__eyebrow">Directory</p>
          <h2 id="overlay-client-title" class="admin-overlay__heading">Add client</h2>
          <p class="admin-overlay__lede admin-overlay__lede--compact">Optional parent keeps agency hierarchies tidy.</p>
        </div>
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

  <div id="overlay-edit-collab" class="admin-overlay" hidden aria-hidden="true">
    <button type="button" class="admin-overlay__backdrop" tabindex="-1" aria-label="Dismiss"></button>
    <div class="admin-overlay__panel admin-overlay__panel--sheet" role="dialog" aria-modal="true" aria-labelledby="overlay-edit-collab-title">
      <div class="admin-overlay__head admin-overlay__head--rich">
        <div class="admin-overlay__title-stack">
          <p class="admin-overlay__eyebrow">Directory</p>
          <h2 id="overlay-edit-collab-title" class="admin-overlay__heading">Edit collaborator</h2>
          <p class="admin-overlay__lede admin-overlay__lede--compact">Id stays fixed; updates apply everywhere this profile is used.</p>
        </div>
        <button type="button" class="admin-overlay__close" data-overlay-close="overlay-edit-collab" aria-label="Close">&times;</button>
      </div>
      <form id="team-edit-form" class="admin-grid">
        <input type="hidden" id="tf-edit-id" value="" />
        <div>
          <label class="admin-label" for="tf-edit-name">Name</label>
          <input id="tf-edit-name" name="name" placeholder="" required />
        </div>
        <div>
          <label class="admin-label" for="tf-edit-role">Role</label>
          <input id="tf-edit-role" name="role" placeholder="Optional" />
        </div>
        <div>
          <label class="admin-label" for="tf-edit-url">URL</label>
          <input id="tf-edit-url" name="url" placeholder="Optional" />
        </div>
        <div class="admin-overlay__actions">
          <button type="button" class="admin-btn admin-btn--ghost" data-overlay-close="overlay-edit-collab">Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  </div>

  <div id="overlay-edit-client" class="admin-overlay" hidden aria-hidden="true">
    <button type="button" class="admin-overlay__backdrop" tabindex="-1" aria-label="Dismiss"></button>
    <div class="admin-overlay__panel admin-overlay__panel--sheet" role="dialog" aria-modal="true" aria-labelledby="overlay-edit-client-title">
      <div class="admin-overlay__head admin-overlay__head--rich">
        <div class="admin-overlay__title-stack">
          <p class="admin-overlay__eyebrow">Directory</p>
          <h2 id="overlay-edit-client-title" class="admin-overlay__heading">Edit client</h2>
          <p class="admin-overlay__lede admin-overlay__lede--compact">Id stays fixed; changing parent checks for cycles.</p>
        </div>
        <button type="button" class="admin-overlay__close" data-overlay-close="overlay-edit-client" aria-label="Close">&times;</button>
      </div>
      <form id="client-edit-form" class="admin-grid">
        <input type="hidden" id="cf-edit-id" value="" />
        <div>
          <label class="admin-label" for="cf-edit-name">Name</label>
          <input id="cf-edit-name" name="name" placeholder="" required />
        </div>
        <div>
          <label class="admin-label" for="cf-edit-parent">Parent client</label>
          <select id="cf-edit-parent" name="parent_client_id"><option value="">— None —</option></select>
        </div>
        <div>
          <label class="admin-label" for="cf-edit-url">URL</label>
          <input id="cf-edit-url" name="url" placeholder="Optional" />
        </div>
        <div class="admin-overlay__actions">
          <button type="button" class="admin-btn admin-btn--ghost" data-overlay-close="overlay-edit-client">Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  </div>

  <div id="overlay-project-settings" class="admin-overlay" hidden aria-hidden="true">
    <button type="button" class="admin-overlay__backdrop" tabindex="-1" aria-label="Dismiss"></button>
    <div
      class="admin-overlay__panel admin-overlay__panel--settings"
      role="dialog"
      aria-modal="true"
      aria-labelledby="overlay-project-settings-heading"
    >
      <div class="admin-overlay__head admin-overlay__head--rich">
        <div class="admin-overlay__title-stack">
          <p class="admin-overlay__eyebrow">Editor</p>
          <h2 id="overlay-project-settings-heading" class="admin-overlay__heading">Project settings</h2>
          <p class="admin-overlay__lede">Everything except the markdown body — tuned for clarity and save.</p>
        </div>
        <button type="button" class="admin-overlay__close" data-overlay-close="overlay-project-settings" aria-label="Close">&times;</button>
      </div>
      <div class="admin-overlay__body admin-overlay__body--scroll">
        <div class="admin-settings-section">
          <h3 class="admin-settings-section__label">Basics</h3>
          <div class="admin-settings-section__fields">
            <div>
              <label class="admin-label" for="pf-title">Title</label>
              <input form="proj-form" id="pf-title" name="title" placeholder="" required />
            </div>
            <div>
              <label class="admin-label" for="pf-summary">Summary</label>
              <input form="proj-form" id="pf-summary" name="summary" placeholder="" />
            </div>
            <div>
              <label class="admin-label" for="pf-tags">Tags</label>
              <input form="proj-form" id="pf-tags" name="tags" placeholder="Comma-separated" />
            </div>
            <div>
              <label class="admin-label" for="pf-sort">Sort date</label>
              <input form="proj-form" id="pf-sort" name="sort_date" placeholder="YYYY-MM-DD" />
            </div>
          </div>
        </div>
        <div class="admin-settings-section">
          <h3 class="admin-settings-section__label">Clients & collaborators</h3>
          <div class="admin-settings-section__fields admin-settings-section__fields--dense">
            <div class="admin-collab-wrap">
              <span id="client-picker-label" class="admin-label">Clients</span>
              <p class="admin-field-hint">Checked names appear on the site; order follows selection.</p>
              <details class="admin-field-more">
                <summary>About ordering</summary>
                <p class="admin-field-more__body">First checked appears first in listings.</p>
              </details>
              <div id="client-picker" class="admin-collab-picker" role="group" aria-labelledby="client-picker-label"></div>
              <input form="proj-form" type="hidden" id="pf-client-ids" name="client_ids" value="" />
            </div>
            <div class="admin-collab-wrap">
              <span id="via-picker-label" class="admin-label">Via clients</span>
              <p class="admin-field-hint">Optional chain between client and work; order follows selection.</p>
              <details class="admin-field-more">
                <summary>Examples</summary>
                <p class="admin-field-more__body">Put the intermediary closest to the work first (e.g. WE3.co before the brand). Primary clients are omitted here.</p>
              </details>
              <div id="via-picker" class="admin-collab-picker" role="group" aria-labelledby="via-picker-label"></div>
              <input form="proj-form" type="hidden" name="via_client_ids" id="pf-via-ids" value="" />
            </div>
            <div class="admin-collab-wrap">
              <span id="collab-picker-label" class="admin-label">Collaborators</span>
              <p class="admin-field-hint">Same pattern as clients — checked names show; order follows selection. Optional “Role on project” overrides the directory role for this engagement only.</p>
              <details class="admin-field-more">
                <summary>About ordering</summary>
                <p class="admin-field-more__body">First checked appears first alongside the project.</p>
              </details>
              <div id="collab-picker" class="admin-collab-picker" role="group" aria-labelledby="collab-picker-label"></div>
              <input form="proj-form" type="hidden" name="team_member_ids" id="pf-team-ids" value="" />
            </div>
          </div>
        </div>
        <div class="admin-settings-section">
          <h3 class="admin-settings-section__label">Media</h3>
          <div class="admin-settings-section__fields">
            <div>
              <label class="admin-label" for="pf-preview">Preview image URL</label>
              <input form="proj-form" id="pf-preview" name="preview_image" placeholder="" />
            </div>
            <div class="admin-gallery-block">
              <div class="admin-gallery-head">
                <span id="gallery-editor-label" class="admin-gallery-title">Gallery</span>
                <span id="gallery-count" class="admin-gallery-count" aria-live="polite"></span>
              </div>
              <div class="admin-gallery-composer">
                <input
                  type="text"
                  id="gallery-url-input"
                  class="admin-gallery-composer-input"
                  placeholder="Paste image URL…"
                  autocomplete="off"
                  inputmode="url"
                  aria-describedby="gallery-composer-hint"
                />
                <button type="button" class="admin-gallery-composer-add" id="gallery-add-from-input">Add</button>
              </div>
              <p id="gallery-composer-hint" class="admin-gallery-composer-hint">HTTPS recommended · <kbd>Enter</kbd> to add · drag rows to reorder</p>
              <div class="admin-gallery-list-shell">
                <p id="gallery-list-empty" class="admin-gallery-list-empty">No images yet — paste a URL above.</p>
                <div id="gallery-rows" class="admin-gallery-rows" role="list" aria-labelledby="gallery-editor-label"></div>
              </div>
              <div class="admin-gallery-preview-block">
                <div class="admin-gallery-preview-head">
                  <span class="admin-gallery-preview-dot" aria-hidden="true"></span>
                  <span class="admin-gallery-preview-title">Site grid · live</span>
                </div>
                <div id="gallery-live-preview" class="gallery-grid admin-gallery-live" aria-live="polite"></div>
                <p id="gallery-live-empty" class="admin-gallery-live-empty">Preview fills in when URLs resolve.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer class="admin-overlay__footer">
        <p class="admin-overlay__footer-note">Changes apply when you choose <strong>Save</strong> in the toolbar.</p>
        <button type="button" class="admin-btn admin-btn--primary-wide" data-overlay-close="overlay-project-settings">Done</button>
      </footer>
    </div>
  </div>

  <div id="overlay-api-docs" class="admin-overlay" hidden aria-hidden="true">
    <button type="button" class="admin-overlay__backdrop" tabindex="-1" aria-label="Dismiss"></button>
    <div
      class="admin-overlay__panel admin-overlay__panel--settings"
      role="dialog"
      aria-modal="true"
      aria-labelledby="overlay-api-docs-heading"
    >
      <div class="admin-overlay__head admin-overlay__head--rich">
        <div class="admin-overlay__title-stack">
          <p class="admin-overlay__eyebrow">Integrations</p>
          <h2 id="overlay-api-docs-heading" class="admin-overlay__heading">Public HTTP API</h2>
          <p class="admin-overlay__lede">Read-only JSON for the project index, directory data, and single projects. Use your site origin as the base URL (no separate API host).</p>
        </div>
        <button type="button" class="admin-overlay__close" data-overlay-close="overlay-api-docs" aria-label="Close">&times;</button>
      </div>
      <div class="admin-overlay__body admin-overlay__body--scroll">
        <div class="admin-settings-section">
          <h3 class="admin-settings-section__label">Overview</h3>
          <div class="admin-settings-section__fields admin-api-docs-prose">
            <p>All routes below are <strong>GET</strong> unless noted. Responses are JSON with <code class="admin-code-inline">Content-Type: application/json; charset=utf-8</code> unless stated otherwise.</p>
            <p class="admin-doc-muted">Paths under <code class="admin-code-inline">/api/</code> send CORS headers (<code class="admin-code-inline">Access-Control-Allow-Origin: *</code>) for use from browsers on other origins. Human pages (<code class="admin-code-inline">/</code>, project URLs) are same-origin unless you proxy them.</p>
          </div>
        </div>
        <div class="admin-settings-section">
          <h3 class="admin-settings-section__label">Project index</h3>
          <div class="admin-settings-section__fields admin-api-docs-prose">
            <p><code class="admin-code-inline">GET /api/index</code></p>
            <p>Returns <code class="admin-code-inline">{ "projects": [ … ] }</code>: each index row that is not hidden (ids, titles, tags, client ids, preview URLs, dates, etc.). Same catalog that backs the public home page.</p>
            <pre class="admin-doc-pre" tabindex="0">curl -sS https://YOUR_ORIGIN/api/index</pre>
            <p class="admin-doc-muted">Replace <code class="admin-code-inline">YOUR_ORIGIN</code> with this site&apos;s host (no trailing slash).</p>
          </div>
        </div>
        <div class="admin-settings-section">
          <h3 class="admin-settings-section__label">Team &amp; clients</h3>
          <div class="admin-settings-section__fields admin-api-docs-prose">
            <p><code class="admin-code-inline">GET /api/team</code> → <code class="admin-code-inline">{ "members": [ … ] }</code></p>
            <p><code class="admin-code-inline">GET /api/clients</code> → <code class="admin-code-inline">{ "clients": [ … ] }</code></p>
            <p>Use these to resolve collaborator and client metadata when rendering the index or cards elsewhere.</p>
          </div>
        </div>
        <div class="admin-settings-section">
          <h3 class="admin-settings-section__label">Single project (JSON)</h3>
          <div class="admin-settings-section__fields admin-api-docs-prose">
            <p><code class="admin-code-inline">GET /api/projects/&lt;slug&gt;</code></p>
            <p><code class="admin-code-inline">&lt;slug&gt;</code> is eight characters (<span class="admin-doc-muted">Crockford base32</span>: <code class="admin-code-inline">0-9 a-h j-k m-n p-t v-z</code>, no i/l/o/u).</p>
            <p>Returns a full public envelope: markdown body, resolved team and client refs, gallery, tags, ETag from <code class="admin-code-inline">edited_at</code>. <strong>404</strong> if unknown, <strong>410</strong> if deleted.</p>
            <pre class="admin-doc-pre" tabindex="0">curl -sS -H "Accept: application/json" "https://YOUR_ORIGIN/api/projects/xxxxxxxx"</pre>
          </div>
        </div>
        <div class="admin-settings-section">
          <h3 class="admin-settings-section__label">Project page &amp; markdown</h3>
          <div class="admin-settings-section__fields admin-api-docs-prose">
            <p><code class="admin-code-inline">GET /&lt;slug&gt;</code> serves HTML by default. With header <code class="admin-code-inline">Accept: application/json</code> you get the same envelope as <code class="admin-code-inline">/api/projects/&lt;slug&gt;</code>.</p>
            <p><code class="admin-code-inline">GET /&lt;slug&gt;.md</code> (or <code class="admin-code-inline">Accept: text/markdown</code>) returns YAML-front-matter-style headers plus raw markdown body.</p>
          </div>
        </div>
        <div class="admin-settings-section">
          <h3 class="admin-settings-section__label">Home &amp; filters</h3>
          <div class="admin-settings-section__fields admin-api-docs-prose">
            <p><code class="admin-code-inline">GET /</code> is HTML. The underlying list is the same as <code class="admin-code-inline">/api/index</code>, filtered server-side by query params:</p>
            <ul class="admin-doc-list">
              <li><code class="admin-code-inline">?tag=&lt;tag&gt;</code> — substring match on tags</li>
              <li><code class="admin-code-inline">?client=&lt;client id&gt;</code> — primary or via client id</li>
            </ul>
          </div>
        </div>
        <div class="admin-settings-section">
          <h3 class="admin-settings-section__label">Live views</h3>
          <div class="admin-settings-section__fields admin-api-docs-prose">
            <p><code class="admin-code-inline">GET /&lt;slug&gt;/live</code> with <code class="admin-code-inline">Upgrade: websocket</code> connects to the project durable object live channel (optional product features).</p>
          </div>
        </div>
        <div class="admin-settings-section">
          <h3 class="admin-settings-section__label">Writes</h3>
          <div class="admin-settings-section__fields admin-api-docs-prose">
            <p class="admin-doc-muted">Creating or editing projects, preview markdown, and directory edits use <code class="admin-code-inline">/admin/api/*</code> and require auth (e.g. Cloudflare Access). They are not part of the public read API.</p>
          </div>
        </div>
      </div>
      <footer class="admin-overlay__footer">
        <button type="button" class="admin-btn admin-btn--primary-wide" data-overlay-close="overlay-api-docs">Close</button>
      </footer>
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
    var teamPickRoles = {};
    var cachedTeamMembers = [];

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

    function insertIntoMarkdown(ta, text) {
      if (!ta || text == null || text === "") return;
      var start = ta.selectionStart;
      var end = ta.selectionEnd;
      var val = ta.value;
      ta.value = val.slice(0, start) + text + val.slice(end);
      ta.focus();
      var pos = start + text.length;
      ta.setSelectionRange(pos, pos);
      schedulePreview();
    }

    function mdImageMarkdown(url, alt) {
      alt = String(alt || "")
        .replace(/\\]/g, "")
        .replace(/\\r?\\n/g, " ")
        .trim();
      url = String(url || "").trim();
      if (!url) return "";
      var urlPart = url.indexOf(")") >= 0 || /\\s/.test(url) ? "<" + url + ">" : url;
      return "![" + alt + "](" + urlPart + ")\\n";
    }

    function refreshEditorMediaStrip() {
      var strip = document.getElementById("editor-media-strip");
      var emptyMsg = document.getElementById("editor-media-empty");
      var previewInp = document.getElementById("pf-preview");
      if (!strip || !emptyMsg) return;
      strip.textContent = "";
      var entries = [];
      var pv = previewInp ? String(previewInp.value || "").trim() : "";
      if (pv) entries.push({ url: pv, alt: "", tag: "preview" });
      collectGalleryFromEditor().forEach(function(it, i) {
        var u = it.url ? String(it.url).trim() : "";
        if (!u) return;
        entries.push({ url: u, alt: (it.alt || "").trim(), tag: String(i + 1) });
      });
      emptyMsg.hidden = entries.length > 0;
      var ta = document.getElementById("pf-body");
      entries.forEach(function(ent) {
        var snippet = mdImageMarkdown(ent.url, ent.alt);
        if (!snippet) return;
        var card = document.createElement("button");
        card.type = "button";
        card.className = "admin-editor-media-card";
        card.draggable = true;
        card.setAttribute("aria-label", "Insert image from " + ent.tag + " into markdown");
        var img = document.createElement("img");
        img.src = ent.url;
        img.alt = "";
        img.loading = "lazy";
        img.draggable = false;
        img.referrerPolicy = "no-referrer";
        img.addEventListener("error", function() {
          img.hidden = true;
          card.classList.add("admin-editor-media-card--broken");
        });
        var tag = document.createElement("span");
        tag.className = "admin-editor-media-card__tag";
        tag.textContent = ent.tag;
        card.appendChild(tag);
        card.appendChild(img);
        card.addEventListener("dragstart", function(ev) {
          ev.dataTransfer.setData("text/plain", snippet);
          ev.dataTransfer.effectAllowed = "copy";
        });
        card.addEventListener("click", function() {
          if (!ta) return;
          insertIntoMarkdown(ta, snippet);
        });
        strip.appendChild(card);
      });
    }

    function initEditorMediaRail() {
      var ta = document.getElementById("pf-body");
      var pv = document.getElementById("pf-preview");
      if (ta && !ta.getAttribute("data-md-drop")) {
        ta.setAttribute("data-md-drop", "1");
        ta.addEventListener("dragover", function(ev) {
          var types = ev.dataTransfer.types;
          var ok = false;
          if (types && typeof types.contains === "function") {
            ok = types.contains("text/plain") || types.contains("Text");
          } else if (types && types.length) {
            for (var ti = 0; ti < types.length; ti++) {
              if (types[ti] === "text/plain" || types[ti] === "Text") {
                ok = true;
                break;
              }
            }
          }
          if (!ok) return;
          ev.preventDefault();
          ev.dataTransfer.dropEffect = "copy";
        });
        ta.addEventListener("drop", function(ev) {
          ev.preventDefault();
          var text = ev.dataTransfer.getData("text/plain") || ev.dataTransfer.getData("Text");
          if (!text || text === "gallery") return;
          var t = text.trim();
          if (t.indexOf("![") !== 0) return;
          insertIntoMarkdown(ta, text.indexOf("\\n") >= 0 ? text : text + "\\n");
        });
      }
      if (pv && !pv.getAttribute("data-strip-refresh")) {
        pv.setAttribute("data-strip-refresh", "1");
        pv.addEventListener("input", refreshEditorMediaStrip);
      }
      refreshEditorMediaStrip();
    }

    function mdWrapDelimiter(ta, delim, placeholder) {
      var start = ta.selectionStart;
      var end = ta.selectionEnd;
      var val = ta.value;
      var sel = val.slice(start, end);
      var mid = sel.length ? sel : placeholder;
      var insert = delim + mid + delim;
      ta.value = val.slice(0, start) + insert + val.slice(end);
      ta.focus();
      var innerStart = start + delim.length;
      var innerEnd = innerStart + mid.length;
      ta.setSelectionRange(innerStart, innerEnd);
      schedulePreview();
    }

    function mdInsertLink(ta) {
      var start = ta.selectionStart;
      var end = ta.selectionEnd;
      var val = ta.value;
      var sel = val.slice(start, end);
      var url = window.prompt("Link URL", "https://");
      if (url === null) return;
      url = String(url).trim();
      if (!url) return;
      var text = sel.length ? sel : "link text";
      var insert = "[" + text + "](" + url + ")";
      ta.value = val.slice(0, start) + insert + val.slice(end);
      ta.focus();
      if (!sel.length) {
        ta.setSelectionRange(start + 1, start + 1 + text.length);
      } else {
        ta.setSelectionRange(start + insert.length, start + insert.length);
      }
      schedulePreview();
    }

    function bindMarkdownTools() {
      var ta = document.getElementById("pf-body");
      if (!ta) return;
      function wireTool(id, fn) {
        var b = document.getElementById(id);
        if (!b) return;
        b.addEventListener("click", fn);
      }
      wireTool("md-tool-bold", function() {
        mdWrapDelimiter(ta, "**", "bold");
      });
      wireTool("md-tool-italic", function() {
        mdWrapDelimiter(ta, "*", "italic");
      });
      wireTool("md-tool-link", function() {
        mdInsertLink(ta);
      });
      ta.addEventListener("keydown", function(ev) {
        var mod = ev.metaKey || ev.ctrlKey;
        if (!mod || ev.altKey) return;
        var k = ev.key && ev.key.toLowerCase();
        if (k === "b") {
          ev.preventDefault();
          mdWrapDelimiter(ta, "**", "bold");
        } else if (k === "i") {
          ev.preventDefault();
          mdWrapDelimiter(ta, "*", "italic");
        } else if (k === "k") {
          ev.preventDefault();
          mdInsertLink(ta);
        }
      });
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
      var mainEl = document.querySelector(".admin-main");
      if (mainEl) mainEl.scrollTop = 0;
      try {
        window.scrollTo(0, 0);
      } catch (e2) {}
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
      var ids = [
        "overlay-collab",
        "overlay-client",
        "overlay-edit-collab",
        "overlay-edit-client",
        "overlay-project-settings",
        "overlay-api-docs",
      ];
      var anyOpen = ids.some(function(id) {
        var el = document.getElementById(id);
        return el && !el.hidden;
      });
      if (!anyOpen) document.body.classList.remove("admin-overlay-open");
    }

    function openOverlay(id) {
      var el = document.getElementById(id);
      if (!el) return;
      overlayFocusReturn = document.activeElement;
      el.hidden = false;
      el.setAttribute("aria-hidden", "false");
      document.body.classList.add("admin-overlay-open");
      var input =
        id === "overlay-project-settings" ?
          document.getElementById("pf-title")
        : id === "overlay-api-docs" ?
          document.querySelector("#overlay-api-docs .admin-overlay__close")
        : id === "overlay-edit-collab" ?
          document.getElementById("tf-edit-name")
        : id === "overlay-edit-client" ?
          document.getElementById("cf-edit-name")
        : el.querySelector("input[name=name], input");
      if (input && typeof input.focus === "function") input.focus();
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
      function wireOpen(btnId, overlayId) {
        var btn = document.getElementById(btnId);
        if (!btn) return;
        btn.addEventListener("click", function() {
          openOverlay(overlayId);
        });
      }
      wireOpen("open-collab-overlay", "overlay-collab");
      wireOpen("open-client-overlay", "overlay-client");
      wireOpen("open-project-settings", "overlay-project-settings");
      wireOpen("open-api-docs", "overlay-api-docs");
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
        if (ev.key === "Escape") {
          var oapi = document.getElementById("overlay-api-docs");
          var os = document.getElementById("overlay-project-settings");
          var oecc = document.getElementById("overlay-edit-collab");
          var oecl = document.getElementById("overlay-edit-client");
          var oc = document.getElementById("overlay-collab");
          var ol = document.getElementById("overlay-client");
          if (oapi && !oapi.hidden) closeOverlay("overlay-api-docs");
          else if (os && !os.hidden) closeOverlay("overlay-project-settings");
          else if (oecc && !oecc.hidden) closeOverlay("overlay-edit-collab");
          else if (oecl && !oecl.hidden) closeOverlay("overlay-edit-client");
          else if (oc && !oc.hidden) closeOverlay("overlay-collab");
          else if (ol && !ol.hidden) closeOverlay("overlay-client");
          return;
        }
        if ((ev.metaKey || ev.ctrlKey) && (ev.key === "s" || ev.key === "S")) {
          var form = document.getElementById("proj-form");
          if (form) {
            ev.preventDefault();
            if (typeof form.requestSubmit === "function") form.requestSubmit();
            else form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
          }
        }
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

    function appendCollaboratorTeamBlock(wrap, m, checked) {
      var block = document.createElement("div");
      block.className = "admin-collab-team-block";

      var row = document.createElement("label");
      row.className = "admin-collab-row";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = m.id;
      cb.checked = checked;
      var span = document.createElement("span");
      span.className = "admin-collab-row__text";
      span.textContent = m.name + (m.role ? " — " + m.role : "");
      var sid = document.createElement("span");
      sid.className = "admin-collab-row__id";
      sid.textContent = m.id;
      row.appendChild(cb);
      row.appendChild(span);
      row.appendChild(sid);

      var roleWrap = document.createElement("div");
      roleWrap.className = "admin-collab-team-role";
      roleWrap.hidden = !checked;
      var rin = document.createElement("input");
      rin.type = "text";
      rin.className = "admin-collab-team-role__input";
      rin.placeholder = "Role on project (optional)";
      rin.value = teamPickRoles[m.id] ? teamPickRoles[m.id] : "";
      rin.setAttribute("aria-label", "Role on project for " + (m.name || m.id));
      rin.addEventListener("input", function() {
        var v = rin.value.trim();
        if (v) teamPickRoles[m.id] = v;
        else delete teamPickRoles[m.id];
      });

      roleWrap.appendChild(rin);

      cb.addEventListener("change", function(ev) {
        var box = ev.target;
        var id = box.value;
        if (box.checked) {
          if (teamPickOrder.indexOf(id) === -1) teamPickOrder.push(id);
          roleWrap.hidden = false;
        } else {
          teamPickOrder = teamPickOrder.filter(function(x) {
            return x !== id;
          });
          delete teamPickRoles[id];
          rin.value = "";
          roleWrap.hidden = true;
        }
        syncTeamPickHidden();
      });

      block.appendChild(row);
      block.appendChild(roleWrap);
      wrap.appendChild(block);
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

    function hydrateTeamPick(ids, roles) {
      teamPickOrder = (ids || []).slice();
      teamPickRoles = {};
      if (roles && typeof roles === "object") {
        for (var k in roles) {
          if (!Object.prototype.hasOwnProperty.call(roles, k)) continue;
          var rv = String(roles[k] || "").trim();
          if (rv) teamPickRoles[k] = rv;
        }
      }
      syncTeamPickHidden();
      renderCollaboratorPicker(cachedTeamMembers);
    }

    function collectTeamMemberRolesPayload() {
      var out = {};
      teamPickOrder.forEach(function(id) {
        var v = teamPickRoles[id];
        if (v && String(v).trim()) out[id] = String(v).trim();
      });
      return out;
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
        appendCollaboratorTeamBlock(wrap, m, teamPickOrder.indexOf(m.id) !== -1);
      });
      syncTeamPickHidden();
    }

    function fillCfEditParentSelect(selectedParentId, excludeClientId) {
      var sel = document.getElementById("cf-edit-parent");
      if (!sel) return;
      while (sel.options.length > 1) sel.remove(1);
      cachedClients.forEach(function(c) {
        if (c.id === excludeClientId) return;
        var po = document.createElement("option");
        po.value = c.id;
        po.textContent = c.name + " · " + c.id;
        sel.appendChild(po);
      });
      var want = selectedParentId && selectedParentId !== excludeClientId ? selectedParentId : "";
      var ok = false;
      if (want) {
        for (var oi = 0; oi < sel.options.length; oi++) {
          if (sel.options[oi].value === want) {
            ok = true;
            break;
          }
        }
      }
      sel.value = ok ? want : "";
    }

    function openEditCollaboratorOverlay(m) {
      var hid = document.getElementById("tf-edit-id");
      var nf = document.getElementById("tf-edit-name");
      var rf = document.getElementById("tf-edit-role");
      var uf = document.getElementById("tf-edit-url");
      if (hid) hid.value = m.id;
      if (nf) nf.value = m.name || "";
      if (rf) rf.value = m.role || "";
      if (uf) uf.value = m.url || "";
      openOverlay("overlay-edit-collab");
    }

    function openEditClientOverlay(c) {
      var hid = document.getElementById("cf-edit-id");
      var nf = document.getElementById("cf-edit-name");
      var uf = document.getElementById("cf-edit-url");
      if (hid) hid.value = c.id;
      if (nf) nf.value = c.name || "";
      if (uf) uf.value = c.url || "";
      fillCfEditParentSelect(c.parent_client_id || "", c.id);
      openOverlay("overlay-edit-client");
    }

    async function deleteCollaborator(m) {
      var label = m.name ? '"' + m.name + '"' : m.id;
      if (!confirm("Remove collaborator " + label + " from the directory? They may still appear on saved projects until you edit those projects.")) return;
      var r = await j("/admin/api/team/members/" + m.id, { method: "DELETE" });
      if (!r.ok) {
        alert("Could not delete collaborator.");
        return;
      }
      await loadLists();
    }

    async function deleteClient(c) {
      var label = c.name ? '"' + c.name + '"' : c.id;
      if (!confirm("Remove client " + label + " from the directory? Projects may still reference this id until you edit them.")) return;
      var r = await j("/admin/api/clients/" + c.id, { method: "DELETE" });
      if (!r.ok) {
        alert("Could not delete client.");
        return;
      }
      await loadLists();
    }

    function fillTeamList(members) {
      var ul = document.getElementById("team-list");
      if (!ul) return;
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
        li.className = "admin-list__row";
        var main = document.createElement("div");
        main.className = "admin-list__main";
        var line = document.createElement("span");
        line.className = "admin-list__line";
        line.textContent = m.name + (m.role ? " — " + m.role : "");
        var meta = document.createElement("span");
        meta.className = "admin-list__meta";
        meta.textContent = m.id;
        main.appendChild(line);
        main.appendChild(meta);
        var actions = document.createElement("div");
        actions.className = "admin-list__actions";
        var editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "admin-list__btn";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", function() {
          openEditCollaboratorOverlay(m);
        });
        var delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "admin-list__btn admin-list__btn--danger";
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", function() {
          deleteCollaborator(m);
        });
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        li.appendChild(main);
        li.appendChild(actions);
        ul.appendChild(li);
      });
    }

    function fillClientsList(clients) {
      var ul = document.getElementById("clients-list");
      if (!ul) return;
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
        li.className = "admin-list__row";
        var main = document.createElement("div");
        main.className = "admin-list__main";
        var line = document.createElement("span");
        line.className = "admin-list__line";
        line.textContent = c.name;
        var meta = document.createElement("span");
        meta.className = "admin-list__meta";
        var parts = [];
        if (c.parent_client_id && byId[c.parent_client_id]) {
          parts.push("via " + byId[c.parent_client_id].name);
        }
        parts.push(c.id);
        meta.textContent = parts.join(" · ");
        main.appendChild(line);
        main.appendChild(meta);
        var actions = document.createElement("div");
        actions.className = "admin-list__actions";
        var editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "admin-list__btn";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", function() {
          openEditClientOverlay(c);
        });
        var delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "admin-list__btn admin-list__btn--danger";
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", function() {
          deleteClient(c);
        });
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        li.appendChild(main);
        li.appendChild(actions);
        ul.appendChild(li);
      });
    }

    async function loadLists() {
      var tm;
      var cl;
      var pr;
      try {
        var batch = await Promise.all([
          j("/admin/api/team/members"),
          j("/admin/api/clients"),
          j("/admin/api/projects"),
        ]);
        tm = batch[0];
        cl = batch[1];
        pr = batch[2];
      } catch (err) {
        console.error("loadLists fetch failed", err);
        setProjSaveStatus("error", "Could not load directory — refresh or check your connection.");
        return false;
      }
      if (!tm.ok || !cl.ok || !pr.ok) {
        console.error("loadLists bad status", tm.status, cl.status, pr.status);
        setProjSaveStatus("error", "Could not load projects (" + pr.status + "). Try refreshing.");
        return false;
      }
      var team;
      var clients;
      var projects;
      try {
        team = await tm.json();
        clients = await cl.json();
        projects = await pr.json();
      } catch (err2) {
        console.error("loadLists JSON failed", err2);
        setProjSaveStatus("error", "Invalid response from server.");
        return false;
      }

      fillTeamList(team.members || []);
      fillClientsList(clients.clients || []);
      cachedClients = clients.clients || [];
      cachedTeamMembers = team.members || [];
      renderClientPicker(cachedClients);
      renderCollaboratorPicker(cachedTeamMembers);

      var sel = document.getElementById("proj-select");
      if (sel) {
        while (sel.options.length > 1) sel.remove(1);
        (projects.projects || []).forEach(function(p) {
          var o = document.createElement("option");
          o.value = p.id;
          o.textContent = p.title + " · " + p.id;
          sel.appendChild(o);
        });
      }

      var cfParent = document.getElementById("cf-parent");
      if (cfParent) {
        while (cfParent.options.length > 1) cfParent.remove(1);
        cachedClients.forEach(function(c) {
          var po = document.createElement("option");
          po.value = c.id;
          po.textContent = c.name + " · " + c.id;
          cfParent.appendChild(po);
        });
      }
      return true;
    }

    function collectGalleryFromEditor() {
      var wrap = document.getElementById("gallery-rows");
      if (!wrap) return [];
      var out = [];
      wrap.querySelectorAll(".admin-gallery-row").forEach(function(row) {
        var urlEl = row.querySelector(".admin-gallery-url");
        var url = urlEl ? String(urlEl.value || "").trim() : "";
        if (!url) return;
        var capEl = row.querySelector(".admin-gallery-caption");
        var altEl = row.querySelector(".admin-gallery-alt");
        var cap = capEl ? String(capEl.value || "").trim() : "";
        var alt = altEl ? String(altEl.value || "").trim() : "";
        var o = { url: url };
        if (cap) o.caption = cap;
        if (alt) o.alt = alt;
        out.push(o);
      });
      return out;
    }

    function updateGalleryChrome() {
      var wrap = document.getElementById("gallery-rows");
      var empty = document.getElementById("gallery-list-empty");
      var countEl = document.getElementById("gallery-count");
      if (!wrap || !empty) return;
      var n = wrap.querySelectorAll(".admin-gallery-row").length;
      empty.hidden = n > 0;
      if (countEl) {
        countEl.textContent = n ? String(n) : "";
        countEl.setAttribute("aria-label", n ? n + " images in gallery" : "No images");
      }
    }

    function syncGalleryRowThumb(row) {
      var urlInp = row.querySelector(".admin-gallery-url");
      var img = row.querySelector(".admin-gallery-thumb-img");
      var ph = row.querySelector(".admin-gallery-thumb-ph");
      if (!urlInp || !img || !ph) return;
      var url = String(urlInp.value || "").trim();
      if (!url) {
        img.removeAttribute("src");
        img.hidden = true;
        ph.hidden = false;
        return;
      }
      img.hidden = false;
      ph.hidden = true;
      img.alt = "";
      img.src = url;
    }

    function refreshGalleryLivePreview() {
      var grid = document.getElementById("gallery-live-preview");
      var emptyEl = document.getElementById("gallery-live-empty");
      if (!grid || !emptyEl) return;
      var items = collectGalleryFromEditor();
      grid.textContent = "";
      if (!items.length) {
        emptyEl.hidden = false;
        updateGalleryChrome();
        return;
      }
      emptyEl.hidden = true;
      items.forEach(function(it) {
        var fig = document.createElement("figure");
        var img = document.createElement("img");
        img.src = it.url;
        img.alt = it.alt || "";
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        img.addEventListener("error", function() {
          img.alt = "Could not load";
          img.style.opacity = "0.35";
        });
        fig.appendChild(img);
        if (it.caption) {
          var fc = document.createElement("figcaption");
          fc.textContent = it.caption;
          fig.appendChild(fc);
        }
        grid.appendChild(fig);
      });
      updateGalleryChrome();
      refreshEditorMediaStrip();
    }

    function bindGalleryRowListeners(row) {
      row.querySelectorAll("input").forEach(function(inp) {
        inp.addEventListener("input", function() {
          if (inp.classList.contains("admin-gallery-url")) syncGalleryRowThumb(row);
          refreshGalleryLivePreview();
        });
      });
    }

    var galleryDragRow = null;

    function galleryDragAfterElement(container, y) {
      var els = [].slice.call(container.querySelectorAll(".admin-gallery-row:not(.admin-gallery-row--dragging)"));
      var closest = els.reduce(
        function(acc, child) {
          var box = child.getBoundingClientRect();
          var offset = y - box.top - box.height / 2;
          if (offset < 0 && offset > acc.offset) {
            return { offset: offset, element: child };
          }
          return acc;
        },
        { offset: Number.NEGATIVE_INFINITY, element: undefined },
      );
      return closest.element;
    }

    function initGalleryDnD() {
      var wrap = document.getElementById("gallery-rows");
      if (!wrap || wrap.getAttribute("data-gallery-dnd") === "1") return;
      wrap.setAttribute("data-gallery-dnd", "1");
      wrap.addEventListener("dragover", function(ev) {
        ev.preventDefault();
        if (!galleryDragRow) return;
        ev.dataTransfer.dropEffect = "move";
        var after = galleryDragAfterElement(wrap, ev.clientY);
        if (after == null) wrap.appendChild(galleryDragRow);
        else wrap.insertBefore(galleryDragRow, after);
      });
    }

    function bindGalleryRowGrip(row, grip) {
      grip.addEventListener("dragstart", function(ev) {
        galleryDragRow = row;
        row.classList.add("admin-gallery-row--dragging");
        grip.setAttribute("aria-grabbed", "true");
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.setData("text/plain", "gallery");
      });
      grip.addEventListener("dragend", function() {
        row.classList.remove("admin-gallery-row--dragging");
        grip.setAttribute("aria-grabbed", "false");
        galleryDragRow = null;
        refreshGalleryLivePreview();
      });
    }

    function appendGalleryRow(item, skipPreview) {
      item = item || {};
      var wrap = document.getElementById("gallery-rows");
      if (!wrap) return;

      var row = document.createElement("div");
      row.className = "admin-gallery-row";
      row.setAttribute("role", "listitem");

      var grip = document.createElement("button");
      grip.type = "button";
      grip.className = "admin-gallery-grip";
      grip.draggable = true;
      grip.setAttribute("aria-label", "Drag to reorder");
      grip.setAttribute("aria-grabbed", "false");
      grip.innerHTML =
        '<span class="admin-gallery-grip__bars" aria-hidden="true"></span><span class="admin-gallery-grip__bars" aria-hidden="true"></span>';
      bindGalleryRowGrip(row, grip);

      var thumb = document.createElement("div");
      thumb.className = "admin-gallery-thumb";
      var img = document.createElement("img");
      img.className = "admin-gallery-thumb-img";
      img.alt = "";
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.hidden = true;
      var ph = document.createElement("span");
      ph.className = "admin-gallery-thumb-ph";
      ph.textContent = "";
      ph.setAttribute("aria-hidden", "true");
      img.addEventListener("error", function() {
        img.hidden = true;
        ph.hidden = false;
      });
      thumb.appendChild(img);
      thumb.appendChild(ph);

      var main = document.createElement("div");
      main.className = "admin-gallery-row__main";

      var urlInp = document.createElement("input");
      urlInp.type = "text";
      urlInp.className = "admin-gallery-url";
      urlInp.placeholder = "Image URL";
      urlInp.autocomplete = "off";
      urlInp.inputMode = "url";
      urlInp.value = item.url || "";

      var capInp = document.createElement("input");
      capInp.type = "text";
      capInp.className = "admin-gallery-caption";
      capInp.placeholder = "Caption — optional, shown under the image";
      capInp.autocomplete = "off";
      capInp.value = item.caption || "";

      var det = document.createElement("details");
      det.className = "admin-gallery-more";
      var sum = document.createElement("summary");
      sum.className = "admin-gallery-more-summary";
      sum.textContent = "Accessibility";
      var altInp = document.createElement("input");
      altInp.type = "text";
      altInp.className = "admin-gallery-alt";
      altInp.placeholder = "Describe the image for screen readers";
      altInp.autocomplete = "off";
      altInp.value = item.alt || "";
      det.appendChild(sum);
      det.appendChild(altInp);

      main.appendChild(urlInp);
      main.appendChild(capInp);
      main.appendChild(det);

      var rm = document.createElement("button");
      rm.type = "button";
      rm.className = "admin-gallery-remove";
      rm.setAttribute("aria-label", "Remove from gallery");
      rm.innerHTML = "&times;";
      rm.addEventListener("click", function() {
        row.remove();
        refreshGalleryLivePreview();
      });

      row.appendChild(grip);
      row.appendChild(thumb);
      row.appendChild(main);
      row.appendChild(rm);
      wrap.appendChild(row);

      bindGalleryRowListeners(row);
      syncGalleryRowThumb(row);
      if (!skipPreview) refreshGalleryLivePreview();
      else updateGalleryChrome();
    }

    function renderGalleryEditor(items) {
      var wrap = document.getElementById("gallery-rows");
      if (!wrap) return;
      wrap.textContent = "";
      var arr = Array.isArray(items) ? items : [];
      arr.forEach(function(it) {
        appendGalleryRow(it, true);
      });
      refreshGalleryLivePreview();
    }

    function tryAddGalleryFromComposer() {
      var inp = document.getElementById("gallery-url-input");
      if (!inp) return;
      var url = String(inp.value || "").trim();
      if (!url) return;
      appendGalleryRow({ url: url }, false);
      inp.value = "";
      inp.focus();
    }

    function initGalleryComposerAndDnD() {
      initGalleryDnD();
      var inp = document.getElementById("gallery-url-input");
      var btn = document.getElementById("gallery-add-from-input");
      if (inp && btn) {
        btn.addEventListener("click", tryAddGalleryFromComposer);
        inp.addEventListener("keydown", function(ev) {
          if (ev.key === "Enter") {
            ev.preventDefault();
            tryAddGalleryFromComposer();
          }
        });
      }
    }

    async function loadProject(id) {
      if (!id) {
        document.getElementById("proj-form").reset();
        clientPickOrder = [];
        viaPickOrder = [];
        syncClientPickHidden();
        syncViaPickHidden();
        hydrateTeamPick([], {});
        renderClientPicker(cachedClients);
        renderGalleryEditor([]);
        previewPlaceholder();
        return;
      }
      var r = await j("/admin/api/projects/" + id);
      if (!r.ok) {
        setProjSaveStatus("error", "Could not load project (" + r.status + ").");
        return;
      }
      var p = await r.json();
      var pfTitle = document.getElementById("pf-title");
      var pfSummary = document.getElementById("pf-summary");
      var pfTags = document.getElementById("pf-tags");
      var pfSort = document.getElementById("pf-sort");
      var pfPreview = document.getElementById("pf-preview");
      var pfBody = document.getElementById("pf-body");
      if (pfTitle) pfTitle.value = p.title || "";
      if (pfSummary) pfSummary.value = p.summary || "";
      if (pfTags) pfTags.value = (p.tags || []).join(", ");
      var cids = (p.client_ids && p.client_ids.length) ? p.client_ids.slice() : (p.client_id ? [p.client_id] : []);
      clientPickOrder = cids.slice();
      syncClientPickHidden();
      viaPickOrder = (p.via_client_ids || []).slice();
      pruneViaPickAgainstPrimaries();
      syncViaPickHidden();
      renderClientPicker(cachedClients);
      hydrateTeamPick(p.team_member_ids || [], p.team_member_roles);
      if (pfSort) pfSort.value = p.sort_date || "";
      if (pfPreview) pfPreview.value = p.preview_image || "";
      renderGalleryEditor(p.gallery_images || []);
      if (pfBody) pfBody.value = p.body || "";
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
      var nf = document.getElementById("tf-name");
      var rf = document.getElementById("tf-role");
      var uf = document.getElementById("tf-url");
      var r = await j("/admin/api/team/members", {
        method: "POST",
        body: JSON.stringify({
          name: nf ? nf.value : "",
          role: rf && rf.value ? rf.value : undefined,
          url: uf && uf.value ? uf.value : undefined,
        }),
      });
      if (!r.ok) return;
      ev.target.reset();
      if (!(await loadLists())) return;
      closeOverlay("overlay-collab");
    });

    document.getElementById("client-form").addEventListener("submit", async function(ev) {
      ev.preventDefault();
      var cn = document.getElementById("cf-name");
      var curl = document.getElementById("cf-url");
      var cp = document.getElementById("cf-parent");
      var r = await j("/admin/api/clients", {
        method: "POST",
        body: JSON.stringify({
          name: cn ? cn.value : "",
          url: curl && curl.value ? curl.value : undefined,
          parent_client_id: cp && cp.value ? cp.value : undefined,
        }),
      });
      if (!r.ok) return;
      ev.target.reset();
      if (!(await loadLists())) return;
      closeOverlay("overlay-client");
    });

    document.getElementById("team-edit-form").addEventListener("submit", async function(ev) {
      ev.preventDefault();
      var hid = document.getElementById("tf-edit-id");
      var editId = hid ? hid.value : "";
      if (!editId) return;
      var nf = document.getElementById("tf-edit-name");
      var rf = document.getElementById("tf-edit-role");
      var uf = document.getElementById("tf-edit-url");
      var r = await j("/admin/api/team/members/" + editId, {
        method: "PUT",
        body: JSON.stringify({
          name: nf ? nf.value.trim() : "",
          role: rf ? rf.value : "",
          url: uf ? uf.value : "",
        }),
      });
      if (!r.ok) return;
      if (!(await loadLists())) return;
      closeOverlay("overlay-edit-collab");
    });

    document.getElementById("client-edit-form").addEventListener("submit", async function(ev) {
      ev.preventDefault();
      var hid = document.getElementById("cf-edit-id");
      var editId = hid ? hid.value : "";
      if (!editId) return;
      var cn = document.getElementById("cf-edit-name");
      var curl = document.getElementById("cf-edit-url");
      var cp = document.getElementById("cf-edit-parent");
      var r = await j("/admin/api/clients/" + editId, {
        method: "PUT",
        body: JSON.stringify({
          name: cn ? cn.value.trim() : "",
          url: curl ? curl.value.trim() : "",
          parent_client_id: cp ? cp.value : "",
        }),
      });
      if (!r.ok) return;
      if (!(await loadLists())) return;
      closeOverlay("overlay-edit-client");
    });

    document.getElementById("proj-form").addEventListener("submit", async function(ev) {
      ev.preventDefault();
      var btn = document.getElementById("btn-save");
      var selEl = document.getElementById("proj-select");
      var id = selEl ? selEl.value : "";
      var pfTitle = document.getElementById("pf-title");
      var pfSummary = document.getElementById("pf-summary");
      var pfTags = document.getElementById("pf-tags");
      var pfSort = document.getElementById("pf-sort");
      var pfPreview = document.getElementById("pf-preview");
      var pfBody = document.getElementById("pf-body");
      var titleVal = pfTitle ? String(pfTitle.value || "").trim() : "";
      if (!titleVal) {
        setProjSaveStatus("error", "Add a title in Settings, then save.");
        openOverlay("overlay-project-settings");
        return;
      }
      var tagsRaw = pfTags ? pfTags.value : "";
      var tags = String(tagsRaw || "")
        .split(",")
        .map(function(s) {
          return s.trim();
        })
        .filter(Boolean);
      syncTeamPickHidden();
      var teamIds = teamPickOrder.slice();
      syncClientPickHidden();
      var clientIds = clientPickOrder.slice();
      var viaIds = computeViaIds();
      var payload = {
        title: titleVal,
        summary: pfSummary ? pfSummary.value : "",
        tags: tags,
        client_ids: clientIds,
        via_client_ids: viaIds,
        sort_date: pfSort && pfSort.value ? pfSort.value : undefined,
        preview_image: pfPreview && pfPreview.value ? pfPreview.value : undefined,
        team_member_ids: teamIds,
        gallery_images: collectGalleryFromEditor(),
        body: pfBody ? pfBody.value : "",
        team_member_roles: collectTeamMemberRolesPayload(),
      };

      var st = document.getElementById("proj-save-status");
      clearTimeout(projSaveStatusTimer);
      if (st) {
        st.classList.remove("is-success", "is-error");
        st.textContent = "Saving…";
      }
      if (btn) btn.disabled = true;

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

        if (!(await loadLists())) return;

        var sel = document.getElementById("proj-select");
        var nextId = id || (saved && saved.id ? saved.id : "");
        if (sel && nextId) sel.value = nextId;
        await loadProject(sel && sel.value ? sel.value : "");

        var timeStr = new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit" });
        setProjSaveStatus("success", "Saved · " + timeStr);
      } catch (err) {
        setProjSaveStatus("error", "Network error — try again.");
      } finally {
        if (btn) btn.disabled = false;
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
      if (!(await loadLists())) return;
      loadProject("");
    });

    document.getElementById("pf-body").addEventListener("input", schedulePreview);

    bindMarkdownTools();

    initGalleryComposerAndDnD();

    initEditorMediaRail();

    loadLists().then(function(ok) {
      if (!ok) return;
      var sel = document.getElementById("proj-select");
      return loadProject(sel && sel.value ? sel.value : "");
    });
    previewPlaceholder();
  </script>`;

  return layoutPage("Admin", inner, { bodyClass: "admin-app" });
}

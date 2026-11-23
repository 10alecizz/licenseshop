import { License } from './types/license.js';
import { LicenseController } from './controllers/licenseController.js';

class App {
  async init() {
    this.$ = id => document.getElementById(id);
    try {
      const res = await fetch('data/licenses.json');
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      this.controller = new LicenseController(data.map(d => new License(d)));
    } catch (err) {
      document.querySelector('main').insertAdjacentHTML('beforeend',
        `<p class="empty">No se pudieron cargar las licencias. Abre la web desde un servidor local
         (por ejemplo <code>python -m http.server</code>) en lugar de abrir el archivo directamente.</p>`);
      console.error(err);
      return;
    }
    this.setupFilters();
    this.renderSections();
    this.scrambleKey(this.$('hero-key'), this.controller.licenses[0].key);
  }

  /** Decide qué secciones se pintan y en qué orden. */
  renderSections() {
    const c = this.controller;
    c.RenderFeatured(3, this.$('featured-grid'));
    c.RenderOffers(3, this.$('offers-grid'));
    c.RenderLatest(3, this.$('latest-grid'));
    this.renderAll();
  }

  get filters() {
    const f = new FormData(this.$('filters'));
    return { q: f.get('q'), category: f.get('category'), software: f.get('software'),
             maxPrice: +f.get('maxPrice'), sort: f.get('sort'), onlyOffers: f.has('onlyOffers') };
  }

  renderAll(reshuffle = false) {
    const c = this.controller;
    const n = c.RenderAll(c.licenses.length, this.$('all-grid'), this.filters, reshuffle);
    this.$('result-count').textContent = `${n} de ${c.licenses.length} licencias`;
    this.$('price-out').textContent = `hasta ${this.filters.maxPrice} €`;
  }

  setupFilters() {
    const form = this.$('filters'), c = this.controller;
    const fill = (name, items) => form.elements[name].append(...items.map(v => new Option(v, v)));
    fill('category', c.categories);
    fill('software', c.softwares);
    form.elements.maxPrice.max = form.elements.maxPrice.value = c.maxPrice;
    form.addEventListener('input', () => this.renderAll());
    form.addEventListener('submit', e => e.preventDefault());
    this.$('reshuffle').addEventListener('click', () => {
      form.elements.sort.value = 'random';
      this.renderAll(true);
    });
  }

  /** Animación única de la portada: la clave se "descifra" al cargar. */
  scrambleKey(el, target) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = target; return; }
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    let i = 0;
    const t = setInterval(() => {
      el.textContent = [...target].map((ch, k) =>
        ch === '-' || k < i ? ch : chars[Math.floor(Math.random() * chars.length)]).join('');
      if (++i > target.length) clearInterval(t);
    }, 70);
  }
}

new App().init();

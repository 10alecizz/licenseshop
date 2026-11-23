const cmpVersion = (a, b) => a.localeCompare(b, undefined, { numeric: true });

export class LicenseController {
  constructor(licenses) {
    this.licenses = licenses;
    this.order = this.#shuffle([...licenses]);
  }

  get categories() { return [...new Set(this.licenses.map(l => l.category))].sort(); }
  get softwares()  { return [...new Set(this.licenses.map(l => l.software))].sort(); }
  get maxPrice()   { return Math.ceil(Math.max(...this.licenses.map(l => l.finalPrice))); }

  #shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  #draw(list, parent) {
    parent.replaceChildren();
    list.forEach(l => l.Render(parent));
  }

  RenderFeatured(count, parent) {
    this.#draw(this.licenses.filter(l => l.featured).slice(0, count), parent);
  }

  RenderOffers(count, parent) {
    const offers = this.licenses.filter(l => l.discount > 0)
      .sort((a, b) => b.discount - a.discount);
    this.#draw(offers.slice(0, count), parent);
  }

  RenderLatest(count, parent) {
    const latest = new Map();
    for (const l of this.licenses) {
      const cur = latest.get(l.software);
      if (!cur || cmpVersion(l.version, cur.version) > 0) latest.set(l.software, l);
    }
    const list = [...latest.values()].sort((a, b) => b.released.localeCompare(a.released));
    this.#draw(list.slice(0, count), parent);
  }

  /** Orden aleatorio por defecto; admite filtros y orden. Devuelve cuántas licencias coinciden. */
  RenderAll(count, parent, f = {}, reshuffle = false) {
    if (reshuffle) this.#shuffle(this.order);
    const q = (f.q || '').trim().toLowerCase();
    let list = this.order.filter(l =>
      (!q || l.software.toLowerCase().includes(q)) &&
      (!f.category || l.category === f.category) &&
      (!f.software || l.software === f.software) &&
      (!f.maxPrice || l.finalPrice <= f.maxPrice) &&
      (!f.onlyOffers || l.discount > 0));
    const sorts = {
      'price-asc':  (a, b) => a.finalPrice - b.finalPrice,
      'price-desc': (a, b) => b.finalPrice - a.finalPrice,
      'discount':   (a, b) => b.discount - a.discount
    };
    if (sorts[f.sort]) list = list.sort(sorts[f.sort]);
    this.#draw(list.slice(0, count), parent);
    if (!list.length) parent.innerHTML = '<p class="empty">Ninguna licencia coincide. Prueba a quitar algún filtro.</p>';
    return list.length;
  }
}

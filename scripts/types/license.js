const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

export class License {
  constructor({ id, software, version, price, key, featured = false, discount = 0,
                category = '', color = '#2B3AF0', released = '' }) {
    Object.assign(this, { id, software, version, price, key, featured, discount, category, color, released });
  }

  get finalPrice() {
    return +(this.price * (1 - this.discount / 100)).toFixed(2);
  }

  /** Dibuja la tarjeta del producto dentro de `parent`. */
  Render(parent) {
    const el = document.createElement('article');
    el.className = 'license';
    el.style.setProperty('--c', this.color);
    el.innerHTML = `
      <div class="license-mark" aria-hidden="true">${this.software[0]}</div>
      <div class="license-body">
        <p class="license-cat">${this.category}</p>
        <h3>${this.software} <span class="version">${this.version}</span></h3>
        <div class="license-foot">
          <p class="price">
            <strong>${eur.format(this.finalPrice)}</strong>
            ${this.discount ? `<s>${eur.format(this.price)}</s>` : ''}
          </p>
          <button type="button" class="buy">Comprar</button>
        </div>
      </div>
      ${this.discount ? `<span class="sale">-${this.discount}%</span>` : ''}
      ${this.featured ? '<span class="star" title="Destacada">★</span>' : ''}`;
    el.querySelector('.buy').addEventListener('click', () => this.Buy());
    parent.appendChild(el);
    return el;
  }

  /** Muestra la clave de la licencia en una ventanita. */
  Buy() {
    let dlg = document.getElementById('buy-dialog');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'buy-dialog';
      document.body.appendChild(dlg);
    }
    dlg.innerHTML = `
      <h2>Compra completada</h2>
      <p>${this.software} ${this.version} · ${eur.format(this.finalPrice)}</p>
      <code class="key">${this.key}</code>
      <div class="dialog-actions">
        <button type="button" class="copy">Copiar clave</button>
        <button type="button" class="close secondary">Cerrar</button>
      </div>`;
    const copy = dlg.querySelector('.copy');
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(this.key); copy.textContent = 'Copiada'; }
      catch { copy.textContent = 'Selecciona y copia'; }
    });
    dlg.querySelector('.close').addEventListener('click', () => dlg.close());
    dlg.onclick = e => { if (e.target === dlg) dlg.close(); };
    dlg.showModal();
  }
}

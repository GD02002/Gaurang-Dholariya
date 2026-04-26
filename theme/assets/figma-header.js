if (!customElements.get('figma-header-toggle')) {
    customElements.define(
      'figma-header-toggle',
      class FigmaHeaderToggle extends HTMLElement {
        connectedCallback() {
          this.container = this.closest('[data-figma-header]');
          if (!this.container) return;
  
          this.button = this.container.querySelector('[data-figma-header-toggle]');
          this.panel = this.container.querySelector('.figma-header__mobile-panel');
          if (!this.button || !this.panel) return;
  
          this.button.addEventListener('click', () => this.toggle());
        }
  
        toggle() {
          const isOpen = this.container.classList.toggle('is-open');
          this.panel.hidden = !isOpen;
          this.button.setAttribute('aria-expanded', String(isOpen));
        }
      }
    );
  }
  
  document.querySelectorAll('[data-figma-header]').forEach((container) => {
    const existing = container.querySelector('figma-header-toggle');
    if (existing) return;
  
    const controller = document.createElement('figma-header-toggle');
    controller.style.display = 'none';
    container.appendChild(controller);
  });
  
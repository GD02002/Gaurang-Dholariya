if (!customElements.get('hotspot-collection')) {
    customElements.define(
      'hotspot-collection',
      class HotspotCollection extends HTMLElement {
        constructor() {
          super();
          this.activeModal = null;
          this.openedBy = null;
          this.onKeyUp = this.onKeyUp.bind(this);
        }
  
        connectedCallback() {
          this.querySelectorAll('[data-hotspot-open]').forEach((button) => {
            button.addEventListener('click', () => this.openModal(button.getAttribute('data-hotspot-open'), button));
          });
  
          this.initDynamicSwatchColors();
  
          this.querySelectorAll('.hotspot-modal').forEach((modal) => {
            modal.querySelectorAll('[data-hotspot-close]').forEach((closeButton) => {
              closeButton.addEventListener('click', () => this.closeModal(modal));
            });
            this.initCustomDropdowns(modal);
            this.initVariantPicker(modal);
          });
        }
  
        initCustomDropdowns(modal) {
          const dropdowns = modal.querySelectorAll('.hotspot-modal__select-wrap');
          dropdowns.forEach((dropdown) => {
            const trigger = dropdown.querySelector('[data-hotspot-dropdown-trigger]');
            const valueInput = dropdown.querySelector('.hotspot-modal__select-value');
            const text = dropdown.querySelector('.hotspot-modal__select-text');
            const options = dropdown.querySelectorAll('[data-hotspot-dropdown-option]');
            if (!trigger || !valueInput || !text || !options.length) return;
  
            trigger.addEventListener('click', () => {
              const isOpen = dropdown.classList.contains('is-open');
              this.closeAllDropdowns(modal);
              if (!isOpen) {
                dropdown.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
              }
            });
  
            options.forEach((optionButton) => {
              optionButton.addEventListener('click', () => {
                const value = optionButton.getAttribute('data-value') || '';
                valueInput.value = value;
                text.textContent = value;
                options.forEach((button) => button.classList.remove('is-selected'));
                optionButton.classList.add('is-selected');
                valueInput.dispatchEvent(new Event('change', { bubbles: true }));
                dropdown.classList.remove('is-open');
                trigger.setAttribute('aria-expanded', 'false');
              });
            });
          });
  
          modal.addEventListener('click', (event) => {
            if (!event.target.closest('.hotspot-modal__select-wrap')) {
              this.closeAllDropdowns(modal);
            }
          });
        }
  
        closeAllDropdowns(modal) {
          modal.querySelectorAll('.hotspot-modal__select-wrap.is-open').forEach((dropdown) => {
            dropdown.classList.remove('is-open');
            const trigger = dropdown.querySelector('[data-hotspot-dropdown-trigger]');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
          });
        }
  
        initDynamicSwatchColors() {
          this.querySelectorAll('.hotspot-modal__swatch-label[data-color-name]').forEach((label) => {
            const colorName = label.getAttribute('data-color-name') || '';
            const resolvedColor = this.resolveColorFromName(colorName);
            if (resolvedColor) {
              label.style.setProperty('--swatch-accent', resolvedColor);
            }
          });
        }
  
        resolveColorFromName(colorName) {
          const normalized = colorName.trim().toLowerCase();
          if (!normalized) return '#111111';
  
          const colorMap = {
            ivory: '#f2eee2',
            cream: '#efe4cf',
            beige: '#d8c3a5',
            tan: '#c7a27c',
            brown: '#6b4f3a',
            navy: '#1b2b5a',
            sky: '#7eb6ff',
            teal: '#2b8c87',
            olive: '#6b7b3f',
            lime: '#8bbf3d',
            khaki: '#98906a',
            maroon: '#7a1f2b',
            burgundy: '#800020',
            wine: '#6f1d33',
            magenta: '#b20075',
            pink: '#f18bb6',
            peach: '#f5b58f',
            coral: '#f7775f',
            mustard: '#c39a1c',
            gold: '#bf9b30',
            silver: '#9ba0a8',
            charcoal: '#30343a',
            grey: '#7a7a7a',
            gray: '#7a7a7a',
            stone: '#8e8a83'
          };
  
          const tokens = normalized.split(/[\s/-]+/).filter(Boolean);
          for (const token of tokens) {
            if (colorMap[token]) return colorMap[token];
          }
  
          const probe = document.createElement('span');
          probe.style.color = normalized.replace(/\s+/g, '');
          if (probe.style.color) return normalized.replace(/\s+/g, '');
  
          probe.style.color = normalized;
          if (probe.style.color) return normalized;
  
          return '#111111';
        }
  
        onKeyUp(event) {
          if (event.code === 'Escape' && this.activeModal) {
            const openedDropdown = this.activeModal.querySelector('.hotspot-modal__select-wrap.is-open');
            if (openedDropdown) {
              this.closeAllDropdowns(this.activeModal);
              return;
            }
            this.closeModal(this.activeModal);
          }
        }
  
        openModal(modalId, opener) {
          const modal =
            this.querySelector(`#${modalId}`) ||
            this.querySelector(`[id="${modalId}"]`) ||
            document.getElementById(modalId);
          if (!modal) return;
  
          this.activeModal = modal;
          this.openedBy = opener;
          this.ensureDefaultColorSelection(modal);
          document.body.classList.add('overflow-hidden');
          modal.hidden = false;
  
          const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (firstFocusable) firstFocusable.focus();
  
          document.addEventListener('keyup', this.onKeyUp);
        }
  
        ensureDefaultColorSelection(modal) {
          const forms = modal.querySelectorAll('form[data-type="add-to-cart-form"]');
          forms.forEach((form) => {
            const colorInputs = Array.from(
              form.querySelectorAll('.hotspot-modal__swatch-input[data-option-position]')
            );
            if (!colorInputs.length) return;

            const hasChecked = colorInputs.some((input) => input.checked);
            if (hasChecked) return;

            const preferredColors = ['white', 'black'];
            let defaultInput = null;

            for (const colorName of preferredColors) {
              defaultInput = colorInputs.find((input) =>
                (input.value || '').trim().toLowerCase().includes(colorName)
              );
              if (defaultInput) break;
            }

            if (!defaultInput) {
              defaultInput = colorInputs[0];
            }

            if (!defaultInput) return;

            defaultInput.checked = true;
            defaultInput.dispatchEvent(new Event('input', { bubbles: true }));
            defaultInput.dispatchEvent(new Event('change', { bubbles: true }));
          });
        }
  
        closeModal(modal) {
          this.closeAllDropdowns(modal);
          modal.hidden = true;
          document.removeEventListener('keyup', this.onKeyUp);
          document.body.classList.remove('overflow-hidden');
          if (this.openedBy) this.openedBy.focus();
          this.activeModal = null;
          this.openedBy = null;
        }
  
        initVariantPicker(modal) {
          const form = modal.querySelector('form[data-type="add-to-cart-form"]');
          if (!form) return;
  
          const jsonElement = form.querySelector('.hotspot-modal__variants-json');
          if (!jsonElement) return;
  
          let variants = [];
          try {
            variants = JSON.parse(jsonElement.textContent);
          } catch (error) {
            console.error('Unable to parse hotspot variants JSON', error);
            return;
          }
  
          const pickers = form.querySelectorAll('[data-option-position]');
          pickers.forEach((picker) => {
            const isRadio = picker.matches('input[type="radio"]');
            const eventName = isRadio ? 'input' : 'change';
            picker.addEventListener(eventName, () => this.updateVariant(form, variants));
          });
  
          this.updateVariant(form, variants);
        }
  
        updateVariant(form, variants) {
          const selectedOptions = [];
          const optionCount = Math.max(
            ...Array.from(form.querySelectorAll('[data-option-position]')).map((el) =>
              Number(el.getAttribute('data-option-position'))
            )
          );
  
          for (let index = 1; index <= optionCount; index += 1) {
            const checkedRadio = form.querySelector(
              `input[type="radio"][data-option-position="${index}"]:checked`
            );
            if (checkedRadio) {
              selectedOptions.push(checkedRadio.value);
              continue;
            }
  
            const select = form.querySelector(`select[data-option-position="${index}"]`);
            if (select) {
              selectedOptions.push(select.value);
              continue;
            }
  
            const customSelectInput = form.querySelector(
              `.hotspot-modal__select-value[data-option-position="${index}"]`
            );
            selectedOptions.push(customSelectInput ? customSelectInput.value : '');
          }
  
          const variantInput = form.querySelector('.product-variant-id');
          const submitButton = form.querySelector('button[type="submit"]');
          const buttonText = submitButton?.querySelector('span');
  
          if (selectedOptions.some((value) => value === '')) {
            this.setUnavailableState(variantInput, submitButton, buttonText, true, 'Choose options');
            return;
          }
  
          const matchedVariant = variants.find((variant) => {
            return selectedOptions.every((value, index) => variant.options[index] === value);
          });
  
          if (!matchedVariant || !variantInput || !submitButton || !buttonText) return;
  
          variantInput.value = matchedVariant.id;
          if (matchedVariant.available) {
            this.setUnavailableState(variantInput, submitButton, buttonText, false);
          } else {
            this.setUnavailableState(variantInput, submitButton, buttonText, true);
          }
        }
  
        setUnavailableState(variantInput, submitButton, buttonText, unavailable, customText = null) {
          if (!variantInput || !submitButton || !buttonText) return;
  
          if (unavailable) {
            submitButton.setAttribute('disabled', 'disabled');
            variantInput.setAttribute('disabled', 'disabled');
            buttonText.textContent = customText || window.variantStrings?.soldOut || 'Sold out';
            return;
          }
  
          submitButton.removeAttribute('disabled');
          variantInput.removeAttribute('disabled');
          buttonText.textContent = window.variantStrings?.addToCart || 'Add to cart';
        }
      }
    );
  }
  
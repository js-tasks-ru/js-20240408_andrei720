class Tooltip {
  static instance;
  static shiftPosition = 10;

  constructor (prop) {
      if (Tooltip.instance) {
          return Tooltip.instance;
      }

      Tooltip.instance = this;
      this.tooltipText = 'This is tooltip';
      this.element = this.createTooltipElement(this.createTooltipTemplate());
  }

  initialize () {
    this.createListeners();
  }

  render(textTooltip) {
    document.body.appendChild(this.element);
    this.element.textContent = textTooltip;
  }

  createListeners() {
    document.body.addEventListener('pointerover', this.handleBodyPointerover);
    document.body.addEventListener('pointermove', this.handleBodyPointermove);
    document.body.addEventListener('pointerout', this.handleBodyPointerout);
  }

  destroyListeners() {
    document.body.removeEventListener('pointerover', this.handleBodyPointerover);
    document.body.removeEventListener('pointermove', this.handleBodyPointermove);
    document.body.removeEventListener('pointerout', this.handleBodyPointerout);
  }

  handleBodyPointerover = (event) => {
    const targetElement = event.target.closest('[data-tooltip]');
    if (targetElement) {
      this.render(targetElement.dataset.tooltip);
    } 
  }

  handleBodyPointerout = (event) => {
    const targetElement = event.target.closest('[data-tooltip]');
    if (targetElement) {
      this.remove();
    } 
  }

  handleBodyPointermove = (event) =>  {
    const targetElement = event.target.closest('[data-tooltip]');
    if (targetElement) {
      this.element.style.top = event.clientY + Tooltip.shiftPosition + 'px';
      this.element.style.left = event.clientX + Tooltip.shiftPosition + 'px';
    }
  }

  createTooltipElement(template) {
    const element = document.createElement('div');
    element.innerHTML = template;

    return element.firstElementChild;
  }

  createTooltipTemplate() {
    return `
      <div class="tooltip">${this.tooltipText}</div>
    `
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.destroyListeners();
  }
}

export default Tooltip;

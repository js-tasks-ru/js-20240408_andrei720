export default class DoubleSlider {
    selected;
    progress;
    thumbRight;
    thumbLeft;

    constructor (data = {
        min: 0,
        max: 0,
        formatValue: value => value,
        selected: {
            from: 0,
            to: 0
        }
    }) {

        this.min = data.min || 0;
        this.max = data.max || 0;

        this.formatValue = data.formatValue || function(value) {return value};
        this.selected = data.selected || {
                                            from: this.min,
                                            to: this.max
                                        };

        this.element = this.createElement(this.createTemplate());

        this.setSelected(this.selected.from, this.selected.to);

        this.createListeners();
    }

    createListeners() {
        this.element.addEventListener('pointerdown', this.handleElementPointerdown);
      }
    
    destroyListeners() {
        this.element.removeEventListener('pointerdown', this.handleElementPointerdown);
    }

    handleElementPointerdown = (event) =>  {
        const thumb = event.target;

        if (thumb === this.thumbLeft || thumb === this.thumbRight) {
            if (thumb.setPointerCapture){
                thumb.setPointerCapture(event.pointerId);
            }

            thumb.addEventListener('pointermove', this.handleElementPointermove);
            thumb.addEventListener('pointerup', this.handleElementPointerup);
        }

    }

    handleElementPointermove = (event) =>  {
        const slider = this.element.querySelector('.range-slider__inner');

        let newFrom = this.selected.from;
        if (event.target === this.thumbLeft)  {
            newFrom = (event.clientX - slider.getBoundingClientRect().left)
                / (slider.getBoundingClientRect().right - slider.getBoundingClientRect().left)
                * (this.max - this.min) + this.min;
        }

        let newTo = this.selected.to;
        if (event.target === this.thumbRight) {
            newTo = this.max - (slider.getBoundingClientRect().right - event.clientX)
                / (slider.getBoundingClientRect().right - slider.getBoundingClientRect().left)
                * (this.max - this.min);
        }
        
        this.setSelected(newFrom, newTo)
    }

    handleElementPointerup = (event) =>  {
        event.target.removeEventListener('pointermove', this.handleElementPointermove);
        event.target.removeEventListener('pointerup', this.handleElementPointermove);

        this.setSelected();
    }

    setSelected(from = this.selected.from, to = this.selected.to) {
        if (from < this.min) {
            from = this.min;
        }

        if (from > this.selected.to) {
            from = this.selected.to;
        }

        if (to > this.max) {
            to = this.max;
        }

        if (to < this.selected.from) {
            to = this.selected.from;
        }

        this.selected.from = Math.round(from);
        this.selected.to = Math.round(to);

        this.renderProgress(from, to);

        let rangeSelectEvent = new CustomEvent("range-select", {bubbles: true, detail: { from: this.selected.from, to: this.selected.to }});
        this.element.dispatchEvent(rangeSelectEvent);
    }

    renderProgress(from, to) {
        const left = (from - this.min) / (this.max - this.min) * 100;
        const right = (this.max - to) / (this.max - this.min) * 100;

        this.progress.style.left = left + '%';
        this.progress.style.right = right + '%';
        this.thumbLeft.style.left = left + '%';
        this.thumbRight.style.right = right + '%';

        this.element.querySelector('span[data-element="from"]').textContent = this.formatValue(this.selected.from);
        this.element.querySelector('span[data-element="to"]').textContent = this.formatValue(this.selected.to);
    }

    createTemplate() {
        return `
            <div class="range-slider">
                <span data-element="from"></span>
                <div class="range-slider__inner">
                    <span class="range-slider__progress"></span>
                    <span class="range-slider__thumb-left"></span>
                    <span class="range-slider__thumb-right"></span>
                </div>
                <span data-element="to"></span>
            </div>
        `;
    }

    getProgressElements(element) {
        this.progress = element.querySelector('.range-slider__progress');
        this.thumbLeft = element.querySelector('.range-slider__thumb-left');
        this.thumbRight = element.querySelector('.range-slider__thumb-right');
    }

    createElement(template) {
        const element = document.createElement('div');

        element.innerHTML = template;

        this.getProgressElements(element);

        return element.firstElementChild;
    }

    remove() {
        this.element.remove();
      }
    
    destroy() {
        this.remove();
        this.destroyListeners();
    }
}

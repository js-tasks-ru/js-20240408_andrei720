export default class RangePicker {
    dateLocale;
    firstSelect = true;

    constructor(range = {}) {
        this.from = range.from || new Date();
        this.to = range.to || new Date();
        this.subElements = {};

        this.dateLocale = 'ru-RU';

        this.firstMonth = new Date(this.from.getFullYear(), this.from.getMonth());
        this.secondMonth = new Date(this.from.getFullYear(), this.from.getMonth() + 1);

        this.element = this.createElementFromTemplate(this.createElementTemplate());

        this.getSubElements();
        
        this.setRange();

        this.createListeners();
    }

    render() {
        if (!this.subElements.selector.children.length) {
            this.subElements.selector.insertAdjacentHTML('afterbegin', this.createSelectorTemplate());
            this.getSubElements();
        }

        this.updateMonths();
        this.createDaysHilight();
    }

    setRange(from = this.from, to = this.to) {
        this.from = from;
        this.to = to;

        this.subElements.from.textContent = from.toLocaleDateString(this.dateLocale);
        this.subElements.to.textContent = to.toLocaleDateString(this.dateLocale);
    }

    getSubElements() {
        for (const element of this.element.querySelectorAll('[data-element]')) {
          this.subElements[element.dataset.element] = element;
        }
    }

    createMonth(firstDayOfMonth) {
        const lastDay = new Date(firstDayOfMonth.getFullYear(),
                                firstDayOfMonth.toLocaleDateString(this.dateLocale,{month: 'numeric'}),
                                0).getDate();
        const elem = document.createElement('div');

        for (let i = 1; i <= lastDay; i++) {
            elem.append(this.createDay(i, new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), i)));
        }

        return elem.innerHTML;
    }

    createDay(number, date) {
        const elem = this.createElementFromTemplate(this.createDayTemplate());
        elem.dataset.value = date;
        elem.textContent = number;

        if (number == 1) {
            elem.style.setProperty('--start-from', date.getDay());
        }

        return elem;
    }

    createDaysHilight(from = this.from, to = this.to) {

        for (const day of this.element.querySelectorAll('.rangepicker__cell')) {
            const date = new Date(day.dataset.value);

            day.className = 'rangepicker__cell';

            if (date.getTime() == from.getTime()) {
                day.classList.add('rangepicker__selected-from');
            }
    
            if (date.getTime() > from.getTime() &&  date.getTime() < to.getTime()) {
                day.classList.add('rangepicker__selected-between');
            }
    
            if (date.getTime() == to.getTime() && !day.classList.contains('rangepicker__selected-from')) {
                day.classList.add('rangepicker__selected-to');
            }
        }
    }

    updateMonths(firstMonth = this.firstMonth, secondMonth = this.secondMonth) {
        this.firstMonth = firstMonth;
        this.secondMonth = secondMonth;

        const monthList = [firstMonth, secondMonth];

        const months = this.element.querySelectorAll('time');
        const days = this.element.querySelectorAll('.rangepicker__date-grid');

        for (let i = 0; i < 2; i++) {
            months[i].setAttribute('datetime', monthList[i].toLocaleDateString(this.dateLocale, {month:"long"}));
            months[i].textContent = monthList[i].toLocaleDateString(this.dateLocale, {month:"long"});

            days[i].innerHTML = this.createMonth(monthList[i]);
        }
    }

    createElementFromTemplate(template) {
        const elem = document.createElement('div');
        elem.innerHTML = template;
        
        return elem.firstElementChild;
    }

    handleBodyClick = (event) => {
        if (!event.target.closest('.rangepicker') && this.element.classList.contains('rangepicker_open')) {
            this.element.classList.remove('rangepicker_open');
        }
    }

    handleRangepickerClick = (event) => {

        if (event.target.closest('.rangepicker__input')) {
            this.render();
            this.element.classList.contains('rangepicker_open') 
                ? this.element.classList.remove('rangepicker_open')
                : this.element.classList.add('rangepicker_open');
        }

        if (event.target.closest('.rangepicker__cell')) {
            const selectedDate = new Date(event.target.closest('.rangepicker__cell').dataset.value)

            if (this.firstSelect) {
                this.firstSelect = false;
                this.from = selectedDate;
                this.to = selectedDate;
            } else {
                this.firstSelect = true;
                selectedDate.getTime() < this.from.getTime() ? this.from = selectedDate : this.to = selectedDate;
                this.setRange(this.from, this.to);
                this.element.classList.remove('rangepicker_open');

                const customEvent = new CustomEvent("date-select", {bubbles: true, detail: {from: this.from, to: this.to}});
                this.element.dispatchEvent(customEvent);
            }

            this.createDaysHilight();
        }

        if (event.target.closest('.rangepicker__selector-control-left') || event.target.closest('.rangepicker__selector-control-right')) {

            const direction = event.target.closest('.rangepicker__selector-control-left') ? -1 : 1;
            
            this.firstMonth = new Date(this.firstMonth.getFullYear(), this.firstMonth.getMonth() + direction);
            this.secondMonth = new Date(this.secondMonth.getFullYear(), this.secondMonth.getMonth() + direction);

            this.updateMonths(this.firstMonth, this.secondMonth);
            this.createDaysHilight();
        }
    }

    handleRangepickerPointerOut = (event) => {
        if (event.target.closest('.rangepicker__cell')) {
            event.target.blur();
        }
    }

    createListeners() {
        document.addEventListener('click', this.handleBodyClick);
        this.element.addEventListener('click', this.handleRangepickerClick);
        this.element.addEventListener('pointerout', this.handleRangepickerPointerOut);
        
    }
    
    destroyListeners() {
        document.removeEventListener('click', this.handleBodyClick);
        this.element.removeEventListener('click', this.handleRangepickerClick);
        this.element.removeEventListener('pointerout', this.handleRangepickerPointerOut);
        
    }

    remove() {
        this.element.remove();
    }
    
    destroy() {
        this.remove();
        this.destroyListeners();
    }

    createElementTemplate() {
        return `
            <div class="rangepicker">
                <div class="rangepicker__input" data-element="input">
                    <span data-element="from"></span> -
                    <span data-element="to"></span>
                </div>
                <div class="rangepicker__selector" data-element="selector"></div>
            </div>
        `
    }

    createSelectorTemplate() {
        return `
            <div class="rangepicker__selector-arrow"></div>
            <div class="rangepicker__selector-control-left"></div>
            <div class="rangepicker__selector-control-right"></div>
            <div class="rangepicker__calendar">
                <div class="rangepicker__month-indicator">
                    <time datetime="">
                        
                    </time>
                </div>
                <div class="rangepicker__day-of-week">
                    <div>Пн</div>
                    <div>Вт</div>
                    <div>Ср</div>
                    <div>Чт</div>
                    <div>Пт</div>
                    <div>Сб</div>
                    <div>Вс</div>
                </div>
                <div class="rangepicker__date-grid">
                    
                </div>
            </div>
            <div class="rangepicker__calendar">
                <div class="rangepicker__month-indicator">
                    <time datetime="">
                        
                    </time>
                </div>
                <div class="rangepicker__day-of-week">
                    <div>Пн</div>
                    <div>Вт</div>
                    <div>Ср</div>
                    <div>Чт</div>
                    <div>Пт</div>
                    <div>Сб</div>
                    <div>Вс</div>
                </div>
                <div class="rangepicker__date-grid">

                </div>
            </div>
        `
    }

    createDayTemplate() {
        return `
            <button type="button" class="rangepicker__cell" data-value=""></button>
        `
    }
}

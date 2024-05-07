import fetchJson from './utils/fetch-json.js';

import ColumnChartMain from '../../04-oop-basic-intro-to-dom/1-column-chart/index.js'

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart extends ColumnChartMain {

    constructor(incomingData = {}) {
        super(incomingData);

        this.subElements = this.getSubElements();

        this.url = incomingData.url ? incomingData.url : '';
        this.range = incomingData.range ? incomingData.range : {from: new Date(), to: new Date()};
        
        if (incomingData.range) this.update(this.range.from, this.range.to)
    }

    getSubElements() {
        const result = {};
        for (const elem of this.element.querySelectorAll('[data-element]')) {
            result[elem.dataset.element] = elem; 
        }
        return result;
    }

    render() {
        super.update(this.data);

        if (this.data.length) {
            this.value = this.data.reduce((sum, current) => sum + current, 0);
            this.element.classList.remove('column-chart_loading');
        }
        this.subElements.header.textContent = this.formatHeading(this.value);
    }

    async update(startDate, endDate) {
        let newData = {};
        this.range.from = startDate;
        this.range.to = endDate;

        this.value = 0;
        this.element.classList.add('column-chart_loading');

        const url = new URL(this.url, BACKEND_URL);
        url.searchParams.set('from', this.range.from);
        url.searchParams.set('to', this.range.to);

        try {
            let response = await fetch(url.href);
            newData = await response.json();
        } catch(err) {
            console.log(err);
        }

        this.data = Object.values(newData);

        this.render();

        return newData;
    }
}

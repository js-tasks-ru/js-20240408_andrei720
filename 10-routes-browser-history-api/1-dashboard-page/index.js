import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
    subElements = {};

    constructor() {

        this.element = this.createElementFromTemplate(this.createElementTemplate());

        this.rangePicker = this.createRangePicker();
        this.ordersChart = this.createChart('Orders', 'api/dashboard/orders');
        this.salesChart = this.createChart('Sales', 'api/dashboard/sales');
        this.customersChart = this.createChart('Customers', 'api/dashboard/customers');
        this.sortableTable = this.createTable('api/dashboard/bestsellers');

        this.createListeners();

        this.getSubElements();

    }

    render() {
        
        this.subElements.rangePicker.innerHTML = '';
        this.subElements.rangePicker.append(this.rangePicker.element);

        this.subElements.ordersChart.innerHTML = '';
        this.subElements.ordersChart.append(this.ordersChart.element);

        this.subElements.salesChart.innerHTML = '';
        this.subElements.salesChart.append(this.salesChart.element);

        this.subElements.customersChart.innerHTML = '';
        this.subElements.customersChart.append(this.customersChart.element);

        this.subElements.sortableTable.innerHTML = '';
        this.subElements.sortableTable.append(this.sortableTable.element);

        return this.element;
    }

    createTable(url = '') {
        const tableElement = new SortableTable(header, {url: url});
        return tableElement;
    }

    createChart(label = '', url = '') {
        const chart = new ColumnChart({label: label, url: url});

        return chart;
    }

    createRangePicker() {
        const rangePicker = new RangePicker();
        return rangePicker;
    }

    getSubElements() {
        for (const element of this.element.querySelectorAll('[data-element]')) {
          this.subElements[element.dataset.element] = element;
        }
    }

    handleRangePickerUpdate = async (event) => {
        const {from, to} = event.detail;
        await this.ordersChart.update(from, to);
        await this.salesChart.update(from, to);
        await this.customersChart.update(from, to);

        await this.sortableTable.render();
    }

    createListeners() {
        this.element.addEventListener('date-select', this.handleRangePickerUpdate);
    }
    
    destroyListeners() {
        this.element.removeEventListener('date-select', this.handleRangePickerUpdate);
    }

    remove() {
        this.element.remove();
    }
    
    destroy() {
        this.remove();
        this.destroyListeners();
    }

    createElementFromTemplate(template) {
        const elem = document.createElement('div');
        elem.innerHTML = template;
        
        return elem.firstElementChild;
    }

    createElementTemplate() {
        return `
            <div class="dashboard">
                <div class="content__top-panel">
                    <h2 class="page-title">Dashboard</h2>
                    <div data-element="rangePicker"></div>
                </div>
                <div data-element="chartsRoot" class="dashboard__charts">
                    <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                    <div data-element="salesChart" class="dashboard__chart_sales"></div>
                    <div data-element="customersChart" class="dashboard__chart_customers"></div>
                </div>
        
                <h3 class="block-title">Best sellers</h3>
        
                <div data-element="sortableTable"></div>
            </div>
        `
    }
}

import fetchJson from './utils/fetch-json.js';

import SortableTable_v2 from '../../06-events-practice/1-sortable-table-v2/index.js'

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable extends SortableTable_v2 {
  static scrollStep = 30;

  constructor(headersConfig, {
    data = [],
    sorted = {},
    url = '',
    isSortLocally,
    start,
    end
  } = {}) {
  
    super(headersConfig, {'data': data, 'sorted': sorted});
    this.url = url;
    this.isSortLocally = isSortLocally;

    this.start = start || 0;
    this.end = end || this.start + SortableTable.scrollStep;
    this.countPages = 1;

    this.createElementFromTemplate(this.createNoDataTemplate());
    this.createElementFromTemplate(this.createLoadingTemplate());
    
    this.getSubElements();

    this.createListeners();

    this.render(sorted.id, sorted.order);
  }

  sortOnClient (id, order) {
    super.sortOnClient(id, order);
  }

  sortOnServer (id, order) {
    this.subElements.header.querySelector(`[data-id="${id}"]`).dataset.order = order;
    this.subElements.header.querySelector(`[data-id="${id}"]`).appendChild(this.subElements.arrow);

    this.subElements.body.innerHTML = '';
    this.data = [];
    this.countPages = 1;

    this.render(id, order);
  }

  async loadData(id, order, start = this.start, end = this.end) {
    const url = new URL(this.url, BACKEND_URL);
    let newData = '';

    if (id) url.searchParams.set('_sort', id);
    if (!this.isSortLocally && order) url.searchParams.set('_order', order);
    if (start + '') url.searchParams.set('_start', start);
    if (end + '') url.searchParams.set('_end', end);

    try {
        let response = await fetch(url.href);
        newData = await response.text();
    } catch(err) {
        console.log(err);
    }

    return newData;
  }

  async render(id, order, start, end) {
    this.subElements.loading.style.display = 'block';
    this.subElements.emptyPlaceholder.style.display = '';

    for (let row of JSON.parse(await this.loadData(id, order, start, end))) {
      this.data.push(row);
      this.subElements.body.insertAdjacentHTML('beforeend', this.createRow(row))
    }

    this.subElements.loading.style.display = '';

    if (!this.data.length) {
      this.subElements.emptyPlaceholder.style.display = 'block';
    }
  }

  createElementFromTemplate(template) {
    const elem = document.createElement('div');
    elem.innerHTML = template;
    
    this.element.appendChild(elem.firstElementChild)
  }

  createLoadingTemplate() {
    return `<div data-element="loading" class="loading-line sortable-table__loading-line"></div>`
  }

  createNoDataTemplate() {
    return `
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    `
  }

  createListeners() {
    super.createListeners();

    window.addEventListener('scroll', this.handleTableScroll);
  }

  destroyListeners() {
    super.destroyListeners();
    this.element.removeEventListener('scroll', this.handleTableScroll);
  }

  handleTableScroll = (event) => {

    if (window.scrollY + window.innerHeight >= document.body.clientHeight && this.subElements.loading.style.display != 'block') {
      
      this.render(this.subElements.arrow.parentElement.dataset.id, 
        this.subElements.arrow.parentElement.dataset.order, 
        this.start + this.countPages * SortableTable.scrollStep, 
        this.end + this.countPages * SortableTable.scrollStep);

      this.countPages++;
    }
    
  }

  destroy() {
    super.destroy();
    this.destroyListeners();
  }

  sort(sortedField, sortOrder) {
    if (this.isSortLocally) {
      this.sortOnClient(sortedField, sortOrder);
    } else {
      this.sortOnServer(sortedField, sortOrder);
    }
  }
}

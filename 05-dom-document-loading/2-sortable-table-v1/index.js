export default class SortableTable {
  subElements;
  
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.subElements = {};
    this.element = this.createElement(this.craeteTemplateElement());
    this.getSubElements();
  }

  createElement(template) {
    const element = document.createElement('div');

    element.innerHTML = template;

    return element.firstElementChild;
  }

  getSubElements() {

    for (const element of this.element.querySelectorAll('[data-element]')) {
      this.subElements[element.dataset.element] = element;
    }
    
    this.subElements.arrow = this.createSortArrow();
  }

  craeteTemplateElement() {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.createTableHeader()}
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.createTableBody()}
        </div>
      </div>
    `
  }

  createTableBody() {
    const result = this.createRows();

    if (this.subElements?.body) {
      this.subElements.body.innerHTML = result;
    }
    
    return result;
  }

  createRows() {
    return this.data.map( (data) => this.createRow(data) ).join('\n')
  }

  createRow(data) {
    const row = document.createElement('div');
    row.innerHTML = `<a href="/products/${data.id}" class="sortable-table__row">`
    for (let cellProp of this.headerConfig) {
      row.firstElementChild.appendChild(this.createCell(data, cellProp));
    }
    return row.innerHTML;
  }

  createCell(data, cellProp) {
    const cell = document.createElement('div');

    if (cellProp.template) {
      cell.innerHTML = cellProp.template(data.images);
    } else {
      cell.innerHTML = `<div class="sortable-table__cell">${data[cellProp.id]}</div>`
    }
    
    return cell.firstElementChild;
  }

  createTableHeader() {
    const headerElement = document.createElement('div');

    for (let columnProperty of this.headerConfig) {
      headerElement.insertAdjacentHTML('beforeend', this.createHederCell(columnProperty));
    }

    if (this.subElements?.header) {
      this.subElements.header.innerHTML = headerElement.innerHTML;
    }

    return headerElement.innerHTML;
  }

  createHederCell(columnProperty) {
    return `
      <div class="sortable-table__cell"
          data-id="${columnProperty.id}" 
          data-sortable="${columnProperty.sortable}" 
          data-order="">
        <span>${columnProperty.title}</span>        
      </div>
    `
  }

  createSortArrow() {
    const element = document.createElement('div');
    element.innerHTML = `
                        <span data-element="arrow" class="sortable-table__sort-arrow">
                          <span class="sort-arrow"></span>
                        </span>
                      `
    return element.firstElementChild;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  sort(fieldValue, orderValue) {
    const ratio = orderValue == 'asc' ? 1 : -1;
    
    if (this.headerConfig.find( (field) => { return field.id == fieldValue } ).sortType == 'string') {
      this.data.sort((a, b) => {         
        return ratio * a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en'], {caseFirst: 'upper'})
      })
    } else {
      this.data.sort((a, b) => {         
        return ratio * (a[fieldValue] - b[fieldValue])
      })
    }

    this.subElements.header.querySelector(`[data-id="${fieldValue}"]`).dataset.order = orderValue;
    this.subElements.header.querySelector(`[data-id="${fieldValue}"]`).appendChild(this.subElements.arrow);

    this.createTableBody();    
  }
}


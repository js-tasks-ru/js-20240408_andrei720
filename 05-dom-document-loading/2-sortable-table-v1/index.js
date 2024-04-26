export default class SortableTable {
  subElements;
  
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.subElements = {};
    this.element = this.createElement(this.craeteTemplateElement());
  }

  createElement(template) {
    const element = document.createElement('div');

    element.innerHTML = template;

    this.subElements.body = element.querySelector('.sortable-table__body');
    this.subElements.header = element.querySelector('.sortable-table__header');

    this.createTableHeader();
    this.createTableBody();

    return element.firstElementChild;
  }

  craeteTemplateElement() {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
        </div>
        <div data-element="body" class="sortable-table__body">
        </div>
      </div>
    `
  }

  createTableBody() {
    this.subElements.body.innerHTML = this.createRows();
  }

  createRows() {
    return [...this.data.map( (data) => this.createRow(data) )].join('\n')
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
      cell.innerHTML = cellProp.template(data);
    } else {
      cell.innerHTML = `<div class="sortable-table__cell">${data[cellProp.id]}</div>`
    }
    
    return cell.firstElementChild;
  }

  createImagesList(images = []) {
    const imagesList = document.createElement('div');

    for (let img of images) {
      imagesList.insertAdjacentHTML('beforeend', `<img class="sortable-table-image" alt="${img.source}" src="${img.url}">`)
    }

    return imagesList.innerHTML;
  }

  createTableHeader() {
    const headerElement = document.createElement('div');

    for (let columnProperty of this.headerConfig) {
      headerElement.insertAdjacentHTML('beforeend', this.createHederCell(columnProperty));
    }

    this.subElements.header.innerHTML = headerElement.innerHTML;
  }

  createHederCell(columnProperty) {
    return `
      <div class="sortable-table__cell" data-id="${columnProperty.id}" data-sortable="${columnProperty.sortable}"">
        <span>${columnProperty.title}</span>
        ${ columnProperty.sortable ? this.addSortArrow() : '' }        
      </div>
    `
  }

  addSortArrow() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  sort(fieldValue, orderValue) {
    const ratio = orderValue == 'asc' ? 1 : -1;
    
    if (typeof(this.data[0][fieldValue]) == 'string') {
      this.data.sort((a, b) => {         
        return ratio * a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en'], {caseFirst: 'upper'})
      })
    } else {
      this.data.sort((a, b) => {         
        return ratio * (a[fieldValue] - b[fieldValue])
      })
    }

    this.createTableBody();
  }
}


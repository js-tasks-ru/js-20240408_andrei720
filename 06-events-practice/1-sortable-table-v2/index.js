import SortableTableMain from '../../05-dom-document-loading/2-sortable-table-v1/index.js';

export default class SortableTable extends SortableTableMain {
  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {

    super(headersConfig, data);
    this.createListeners();
    this.isSortLocally = true;
    if (sorted.id && sorted.order) {
      this.sort(sorted.id, sorted.order);
    }
    
  }

  handleTablePointerdown = (event) => {

    const tableCell = event.target.closest('.sortable-table__cell');
    if (tableCell && tableCell.dataset.sortable == 'true') {
      this.sort(tableCell.dataset.id, tableCell.dataset.order == 'desc' ? 'asc' : 'desc');
    }

  }

  createListeners() {
    const element = this.element;

    this.element.addEventListener('pointerdown', this.handleTablePointerdown);
  }

  destroyListeners() {
    this.element.removeEventListener('pointerdown', this.handleTablePointerdown);
  }

  sortOnServer() {
    return true;
  }

  sortOnClient(sortedField, sortOrder) {
    super.sort(sortedField, sortOrder);
  }

  sort(sortedField, sortOrder) {
    if (this.isSortLocally) {
      this.sortOnClient(sortedField, sortOrder);
    } else {
      this.sortOnServer();
    }
  }

  destroy() {
    super.destroy();
    this.destroyListeners();
  }

}

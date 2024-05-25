// import SortableList from '../../2-sortable-list/src/index.js';
import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

import ProductForm_v1 from '../../08-forms-fetch-api-part-2/1-product-form-v1/index.js'

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm extends ProductForm_v1 {
  constructor (productId) {
    super(productId)
  }

  async render () {
    await super.render();

    const list = [];

    for (const elem of this.subElements.imageListContainer.querySelector('.sortable-list').children) {
      list.push(elem);
    }

    const sortableList = new SortableList({items : list});

    this.subElements.imageListContainer.querySelector('.sortable-list').remove();
    this.subElements.imageListContainer.append(sortableList.element);

    return this.element;
  }
}

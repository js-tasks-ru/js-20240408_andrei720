import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  static categoriesURL = 'api/rest/categories';
  static productsURL = 'api/rest/products';
  static imgurURL = 'https://api.imgur.com/3/image';

  constructor (productId) {
    this.productId = productId;

    this.subElements = {};

    this.element = this.createElementFromTemplate(this.createElementTemplate());
    
    this.getSubElements();

    this.createListeners();
  }

  async render () {
    this.element.hidden;

    this.subElements.productForm.elements.subcategory.innerHTML = '';
    for (const cat of await this.loadCategories()) {
      for (const subcat of cat.subcategories) {
        this.subElements.productForm.elements.subcategory.insertAdjacentHTML('beforeend', this.createCategoryRecordTemplate(subcat.id, `${cat.title} > ${subcat.title}`));
      }
    }
    this.subElements.productForm.elements.subcategory.value = '';

    if (this.productId) {
      const productData = await this.loadProductData(this.productId);
      this.subElements.productForm.elements.title.value = productData.title;
      this.subElements.productForm.elements.description.value = productData.description;
      this.subElements.productForm.elements.subcategory.value = productData.subcategory;
      this.subElements.productForm.elements.price.value = productData.price;
      this.subElements.productForm.elements.discount.value = productData.discount;
      this.subElements.productForm.elements.quantity.value = productData.quantity;
      this.subElements.productForm.elements.status.value = productData.status;

      this.subElements.imageListContainer.firstElementChild.innerHTML = '';
      for (const image of productData.images) {
        this.subElements.imageListContainer.firstElementChild.insertAdjacentHTML('beforeend', this.createImageRecordTemplate(image.url, image.source));
      }
    }

    this.element.hidden = false;

    return this.element;
  }

  async loadProductData(id) {
    const url = new URL(ProductForm.productsURL, BACKEND_URL);
    let result = {};

    url.searchParams.set('id', id);

    try {
        let response = await fetch(url.href);
        result = await response.json();
    } catch(err) {
        console.log(err);
    }

    return result[0];
  }

  async loadCategories() {
    const url = new URL(ProductForm.categoriesURL, BACKEND_URL);
    let result = {};

    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    try {
        let response = await fetch(url.href);
        result = await response.json();
    } catch(err) {
        console.log(err);
    }

    return result;
  }

  getImagesValues() {
    const images = [];
    for (let image of this.subElements.imageListContainer.firstElementChild.children) {
      images.push({url: image.querySelector('[name="url"]').value, source: image.querySelector('[name="source"]').value})
    }
    return images;
  }

  getFormData() {
    const form = this.subElements.productForm.elements;
    return {
        id: this.productId,
        title: escapeHtml(form.title.value),
        description: escapeHtml(form.description.value),
        subcategory: escapeHtml(form.subcategory.value),
        price: parseInt(form.price.value, 10),
        quantity: parseInt(form.quantity.value, 10),
        discount: parseInt(form.discount.value, 10),
        status: parseInt(form.status.value, 10),
        images: this.getImagesValues()
    }
  }

  async save() {
    let customEvent;
    const dataToSend = this.getFormData();
    let url = new URL(ProductForm.productsURL, BACKEND_URL);
    let result;

    try {
      let response = await fetch(url.href, {
        method: this.productId ? "PATCH" : "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataToSend)
      });

      result = await response.json();
    }  catch(err) {
      console.log(err);
    }
    
    if (this.productId) {
      customEvent = new CustomEvent("product-updated", {bubbles: true, detail: {id: this.productId}});
    } else {
      customEvent = new CustomEvent("product-saved", {bubbles: true, detail: {id: result.id}});
    }

    this.element.dispatchEvent(customEvent);
  }

  createImageRecordTemplate(url, source) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${url}">
        <input type="hidden" name="source" value="${source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${url}">
          <span>${source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `
  }

  createCategoryRecordTemplate(value, text) {
    return `<option value="${value}">${text}</option>`
  }

  createElementFromTemplate(template) {
    const elem = document.createElement('div');
    elem.innerHTML = template;
    
    return elem.firstElementChild;
  }

  getSubElements() {
    for (const element of this.element.querySelectorAll('[data-element]')) {
      this.subElements[element.dataset.element] = element;
    }
  }

  createListeners() {
    this.subElements.productForm.addEventListener('submit', this.handleFormSubmit);
    this.subElements.productForm.elements.uploadImage.addEventListener('pointerup', this.handleUploadImagePointerUp);
  }

  destroyListeners() {
    this.subElements.productForm.removeEventListener('submit', this.handleFormSubmit);
    this.subElements.productForm.elements.uploadImage.removeEventListener('pointerup', this.handleUploadImagePointerUp);
  }

  handleFormSubmit = (event) => {
    event.preventDefault();
    this.save();
  }

  handleUploadImagePointerUp = (event) => {
    
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async(e) => { 
      const file = e.target.files[0];

      this.subElements.productForm.elements.uploadImage.classList.add("is-loading"),
      this.subElements.productForm.elements.uploadImage.disabled = true;

      const imgurResult = await this.uploadFileToImgur(file);

      this.subElements.imageListContainer.firstElementChild.insertAdjacentHTML('beforeend', this.createImageRecordTemplate(imgurResult.link, imgurResult.name));

      this.subElements.productForm.elements.uploadImage.classList.remove("is-loading"),
      this.subElements.productForm.elements.uploadImage.disabled = false;
    }

    input.click();
    input.remove();

  }

  async uploadFileToImgur(file) {
    const url = new URL(ProductForm.imgurURL);
    let result = {};

    let form = new FormData;
    form.append("image", file);
    form.append("name", file.name);

    try {
        let response = await fetch(url.href, {
          method: "POST",
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: form
        });

        result = await response.json();
    } catch(err) {
        console.log(err);
    }

    return result.data;
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
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
              <ul class="sortable-list">

              </ul>
            </div>
            <button id="uploadImage" type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select id="subcategory" class="form-control" name="subcategory">
              
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input id="price" required="" type="number" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select id="status" class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button id="save" type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `
  }
}

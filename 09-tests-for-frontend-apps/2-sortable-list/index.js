export default class SortableList {

    constructor (list = {items : []}) {

        this.list = list;
        this.dragableElement = null;
        this.placeHolder = null;
        this.shiftX = 0;
        this.shiftY = 0;

        this.element = this.createElementFromTemplate(this.createElementTemplate());

        this.createListeners();

        this.render();
    }
    
    render() {
        if (!this.list?.items?.length) return

        for (const item of this.list.items) {
            item.classList.add('sortable-list__item');
            this.element.append(item);
        }
    }

    handleElementPointerDown = (event) => {
        
        if (event.target.closest('[data-grab-handle]')) {
            this.dragableElement = event.target.closest('.sortable-list__item');

            this.shiftX = event.clientX - this.dragableElement.getBoundingClientRect().left;
            this.shiftY = event.clientY - this.dragableElement.getBoundingClientRect().top;

            this.placeHolder = this.dragableElement.cloneNode(false);
            this.placeHolder.classList.add('sortable-list__placeholder');
            this.dragableElement.before(this.placeHolder);

            this.dragableElement.classList.add('sortable-list__item_dragging');
            this.dragableElement.style.width = this.placeHolder.getBoundingClientRect().right - this.placeHolder.getBoundingClientRect().left + 'px';
            this.element.append(this.dragableElement);

            this.moveAt(event.pageX, event.pageY + 3);

            this.dragableElement.addEventListener('pointermove', this.handleElementPointermove);

            this.dragableElement.addEventListener('pointerup', this.handleElementPointerUp);

        }

        if (event.target.closest('[data-delete-handle]')) {
            event.target.closest('.sortable-list__item').remove();
            this.updateListItems();
        }
    }

    handleElementPointermove = (event) => {
        if (this.dragableElement) {

            this.dragableElement.hidden = true;
            this.moveAt(event.clientX, event.clientY);

            let underElem = null;

            for (const elem of this.element.querySelectorAll('.sortable-list__item')){
                if (
                    event.clientY >= elem.getBoundingClientRect().top 
                    && event.clientY <= elem.getBoundingClientRect().bottom 
                    && elem != this.dragableElement
                ) {
                    underElem = elem;
                }
            }

            if (underElem) {
                if (
                    event.clientY - underElem.getBoundingClientRect().top 
                    < underElem.getBoundingClientRect().bottom - event.clientY
                ) {
                    underElem.before(this.placeHolder);
                } else {
                    underElem.after(this.placeHolder);
                }
            }
            
            this.dragableElement.hidden = false;
        }
    }

    handleElementPointerUp = () => {
        if (this.dragableElement) {
            event.preventDefault();
            this.dragableElement.removeEventListener('pointermove', this.handleElementPointermove);

            this.placeHolder.after(this.dragableElement);

            this.dragableElement.classList.remove('sortable-list__item_dragging');
            this.dragableElement.style.left = '';
            this.dragableElement.style.top = '';
            this.dragableElement.style.width = '';
            
            this.placeHolder.remove();
            this.shiftX = 0;
            this.shiftY = 0;

            this.updateListItems();
            
            this.dragableElement.removeEventListener('pointerup', this.handleElementPointerUp);
        }
    }

    handleElementDragstart = (event) => {
        if (event.target.closest('.sortable-list__item')) {
            event.preventDefault();
        }
    }

    updateListItems() {
        this.list.items = [];
        
        if (this.element.childElementCount) {
            for (const elem of this.element.children) {
                this.list.items.push(elem.outerHTML);
            }
        }
    }

    createListeners() {
        this.element.addEventListener('pointerdown', this.handleElementPointerDown);
        this.element.addEventListener('dragstart', this.handleElementDragstart);
    }
    
    destroyListeners() {
        this.element.removeEventListener('pointerdown', this.handleElementPointerDown);
        this.element.removeEventListener('dragstart', this.handleElementDragstart);
    }

    moveAt(pageX, pageY) {
        this.dragableElement.style.left = pageX - this.shiftX + 'px';
        this.dragableElement.style.top = pageY - this.shiftY + 'px';
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
            <ul style='sortable-list'></ul>
        `
    }
}

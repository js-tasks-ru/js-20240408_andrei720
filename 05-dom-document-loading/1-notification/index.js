export default class NotificationMessage {
    static lastShownComponent;

    timerId;
    
    constructor(message = '', parameters = {duration: 0, type: ''}) {
        this.message = message;
        this.duration = parameters.duration || 0;
        this.type = parameters.type || '';
        
        this.element = this.createElement(this.createTemplate());
    }

    createElement(template) {
        const element = document.createElement('div');
        element.innerHTML = template;

        return element.firstElementChild;
    }

    createTemplate() {
        return `
            <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
                <div class="timer"></div>
                <div class="inner-wrapper">
                    <div class="notification-header">${this.type}</div>
                    <div class="notification-body">
                        ${this.message}
                    </div>
                </div>
            </div>
        `
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        clearTimeout(this.timerId);
        this.remove();
    }

    show(targetElement = document.body) {
        if (NotificationMessage.lastShownComponent) {
            NotificationMessage.lastShownComponent.destroy();
        }
        NotificationMessage.lastShownComponent = this;

        this.timerId = setTimeout( () => this.remove(), this.duration);

        targetElement.appendChild(this.element);
    }

}

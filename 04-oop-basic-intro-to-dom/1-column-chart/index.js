export default class ColumnChart {
    chartHeight = 50;
    element;

    constructor (incomingData = {}) {
        this.data = incomingData.data ? incomingData.data : [];
        this.label = incomingData.label ? incomingData.label : '';
        this.value = incomingData.value ? incomingData.value : 0;
        this.link = incomingData.link ? incomingData.link : '';
        this.formatHeading = incomingData?.formatHeading ? incomingData.formatHeading : value => value;
        this.element = this.createElement();
    }

    createLink() {
        return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : ''
    }

    getChartClass() {
        return this.data.length ? 'column-chart' : 'column-chart column-chart_loading';
    }
    
    getColumnProps() {
        const maxValue = Math.max(...this.data);
        const scale = 50 / maxValue;
      
        return this.data.map(item => {
          return {
            percent: (item / maxValue * 100).toFixed(0) + '%',
            value: String(Math.floor(item * scale))
          };
        });
      }

    createChart() {
        return [...this.getColumnProps().map( ({value, percent}) => `
            <div style="--value: ${value}" data-tooltip="${percent}"></div>
            ` )].join('\n');
    }

    update(newData) {
        this.data = newData;
        this.element.querySelector('.column-chart__chart').innerHTML = this.createChart();
    }

    createElement() {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `
            <div class="${this.getChartClass()}" style="--chart-height: ${this.chartHeight}">
                <div class="column-chart__title">
                    ${this.label}
                    ${this.createLink()}
                </div>
                <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
                    <div data-element="body" class="column-chart__chart">
                        ${this.createChart()}
                    </div>
                </div>
            </div>
            `
        return tempDiv.firstElementChild;
    }

    destroy() {
        this.remove();
    }

    remove() {
        this.element.remove();
    }

}

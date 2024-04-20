export default class ColumnChart {
    chartHeight = 50;

    constructor (incomingData) {
        this.data = incomingData?.data;
        this.label = incomingData?.label;
        this.value = incomingData?.value;
        this.link = incomingData?.link;
        this.formatHeading = incomingData?.formatHeading;
        this.element = '';
    }

    set element(_) {
        this._element = this.createChart();
    }

    get element() {
        return this._element
    }

    createChart() {
        const divColumnChart = document.createElement('div');
        divColumnChart.style.setProperty('--chart-height', this.chartHeight);
        divColumnChart.classList.add('column-chart');

        if (!this.data?.length) {
            divColumnChart.classList.add('column-chart_loading');
        }

        const divTitle = document.createElement('div');
        divTitle.classList.add('column-chart__title');
        divTitle.textContent = `${this.label}`;
        
        if (this.link) {
            const aLink = document.createElement('a');
            aLink.href = this.link;
            aLink.textContent = 'View All';
            aLink.classList.add('column-chart__link');
            divTitle.append(aLink);
        }

        divColumnChart.append(divTitle)

        const divChartContainer = document.createElement('div');
        divChartContainer.classList.add('column-chart__container');

        const divTotaltValue = document.createElement('div');
        divTotaltValue.classList.add('column-chart__header');
        divTotaltValue.dataset['element'] = 'header';
        divTotaltValue.textContent = this.formatHeading ? this.formatHeading(this.value) : this.value;
        divChartContainer.append(divTotaltValue);

        const divChartBody = document.createElement('div');
        divChartBody.classList.add('column-chart__chart');
        divChartBody.dataset['element'] = 'body';

        if (this.data?.length) {
            const maxValue = Math.max(...this.data);
            for (let dataValue of this.data) {
                const divChartVal = document.createElement('div');
                divChartVal.style.setProperty('--value', Number.parseInt(dataValue / maxValue * this.chartHeight));
                divChartVal.dataset['tooltip'] = `${Math.round(dataValue / maxValue * 100)}%`;

                divChartBody.append(divChartVal);
            }
        }


        divChartContainer.append(divChartBody);
        divColumnChart.append(divChartContainer);

        return divColumnChart;
    }

    update(newData) {
        this.data = newData;
        const chart = this._element.querySelector('.column-chart__chart');

        for (let children of chart.childNodes) {
            children.remove();
        }

        if (this.data?.length) {
            const maxValue = Math.max(...this.data);
            for (let dataValue of this.data) {
                const divChartVal = document.createElement('div');
                divChartVal.style.setProperty('--value', Number.parseInt(dataValue / maxValue * this.chartHeight));
                divChartVal.dataset['tooltip'] = `${Math.round(dataValue / maxValue * 100)}%`;

                chart.append(divChartVal);
            }
        }       
    }

    destroy() {
        this.remove();
    }

    remove() {
        this.element.remove();
    }

}

import { ObjectFormat, RowEntry, ObjectRow, FieldsByConfigId, StyleById } from '@google/dscc';
import ApexCharts from "apexcharts";

interface FontInfo {
    family: string;
    size: number;
    color: string;
}
interface Chart {
    chart: ApexCharts;
    element: Element;
}
let myChart: Chart = {
    chart: undefined,
    element: undefined
};
const CHARTNAME = 'myChart';

export function drawViz(data: ObjectFormat) {
    const newChart: boolean = document.getElementById(CHARTNAME) == undefined;
    const tables = populateTables(data.tables.DEFAULT, data.fields);
    const styling = populateStyle(data.style, tables.labels.length);

    const options = {
        series: tables.series,
        labels: tables.labels,
        tooltip:styling.tooltip,
        chart: styling.chart,
        fill: styling.fill,
        markers: styling.markers,
        dataLabels: styling.datalabels,
        plotOptions: styling.plotoptions,
        xaxis: styling.xaxis,
        yaxis: styling.yaxis,
        stroke: styling.stroke,
        legend: styling.legend
    }

    if (newChart) {
        myChart.element = document.createElement('div');
        myChart.element.id = CHARTNAME;
        document.body.appendChild(myChart.element);
        myChart.chart = new ApexCharts(myChart.element, options);
        myChart.chart.render();
        console.log('New chart created.')
    }
    else {
        myChart.chart.updateOptions(options);
        console.log('Chart updated.')
    }

};
export function populateTables(vizData: ObjectRow[], vizFields: FieldsByConfigId) {
    const metrics: (number)[][] = [];
    const series: ApexAxisChartSeries = [];
    const labels: (RowEntry)[] = [];
    for (let i = 0; i < vizData.length; ++i) {
        labels[i] = vizData[i].dimID[0];
        for (let j = 0; j < vizData[0].metricID.length; j++) {
            if (!metrics[j]) metrics[j] = [];
            metrics[j][i] = Number(vizData[i].metricID[j]);
        }
    }
    //create a 'Series' for each metric
    for (let i = 0; i < metrics.length; ++i) {
        const newSeries = {
            name: vizFields.metricID[i].name,
            data: metrics[i],
        }
        series.push(newSeries);
    }
    return {
        series: series,
        labels: labels
    };
};
export function populateStyle(vizStyle: StyleById, numDims: number) {
    const lineColors: string[] = [vizStyle.fillColor1.value.color, vizStyle.fillColor2.value.color, vizStyle.fillColor3.value.color, vizStyle.fillColor4.value.color, vizStyle.fillColor5.value.color]
    const axisFontInfo: FontInfo = {
        color: vizStyle.axisFontColor.value.color,
        size: vizStyle.axisFontSize.value,
        family: vizStyle.axisFontFamily.value
    };
    const chart = {
        type: 'radar',
        toolbar: {
            show: false
        }
    }
    const tooltip = {
        marker: {
            show: false,
        }
    }
    return {
        tooltip:tooltip,
        chart: chart,
        fill: populateFill(vizStyle.fillRadar.value, vizStyle.fillOpacity.value, lineColors),
        markers: populateMarkers(vizStyle.showMarkers.value, vizStyle.markerType.value, lineColors),
        datalabels: populateDataLabels(vizStyle.showMarkers.value, vizStyle.markerType.value, lineColors),
        plotoptions: populatePlotOptions(vizStyle.plotColor1.value.color, vizStyle.plotColor2.value.color),
        xaxis: populateXAxis(vizStyle.enableXAxis.value, axisFontInfo, numDims),
        yaxis: populateYAxis(vizStyle.enableYAxis.value, axisFontInfo),
        stroke: populateStroke(lineColors),
        legend: populateLegend(lineColors)
    };
};
export function populateFill(fillRadar: boolean, fillOpacity: number, lineColors: string[]) {
    const fill: ApexFill = {
        opacity: fillRadar ? fillOpacity : 0,
        colors: lineColors
    }
    return fill;
};
export function populateMarkers(showMarkers: boolean, markerType: string, lineColors: string[]) {
    const size = showMarkers == true && markerType === 'default' ? 4 : 0
    const markers: ApexMarkers = {
        size: size,
        colors: lineColors
    }
    return markers;
};
export function populateDataLabels(showMarkers: boolean, markerType: string, lineColors: string[]) {
    if (showMarkers == true && markerType === 'data') {
        const dataLabels: ApexDataLabels = {
            enabled: true,
            style: {
                colors: lineColors
            },
            background: {
                enabled: true,
                borderRadius: 2,
                dropShadow: {
                    enabled: false
                }
            }
        }
        return dataLabels;
    }
    const dataLabels: ApexDataLabels = {
        enabled: false
    };
    return dataLabels;
};
export function populatePlotOptions(color1: string, color2: string) {
    const plotOptions: ApexPlotOptions = {
        radar: {
            polygons: {
                strokeColors: 'white',
                fill: {
                    colors: [color1, color2]
                }
            }
        }
    };
    return plotOptions;
};
export function populateXAxis(enableAxis: boolean, fontInfo: FontInfo, numDims: number) {
    const temp = []; //super hacky but it works
    for (let i = 0; i < numDims; i++) {
        temp[i] = fontInfo.color; //pushes the color to every x axis label individually
    }
    const xAxis: ApexXAxis = {
        labels: {
            show: enableAxis,
            style: {
                colors: temp,
                fontSize: fontInfo.size + 'px',
                fontFamily: fontInfo.family,
            }
        }
    }
    return xAxis;
};
export function populateYAxis(enableAxis: boolean, fontInfo: FontInfo) {
    const yAxis: ApexYAxis = {
        show: enableAxis,
        labels: {
            style: {
                colors: fontInfo.color,
                fontSize: fontInfo.size + 'px',
                fontFamily: fontInfo.family
            }
        }
    }
    return yAxis;
};
export function populateStroke(lineColors: string[]) {
    const stroke: ApexStroke = {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        width: 2,
        colors: lineColors,
        dashArray: 0,
    }
    return stroke;
}
export function populateLegend(lineColors: string[]) {
    const legend: ApexLegend = {
        markers: {
            fillColors: lineColors
        }
    }
    return legend;
}

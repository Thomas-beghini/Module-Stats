import { updateChart, toggleDataOptions, createChartWrapper } from './chart.js';
import { addProfile, removeProfile, handleProfileCheckboxChange, selectedProfiles, candidats } from './profiles.js';
import { handleStartDateChange, handleEndDateChange } from './dates.js';

let startDate = new Date(2023, 0, 1); // Par défaut, début de l'année 2023
let endDate = new Date(2023, 11, 31); // Par défaut, fin de l'année 2023
let dataOption = 'monthly'; // Par défaut
let chartTitle = 'Titre du graphique'; // Par défaut
let chartType = 'bar1'; // Par défaut
let barColors = ['#021144', '#a7d5f3', '#f7910c', '#3765fd', '#3746b4', '#a5aff7'];

document.getElementById('color-options').addEventListener('change', function () {
    const colorPickers = document.querySelectorAll('.bar-color-picker');
    barColors = Array.from(colorPickers).map(picker => picker.value);
});

document.getElementById('add-color-picker').addEventListener('click', function () {
    const colorPickerContainer = document.getElementById('color-options');
    const newColorPicker = document.createElement('input');
    newColorPicker.type = 'color';
    newColorPicker.className = 'bar-color-picker';
    colorPickerContainer.insertBefore(newColorPicker, this);
});

document.getElementById('validate-chart').addEventListener('click', function () {
    const chartWrapper = createChartWrapper();
    document.getElementById('charts-container').appendChild(chartWrapper);
    updateChart(chartType, chartTitle, startDate, endDate, dataOption, selectedProfiles, candidats, chartWrapper.querySelector('canvas'), barColors);
});


document.getElementById('chart-type').addEventListener('change', function () {
    chartType = this.value;
    toggleDataOptions(chartType);
});

document.getElementById('profile-checkboxes').addEventListener('change', function () {
    selectedProfiles = handleProfileCheckboxChange();
});
document.getElementById('charts-container-background-color').addEventListener('change', function () {
    const chartsContainer = document.getElementById('charts-container');
    chartsContainer.style.backgroundColor = this.value;
});

document.getElementById('saveAsPDF').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    const charts = document.querySelectorAll('.chart-wrapper canvas');
    let pdfHeight = 30;
    let pageHeight = pdf.internal.pageSize.height;
    const pdfWidth = 180;

    charts.forEach((canvas, index) => {
        const chartDataUrl = canvas.toDataURL('image/png');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const aspectRatio = canvasHeight / canvasWidth;
        const pdfCanvasHeight = pdfWidth * aspectRatio;

        if (pdfHeight + pdfCanvasHeight > pageHeight - 30) {
            pdf.addPage();
            pdfHeight = 30;  // Reset the height for the new page
        }

        pdf.addImage(chartDataUrl, 'PNG', 15, pdfHeight, pdfWidth, pdfCanvasHeight);
        pdfHeight += pdfCanvasHeight + 20;  // Adjust height for the next chart
    });

    pdf.save(`${chartTitle}.pdf`);
});


document.getElementById('add-profile').addEventListener('click', function () {
    addProfile(startDate, endDate);
    updateChart(chartType, chartTitle, startDate, endDate, dataOption, selectedProfiles, candidats);
});

document.getElementById('remove-profile').addEventListener('click', function () {
    removeProfile();
    updateChart(chartType, chartTitle, startDate, endDate, dataOption, selectedProfiles, candidats);
});

document.getElementById('start-date').addEventListener('change', function () {
    startDate = handleStartDateChange(this.value);
});

document.getElementById('end-date').addEventListener('change', function () {
    endDate = handleEndDateChange(this.value);
});

document.getElementById('chart-title').addEventListener('input', function () {
    chartTitle = this.value;
});

document.querySelectorAll('input[name="data-option"]').forEach(option => {
    option.addEventListener('change', function () {
        dataOption = this.value;
    });
});



toggleDataOptions(chartType); // Initial call to set visibility correctly

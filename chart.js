import { filterCandidatsByDate, barColor } from './data.js';
import { generateTimeIntervals, groupCandidatsByInterval } from './dates.js';

let charts = [];
const tooltipEl = document.getElementById('chartjs-tooltip');

export function createChartWrapper(backgroundColor) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chart-wrapper';

    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.style.backgroundColor = backgroundColor; // Appliquez la couleur de fond

    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);

    const legendContainer = document.createElement('div');
    legendContainer.className = 'legend-container';
    legendContainer.style.marginTop = '20px'; // Ajouter un peu de marge au-dessus des légendes

    wrapper.appendChild(chartContainer);
    wrapper.appendChild(legendContainer);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.innerText = 'Supprimer';
    deleteButton.addEventListener('click', function () {
        wrapper.remove();
        const chartIndex = charts.findIndex(chart => chart.canvas === canvas);
        if (chartIndex !== -1) {
            charts[chartIndex].destroy();
            charts.splice(chartIndex, 1);
        }
    });
    wrapper.appendChild(deleteButton);

    return wrapper;
}





export function updateChart(chartType, chartTitle, startDate, endDate, dataOption, selectedProfiles, candidats, canvas, barColors) {
    const ctx = canvas.getContext('2d');

    if (charts.some(chart => chart.canvas === canvas)) {
        const existingChart = charts.find(chart => chart.canvas === canvas);
        existingChart.destroy();
        charts = charts.filter(chart => chart.canvas !== canvas);
    }

    const filteredCandidats = filterCandidatsByDate(candidats, startDate, endDate);

    let newChart;
    if (chartType === 'bar1') {
        newChart = createBarChart(ctx, filteredCandidats, chartTitle, startDate, endDate, dataOption, selectedProfiles, 1, barColors);
    } else if (chartType === 'bar2') {
        newChart = createBarChart(ctx, filteredCandidats, chartTitle, startDate, endDate, dataOption, selectedProfiles, 2, barColors);
    } else if (chartType === 'bar3') {
        newChart = createBarChart(ctx, filteredCandidats, chartTitle, startDate, endDate, dataOption, selectedProfiles, 3, barColors);
    } else if (chartType === 'pie') {
        newChart = createPieChart(ctx, filteredCandidats, chartTitle, selectedProfiles,barColors);
    } else if (chartType === 'line') {
        newChart = createLineChart(ctx, filteredCandidats, chartTitle, startDate, endDate, dataOption, selectedProfiles,barColors);
    } else if (chartType === 'donnut') {
        newChart = createDonnutChart(ctx, filteredCandidats, chartTitle, selectedProfiles,barColors);
    }

    charts.push(newChart);
}


function createBarChart(ctx, filteredCandidats, chartTitle, startDate, endDate, dataOption, selectedProfiles, numero, barColors) {
    const intervals = generateTimeIntervals(startDate, endDate, dataOption);
    const groupedData = groupCandidatsByInterval(filteredCandidats, intervals, selectedProfiles);

    const labels = intervals.map(interval => interval.label);

    const datasets = selectedProfiles.map((profile, index) => ({
        label: `${profile}`,
        data: labels.map(label => (groupedData[label][profile] || 0)),
        backgroundColor: barColors[index % barColors.length],
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 0,
        borderRadius: 4,
    }));

    const options = {
        scales: {
            x: {
                ticks: {
                    color: 'rgb(2, 17, 68)' // Couleur pour les labels de l'axe X
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: 'rgb(2, 17, 68)' // Couleur pour les labels de l'axe Y
                }
            }
        }
    };

    if (numero === 2) {
        options.indexAxis = 'y';
    } else if (numero === 3) {
        options.scales.x.stacked = true;
        options.scales.y.stacked = true;
    }

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: options
    });
}

//----------------------------------------------------------------------------------------------------------------------------
//----------------------------------------       Graphe Circulaire                    ----------------------------------------
//----------------------------------------------------------------------------------------------------------------------------

function createPieChart(ctx, filteredCandidats, chartTitle, selectedProfiles, barColors) {
    const profileCounts = {};
    selectedProfiles.forEach(profile => {
        profileCounts[profile] = 0;
    });

    filteredCandidats.forEach(candidat => {
        if (profileCounts.hasOwnProperty(candidat.profile)) {
            profileCounts[candidat.profile]++;
        }
    });

    const labels = Object.keys(profileCounts);
    const data = Object.values(profileCounts);
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: labels.map((_, index) => barColors[index % barColors.length]),
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Ajouté pour maintenir les proportions
            plugins: {
                legend: {
                    display: false // Désactiver la légende par défaut
                },
                title: {
                    display: true,
                    text: chartTitle,
                    color: 'rgb(2, 17, 68)',
                    font: {
                        size: 16, // Ajusté pour réduire la taille de la police
                    }
                }
            }
        },
        plugins: [{
            afterDraw: chart => {
                const ctx = chart.ctx;
                const radiusOffset = 20; // Augmentez cette valeur pour ajouter plus d'espace
                const textOffset = 10;
                chart.data.labels.forEach((label, index) => {
                    const meta = chart.getDatasetMeta(0).data[index];
                    const midAngle = meta.startAngle + (meta.endAngle - meta.startAngle) / 2;
                    const x = Math.cos(midAngle) * (meta.outerRadius + radiusOffset) + chart.width / 2;
                    const y = Math.sin(midAngle) * (meta.outerRadius + radiusOffset) + chart.height / 2;

                    ctx.save();
                    ctx.strokeStyle = meta.options.borderColor;
                    ctx.beginPath();
                    ctx.moveTo(meta.getCenterPoint().x, meta.getCenterPoint().y);
                    ctx.lineTo(Math.cos(midAngle) * meta.outerRadius + chart.width / 2, Math.sin(midAngle) * meta.outerRadius + chart.height / 2);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    ctx.fillStyle = meta.options.backgroundColor;
                    ctx.textAlign = x > chart.width / 2 ? 'left' : 'right';
                    ctx.font = "20px Arial";
                    ctx.fillText(label, x + (x > chart.width / 2 ? textOffset : -textOffset), y);
                    ctx.restore();
                });
            }
        }]
    });

    return chart;
}

//----------------------------------------------------------------------------------------------------------------------------
//----------------------------------------               Graphe Donnuts               ----------------------------------------
//----------------------------------------------------------------------------------------------------------------------------

function createDonnutChart(ctx, filteredCandidats, chartTitle, selectedProfiles, barColors) {
    const profileCounts = {};
    selectedProfiles.forEach(profile => {
        profileCounts[profile] = 0;
    });

    filteredCandidats.forEach(candidat => {
        if (profileCounts.hasOwnProperty(candidat.profile)) {
            profileCounts[candidat.profile]++;
        }
    });

    const labels = Object.keys(profileCounts);
    const data = Object.values(profileCounts);
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: labels.map((_, index) => barColors[index % barColors.length]),
            }]
        },
        options: {
            cutout: '60%',
            plugins: {
                legend: {
                    display: false // Désactiver la légende par défaut
                },
                title: {
                    display: true,
                    text: chartTitle,
                    color: 'rgb(2, 17, 68)'
                }
            }
        },
        plugins: [{
            afterDraw: chart => {
                const ctx = chart.ctx;
                const radiusOffset = 20; // Augmentez cette valeur pour ajouter plus d'espace
                const textOffset = 10;
                chart.data.labels.forEach((label, index) => {
                    const meta = chart.getDatasetMeta(0).data[index];
                    const midAngle = meta.startAngle + (meta.endAngle - meta.startAngle) / 2;
                    const x = Math.cos(midAngle) * (meta.outerRadius + radiusOffset) + chart.width / 2;
                    const y = Math.sin(midAngle) * (meta.outerRadius + radiusOffset) + chart.height / 2;

                    ctx.save();
                    ctx.strokeStyle = meta.options.borderColor;
                    ctx.beginPath();
                    ctx.moveTo(meta.getCenterPoint().x, meta.getCenterPoint().y);
                    ctx.lineTo(Math.cos(midAngle) * meta.outerRadius + chart.width / 2, Math.sin(midAngle) * meta.outerRadius + chart.height / 2);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    ctx.fillStyle = meta.options.backgroundColor;
                    ctx.textAlign = x > chart.width / 2 ? 'left' : 'right';
                    ctx.font = "20px Arial";
                    ctx.fillText(label, x + (x > chart.width / 2 ? textOffset : -textOffset), y);
                    ctx.restore();
                });
            }
        }]
    });

    return chart;
}



//----------------------------------------------------------------------------------------------------------------------------
//----------------------------------------              Graphe linéaire               ----------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
function createLineChart(ctx, filteredCandidats, chartTitle, startDate, endDate, dataOption, selectedProfiles,barColors) {
    const intervals = generateTimeIntervals(startDate, endDate, dataOption);
    const groupedData = groupCandidatsByInterval(filteredCandidats, intervals, selectedProfiles);

    const labels = intervals.map(interval => interval.label);

    const datasets = selectedProfiles.map((profile, index) => ({
        label: `${profile}`,
        data: labels.map(label => (groupedData[label][profile] || 0)),
        backgroundColor: barColors[index % barColors.length],
        borderColor:barColors[index % barColors.length],
        fill: false,
        tension: 0.3
    }));

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: chartTitle
                },
                tooltip: {
                    enabled: false,
                    external: function (context) {
                        const tooltipModel = context.tooltip;
                        if (tooltipModel.opacity === 0) {
                            tooltipEl.style.opacity = 0;
                            return;
                        }

                        tooltipEl.style.opacity = 1;
                        tooltipEl.innerHTML = `
                            <div><b>${tooltipModel.title[0]}</b></div>
                            ${tooltipModel.body.map(b => `<div>${b.lines}</div>`).join('')}
                        `;

                        const position = context.chart.canvas.getBoundingClientRect();
                        tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                        tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                    }
                }
            },
            scales: {
                x: {
                    display: false,
                }
            }
        }
    });
}

export function toggleDataOptions(chartType) {
    const dataOptions = document.getElementById('data-options');
    if (chartType === 'bar1' || chartType === 'bar2' ||chartType === 'bar3' ||chartType === 'line') {
        dataOptions.style.display = 'block';
    } else {
        dataOptions.style.display = 'none';
    }
}


function updateLegend(chart, legendContainer) {
    legendContainer.innerHTML = '';
    const legend = chart.generateLegend();
    legendContainer.innerHTML = legend;
}
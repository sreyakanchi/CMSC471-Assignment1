// ── Constants ────────────────────────────────────────────────────────────────

const BLUE = '#378ADD';
const GRAY = '#B4B2A9';
const GRID_COLOR = 'rgba(136,135,128,0.15)';
const TICK_COLOR = '#888780';
const TICK_FONT = { size: 11, family: 'DM Sans' };

// ── Shared axis helpers ───────────────────────────────────────────────────────

function xAxis() {
    return {
        ticks: { font: TICK_FONT, color: TICK_COLOR },
        grid: { display: false }
    };
}

function ppYAxis(titleText) {
    return {
        title: { display: true, text: titleText, font: { size: 11 }, color: TICK_COLOR },
        ticks: {
            callback: v => (v > 0 ? '+' : '') + v + ' pp',
            font: TICK_FONT,
            color: TICK_COLOR
        },
        grid: { color: GRID_COLOR }
    };
}

function dollarYAxis() {
    return {
        min: 0,
        ticks: {
            callback: v => '$' + (v / 1000).toFixed(0) + 'k',
            font: TICK_FONT,
            color: TICK_COLOR
        },
        grid: { color: GRID_COLOR }
    };
}

function ppTooltip(ctx) {
    const v = ctx.raw;
    return ctx.dataset.label + ': ' + (v > 0 ? '+' : '') + v.toFixed(1) + ' pp';
}

// ── Data helpers ─────────────────────────────────────────────────────────────

// Parse a CSV string into an array of row objects keyed by header
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
        const vals = line.split(',');
        const row = {};
        headers.forEach((h, i) => {
            const v = vals[i] !== undefined ? vals[i].trim() : '';
            row[h] = v === '' ? null : isNaN(v) ? v : +v;
        });
        return row;
    });
}

// Compute the median of an array of numbers (nulls excluded)
function median(arr) {
    const clean = arr.filter(v => v !== null && !isNaN(v)).sort((a, b) => a - b);
    if (clean.length === 0) return null;
    const mid = Math.floor(clean.length / 2);
    return clean.length % 2 !== 0 ? clean[mid] : (clean[mid - 1] + clean[mid]) / 2;
}

// Summarise rows into median values for each field we need
function summarise(rows) {
    return {
        pct_white_alone_change:          median(rows.map(r => r.pct_white_alone_change)),
        pct_black_alone_change:          median(rows.map(r => r.pct_black_alone_change)),
        pct_hispanic_change:             median(rows.map(r => r.pct_hispanic_or_latino_change)),
        pct_asian_change:                median(rows.map(r => r.pct_asian_alone_change)),
        median_income_00:                median(rows.map(r => r.median_income_00)),
        median_income_17:                median(rows.map(r => r.median_income_17)),
        median_home_value_00:            median(rows.map(r => r.median_home_value_00)),
        median_home_value_17:            median(rows.map(r => r.median_home_value_17)),
        educational_attainment_change:   median(rows.map(r => r.educational_attainment_change)),
        tract_count:                     rows.length
    };
}

// ── Chart functions ───────────────────────────────────────────────────────────

function createRaceChart(data) {
    new Chart(document.getElementById('raceChart'), {
        type: 'bar',
        data: {
            labels: ['White alone', 'Black alone', 'Hispanic / Latino', 'Asian alone'],
            datasets: [
                {
                    label: 'Gentrified tracts',
                    data: [
                        data.gentrified.pct_white_alone_change,
                        data.gentrified.pct_black_alone_change,
                        data.gentrified.pct_hispanic_change,
                        data.gentrified.pct_asian_change
                    ],
                    backgroundColor: BLUE,
                    borderRadius: 4,
                    barPercentage: 0.7
                },
                {
                    label: 'Non-gentrified tracts',
                    data: [
                        data.not_gentrified.pct_white_alone_change,
                        data.not_gentrified.pct_black_alone_change,
                        data.not_gentrified.pct_hispanic_change,
                        data.not_gentrified.pct_asian_change
                    ],
                    backgroundColor: GRAY,
                    borderRadius: 4,
                    barPercentage: 0.7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ppTooltip } }
            },
            scales: {
                x: xAxis(),
                y: ppYAxis('Percentage-point change')
            }
        }
    });
}

function createIncomeChart(data) {
    new Chart(document.getElementById('incomeChart'), {
        type: 'bar',
        data: {
            labels: ['Year 2000', 'Year 2017'],
            datasets: [
                {
                    label: 'Gentrified',
                    data: [data.gentrified.median_income_00, data.gentrified.median_income_17],
                    backgroundColor: BLUE,
                    borderRadius: 4,
                    barPercentage: 0.65
                },
                {
                    label: 'Not gentrified',
                    data: [data.not_gentrified.median_income_00, data.not_gentrified.median_income_17],
                    backgroundColor: GRAY,
                    borderRadius: 4,
                    barPercentage: 0.65
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ctx.dataset.label + ': $' + ctx.raw.toLocaleString()
                    }
                }
            },
            scales: {
                x: xAxis(),
                y: dollarYAxis()
            }
        }
    });
}

function createHomeValueChart(data) {
    new Chart(document.getElementById('homeChart'), {
        type: 'bar',
        data: {
            labels: ['Year 2000', 'Year 2017'],
            datasets: [
                {
                    label: 'Gentrified',
                    data: [data.gentrified.median_home_value_00, data.gentrified.median_home_value_17],
                    backgroundColor: BLUE,
                    borderRadius: 4,
                    barPercentage: 0.65
                },
                {
                    label: 'Not gentrified',
                    data: [data.not_gentrified.median_home_value_00, data.not_gentrified.median_home_value_17],
                    backgroundColor: GRAY,
                    borderRadius: 4,
                    barPercentage: 0.65
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ctx.dataset.label + ': $' + ctx.raw.toLocaleString()
                    }
                }
            },
            scales: {
                x: xAxis(),
                y: dollarYAxis()
            }
        }
    });
}

function createEducationChart(data) {
    new Chart(document.getElementById('edChart'), {
        type: 'bar',
        data: {
            labels: ['Gentrified tracts', 'Non-gentrified tracts'],
            datasets: [
                {
                    data: [
                        data.gentrified.educational_attainment_change,
                        data.not_gentrified.educational_attainment_change
                    ],
                    backgroundColor: [BLUE, GRAY],
                    borderRadius: 4,
                    barPercentage: 0.45
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => '+' + ctx.raw.toFixed(1) + ' pp change'
                    }
                }
            },
            scales: {
                x: xAxis(),
                y: {
                    min: 0,
                    title: {
                        display: true,
                        text: 'Percentage-point increase',
                        font: { size: 11 },
                        color: TICK_COLOR
                    },
                    ticks: {
                        callback: v => '+' + v + ' pp',
                        font: TICK_FONT,
                        color: TICK_COLOR
                    },
                    grid: { color: GRID_COLOR }
                }
            }
        }
    });
}

// ── Init ─────────────────────────────────────────────────────────────────────

function init() {
    fetch('./data/gentrification.csv')
        .then(res => res.text())
        .then(text => {
            const rows = parseCSV(text);

            const gentrifiedRows    = rows.filter(r => r.gentrified === 'True');
            const notGentrifiedRows = rows.filter(r => r.gentrified === 'False');

            const data = {
                gentrified:     summarise(gentrifiedRows),
                not_gentrified: summarise(notGentrifiedRows)
            };

            createRaceChart(data);
            createIncomeChart(data);
            createHomeValueChart(data);
            createEducationChart(data);
        })
        .catch(error => {
            console.error('Error loading gentrification CSV:', error);
        });
}

window.addEventListener('load', init);
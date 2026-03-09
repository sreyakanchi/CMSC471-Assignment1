const margin = {top: 40, right: 40, bottom: 50, left: 60};
const width = 560 - margin.left - margin.right;
const height = 320 - margin.top - margin.bottom;
// The margin code above


// Create SVG for KIR chart
const svgKir = d3.select('#chart-kir')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

// Create SVG for EMP chart
const svgEmp = d3.select('#chart-emp')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);


// Create scales
const xScale = d3.scaleLinear()  // a numeric / quantitative scale
    .domain([1978, 1992])        // predefined data range
    .range([0, width]);

const yScaleKir = d3.scaleLinear()
    .domain([0.20, 0.75])        // predefined data range for income rank
    .range([height, 0]);

const yScaleEmp = d3.scaleLinear()
    .domain([0.45, 0.97])        // predefined data range for employment rate
    .range([height, 0]);


// Add axes — KIR chart
const xAxisKir = d3.axisBottom(xScale)
    .tickFormat(d3.format('d'))
    .ticks(7);

svgKir.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxisKir);

const yAxisKir = d3.axisLeft(yScaleKir)
    .tickFormat(d => `${(d * 100).toFixed(0)}th`);
yAxisKir.ticks(5);

svgKir.append('g')
    .attr('class', 'y-axis')
    .call(yAxisKir);


// Add axes — EMP chart
const xAxisEmp = d3.axisBottom(xScale)
    .tickFormat(d3.format('d'))
    .ticks(7);

svgEmp.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxisEmp);

const yAxisEmp = d3.axisLeft(yScaleEmp)
    .tickFormat(d => `${(d * 100).toFixed(0)}%`);
yAxisEmp.ticks(5);

svgEmp.append('g')
    .attr('class', 'y-axis')
    .call(yAxisEmp);


// Axis labels — KIR
svgKir.append('text')
    .attr('class', 'axis-label')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 8)
    .style('text-anchor', 'middle')
    .text('Birth Cohort');

svgKir.append('text')
    .attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -margin.left + 15)
    .style('text-anchor', 'middle')
    .text('Income Rank');

// Axis labels — EMP
svgEmp.append('text')
    .attr('class', 'axis-label')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 8)
    .style('text-anchor', 'middle')
    .text('Birth Cohort');

svgEmp.append('text')
    .attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -margin.left + 15)
    .style('text-anchor', 'middle')
    .text('Employment Rate');


// Color palette — one per race
const RACE_COLORS = {
    asian: '#7eb8f7',
    white: '#a8d8a0',
    hisp:  '#f7a86e',
    black: '#e07090',
    aian:  '#b9a0e8'
};

const RACE_LABELS = {
    asian: 'Asian',
    white: 'White',
    hisp:  'Hispanic',
    black: 'Black',
    aian:  'AIAN'
};

const GENDER_LABELS = {
    pooled: 'Pooled',
    female: 'Female',
    male: 'Male'
};

const PCTILE_LABELS = {
    p1: '1st', p25: '25th', p50: '50th', p75: '75th', p100: '100th'
};


// Global state variables
let currentData = [];   // global variable — flat array of {cohort, race, gender, kir, emp}
let activeRaces   = new Set(['asian', 'white', 'hisp', 'black', 'aian']);
let activeGender = 'pooled';
let pctOptions = ['p1', 'p25', 'p50', 'p75', 'p100'];
let pctIndex = 2;
let activeP = pctOptions[pctIndex];


// Load data
d3.csv('data/data.csv', d => {
    // Row conversion function — parse each CSV row into typed flat objects
    const cohort = +d.cohort;
    const rows = [];
    ['asian', 'white', 'hisp', 'black', 'aian'].forEach(race => {
        ['pooled', 'female', 'male'].forEach(gender => {            ['p1', 'p25', 'p50', 'p75', 'p100'].forEach(p => {
                rows.push({
                    cohort: cohort,
                    race:   race,
                    gender: gender,
                    p:      p,
                    kir:    +d[`kir_${race}_${gender}_${p}`],
                    emp:    +d[`emp_${race}_${gender}_${p}`]
                });
            });
        });
    });
    return rows;
}).then(data => {
    // d3.csv with a row conversion returns one entry per CSV row;
    // each entry here is an array of objects — flatten one level
    currentData = data.flat();
    console.log(currentData);
    setupSelector();
    updateVis();
});

function setupSelector() {
    d3.select('#pct-value').text(PCTILE_LABELS[activeP]);

    const slider = d3.sliderHorizontal()
        .min(0)
        .max(pctOptions.length - 1)
        .step(1)
        .width(220)
        .default(pctIndex)
        .displayValue(false)
        .tickValues(d3.range(pctOptions.length))
        .tickFormat(d => PCTILE_LABELS[pctOptions[d]])
        .on('onchange', val => {
            pctIndex = +val;
            activeP = pctOptions[pctIndex];
            d3.select('#pct-value').text(PCTILE_LABELS[activeP]);
            updateVis();
        });

    d3.select('#pct-slider')
        .html('')
        .append('svg')
        .attr('width', 280)
        .attr('height', 70)
        .append('g')
        .attr('transform', 'translate(20,20)')
        .call(slider);

    d3.select('#gender-select')
        .property('value', activeGender)
        .on('change', function () {
            activeGender = d3.select(this).property('value');
            updateVis();
        });
}

function updateVis() {
    // Filter down to the active selection
    const filtered = currentData.filter(d =>
        activeRaces.has(d.race) &&
        d.gender === activeGender &&
        d.p === activeP
    );

    // Line generator
    const kirLine = d3.line()
        .x(d => xScale(d.cohort))
        .y(d => yScaleKir(d.kir))
        .curve(d3.curveMonotoneX);

    const empLine = d3.line()
        .x(d => xScale(d.cohort))
        .y(d => yScaleEmp(d.emp))
        .curve(d3.curveMonotoneX);

    const seriesData = Array.from(activeRaces).map(race => ({
        race,
        gender: activeGender,
        points: filtered
            .filter(d => d.race === race)
            .sort((a, b) => a.cohort - b.cohort)
    }));


    svgKir.selectAll('.line-kir')
        .data(seriesData, d => d.race)
        .join(
            function(enter) {
                return enter
                    .append('path')
                    .attr('class', 'line-kir')
                    .attr('fill', 'none')
                    .attr('stroke', d => RACE_COLORS[d.race])
                    .attr('stroke-width', 1.8)
                    .attr('opacity', 0.85)
                    .attr('d', d => kirLine(d.points));
            },
            function(update) {
                return update
                    .transition()
                    .duration(800)
                    .attr('stroke', d => RACE_COLORS[d.race])
                    .attr('d', d => kirLine(d.points));
            },
            function(exit) {
                return exit.remove();
            }
        );

    // ── KIR chart — dots ─────────────────────────────────────────
    svgKir.selectAll('.point-kir')
        // using the global variable
        .data(filtered, d => d.race + '-' + d.cohort)
        .join(
            function(enter) {
                return enter
                    .append('circle')
                    .attr('class', 'point-kir')
                    .attr('cx', d => xScale(d.cohort))
                    .attr('cy', d => yScaleKir(d.kir))
                    .attr('r', 4)
                    .attr('fill', d => RACE_COLORS[d.race])
                    .attr('cursor', 'pointer');
            },
            function(update) {
                return update
                    .transition()              
                    .duration(800)
                    .attr('cx', d => xScale(d.cohort))
                    .attr('cy', d => yScaleKir(d.kir));
            },
            function(exit) {
                return exit.remove();
            }
        )
        .on('mouseenter', function(event, d) {
            d3.select(this).attr('r', 6);
            showTooltip(event, d);
        })
        .on('mouseleave', function() {
            d3.select(this).attr('r', 4);
            hideTooltip();
        });


    // ── EMP chart — lines ────────────────────────────────────────
    svgEmp.selectAll('.line-emp')
        .data(seriesData, d => d.race)
        .join(
            function(enter) {
                return enter
                    .append('path')
                    .attr('class', 'line-emp')
                    .attr('fill', 'none')
                    .attr('stroke', d => RACE_COLORS[d.race])
                    .attr('stroke-width', 1.8)
                    .attr('opacity', 0.85)
                    .attr('d', d => empLine(d.points));
            },
            function(update) {
                return update
                    .transition()
                    .duration(800)
                    .attr('stroke', d => RACE_COLORS[d.race])
                    .attr('d', d => empLine(d.points));
            },
            function(exit) {
                return exit.remove();
            }
        );

    // ── EMP chart — dots ─────────────────────────────────────────
    svgEmp.selectAll('.point-emp')
        .data(filtered, d => d.race + '-' + d.cohort)
        .join(
            function(enter) {
                return enter
                    .append('circle')
                    .attr('class', 'point-emp')
                    .attr('cx', d => xScale(d.cohort))
                    .attr('cy', d => yScaleEmp(d.emp))
                    .attr('r', 4)
                    .attr('fill', d => RACE_COLORS[d.race])
                    .attr('cursor', 'pointer');
            },
            function(update) {
                return update
                    .transition()              
                    .duration(800)
                    .attr('cx', d => xScale(d.cohort))
                    .attr('cy', d => yScaleEmp(d.emp));
            },
            function(exit) {
                return exit.remove();
            }
        )
        .on('mouseenter', function(event, d) {
            d3.select(this).attr('r', 6);
            showTooltip(event, d);
        })
        .on('mouseleave', function() {
            d3.select(this).attr('r', 4);
            hideTooltip();
        });

}



function toggleRace(race, btn) {
    // make it easier for debugging
    console.log('toggle race', race);
    if (activeRaces.has(race)) {
        if (activeRaces.size > 1) {   // always keep at least one active
            activeRaces.delete(race);
            btn.classList.remove('active');
        }
    } else {
        activeRaces.add(race);
        btn.classList.add('active');
    }
    // call to update visualization
    updateVis();
}


function selectPercentile(p, btn) {
    // make it easier for debugging
    console.log('select percentile', p);
    document.querySelectorAll('#pctile-btns .btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeP = p;
    // call to update visualization
    updateVis();
}


d3.selectAll('#race-btns .btn')
    .on('click', function() { toggleRace(this.dataset.race, this); });



// Tooltip helpers
function showTooltip(event, d) {
    console.log('tooltip', d.race, d.gender, d.cohort);
    d3.select('#tooltip')
        .style('opacity', 1)
        .html(`
            <div class="tt-header">${RACE_LABELS[d.race]} · ${GENDER_LABELS[d.gender]} · ${d.cohort}</div>
            <div class="tt-row"><span class="tt-key">Parent income</span><span class="tt-val">${PCTILE_LABELS[activeP]} pctile</span></div>
            <div class="tt-row"><span class="tt-key">Indiv. income rank</span><span class="tt-val">${(d.kir * 100).toFixed(1)}th pctile</span></div>
            <div class="tt-row"><span class="tt-key">Employment rate</span><span class="tt-val">${(d.emp * 100).toFixed(1)}%</span></div>
        `);
    moveTooltip(event);
}

function moveTooltip(event) {
    const tooltip = document.getElementById('tooltip');
    const x = event.clientX + 14;
    const y = event.clientY - 10;
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    tooltip.style.left = (x + tw > window.innerWidth  ? x - tw - 28 : x) + 'px';
    tooltip.style.top  = (y + th > window.innerHeight ? y - th      : y) + 'px';
}

function hideTooltip() {
    d3.select('#tooltip').style('opacity', 0);
}

document.addEventListener('mousemove', event => {
    if (parseFloat(d3.select('#tooltip').style('opacity')) > 0) {
        moveTooltip(event);
    }
});
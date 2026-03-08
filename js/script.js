// set margin
const margin = { top: 80, right: 60, bottom: 60, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

let allData = [];

const races = ["white", "black", "hisp", "asian", "aian"];
const races_long = {
    white: "White",
    black: "Black",
    hisp: "Hispanic",
    asian: "Asian",
    aian: "Native American"
};
const pctOptions = [1, 25, 50, 75, 100];

let targetPct = 50;            // default for percentile is 50
const outcome = "kir";         // ONLY kir and pooled bc i want those 
const gender = "pooled";       

const colorScale = d3.scaleOrdinal(races, d3.schemeSet2);

let xScale, yScale;



const line = d3.line()
  .x(d => xScale(d.cohort))
  .y(d => yScale(d.value));

const t = 1000; // 1000ms = 1 second

let pctIndex = 2;   // because pctOptions[2] = 50


// code for creating svg and g below

const svg = d3.select('#vis')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

function init(){
    d3.csv("./data/data.csv", d => ({
        ...d, // parse others if needed?
        cohort: +d.cohort
    }))
    .then(data => {
        allData = data;
        console.log(data)
        setupSelector();
        updateAxes();
        updateVis();
        addLegend();
    })
    .catch(err => console.error(err));
}
window.addEventListener("load", init);



function getCurrentData(){
  const rows = [];

  allData.forEach(row => {
    races.forEach(race => {
      const col = `${outcome}_${race}_${gender}_p${targetPct}`; // e.g., kir_black_pooled_p50 :contentReference[oaicite:2]{index=2}
      rows.push({
        cohort: row.cohort,
        race: race,
        value: +row[col]
      });
    });
  });

  return rows;
}



// function setupSelector(){
//   d3.select("#pctVariable")
//     .selectAll("option")
//     .data(pctOptions)
//     .enter()
//     .append("option")
//     .text(d => `p${d}`)
//     .attr("value", d => d);

//   d3.select("#pctVariable").property("value", targetPct);

//   d3.select("#pctVariable").on("change", function(){
//     targetPct = +d3.select(this).property("value");
//     updateAxes();
//     updateVis();
//   });
// }



function setupSelector(){
    d3.select("#value").text(`p${targetPct}`);

    let slider = d3.sliderHorizontal()
    .min(0)
    .max(pctOptions.length - 1)
    .step(1)
    .width(width)
    .default(pctIndex)
    .displayValue(false)

    // show ticks only at 0..4
    .tickValues(d3.range(pctOptions.length))

    // convert those ticks to percentiles
    .tickFormat(d => pctOptions[d])

    .on("onchange", (val) => {
        pctIndex = +val
        targetPct = pctOptions[pctIndex]

        updateAxes()
        updateVis()
    })

    d3.select("#slider")
        .html("")
        .append("svg")
        .attr("width", width)
        .attr("height", 100)
        .append("g")
        .attr("transform", "translate(30,30)")
        .call(slider);
}




// function setupSelector(){
//   // Handles UI changes (sliders, dropdowns)
//   // Anytime the user tweaks something, this function reacts.
//   // May need to call updateAxes() and updateVis() here when needed!

//     let slider = d3
//         .sliderHorizontal()
//         .min(d3.min(allData.map(d => +d.year))) // setup the range
//         .max(d3.max(allData.map(d => +d.year))) // setup the range
//         .step(1)
//         .width(width)  // Widen the slider if needed
//         .displayValue(false)
//         .default(targetYear)
//         .on('onchange', (val) => {
//             targetYear = +val // Update the year
//             updateVis() // Refresh the chart      
//         });

//     d3.select('#slider')
//         .append('svg')
//         .attr('width', width)  // Adjust width if needed
//         .attr('height', 100)
//         .append('g')
//         .attr('transform', 'translate(30,30)')
//         .call(slider);
    
//     d3.selectAll('.variable')
//         // loop over each dropdown button
//         .each(function() {
//             d3.select(this)
//             .selectAll('myOptions')
//             .data(options)
//             .enter()
//             .append('option')
//             // .text(d => d)
//             .text(d => options_long[d]) 
//             .attr("value", d => d) // The actual value used in the code
//         })
//         .on("change", function (event) {
//             let id = d3.select(this).property("id");
//             let value = d3.select(this).property("value");

//             // Map dropdown → global variable
//             if (id === "xVariable") {
//                 xVar = value;
//             } 
//             else if (id === "yVariable") {
//                 yVar = value;
//             } 
//             else if (id === "sizeVariable") {
//                 sizeVar = value;
//             }
//             // update chart 
//             updateAxes();
//             updateVis();
//         })

//     d3.select('#xVariable').property('value', xVar)
//     d3.select('#yVariable').property('value', yVar)
//     d3.select('#sizeVariable').property('value', sizeVar)

// }

function updateAxes(){
  const currentData = getCurrentData();

  svg.selectAll(".axis").remove();
  svg.selectAll(".labels").remove();

  xScale = d3.scaleLinear()
    .domain(d3.extent(currentData, d => d.cohort))
    .range([0, width]);

//   yScale = d3.scaleLinear()
//     .domain([0, d3.max(currentData, d => d.value)])
//     .range([height, 0]);

const minVal = d3.min(currentData, d => d.value);
const maxVal = d3.max(currentData, d => d.value);

yScale = d3.scaleLinear()
  .domain([minVal * 0.95, maxVal * 1.05]) // small padding
  .range([height, 0]);

  const xAxis = d3.axisBottom(xScale).ticks(8).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(yScale).ticks(6).tickFormat(d3.format(".2s"));



  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  svg.append("g")
    .attr("class", "axis")
    .call(yAxis);

  svg.append("text")
    .attr("class", "labels")
    .attr("x", width/2)
    .attr("y", height + margin.bottom - 20)
    .attr("text-anchor", "middle")
    .text("Birth Cohort");

  svg.append("text")
    .attr("class", "labels")
    .attr("transform", "rotate(-90)")
    .attr("x", -height/2)
    .attr("y", -margin.left + 40)
    .attr("text-anchor", "middle")
    .text(`Mean Percentile Rank`);
}


// function updateAxes(){
//   // Draws the x-axis and y-axis
//   // Adds ticks, labels, and makes sure everything lines up nicely

//     svg.selectAll('.axis').remove()
//     svg.selectAll('.labels').remove()

//     xScale = d3.scaleLinear()
//         .domain([0, d3.max(allData, d => d[xVar])])
//         .range([0, width]);
//     const xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".2s"))

//     svg.append("g")
//         .attr("class", "axis")
//         .attr("transform", `translate(0,${height})`) // Position at the bottom
//         .call(xAxis);

//     // Your turn: Create the y-axis using the same approach.
//     // Use d3.scaleLinear() again.
//     // Adjust .domain(), .range(), and the .attr("transform", ...) to position it on the left.

//     yScale = d3.scaleLinear()
//         .domain([0, d3.max(allData, (d) => d[yVar])])
//         .range([height, 0]);

//     const yAxis = d3.axisLeft(yScale).tickFormat(d3.format(".2s"));

//     svg.append("g")
//         .attr("class", "axis")
//         .call(yAxis);

//     sizeScale = d3.scaleSqrt()
//         .domain([0, d3.max(allData, d => d[sizeVar])]) // Largest bubble = largest data point 
//         .range([5, 20]); // Feel free to tweak these values if you want bigger or smaller bubbles

//     // X-axis label
//     svg.append("text")
//         .attr("x", width / 2)
//         .attr("y", height + margin.bottom - 20)
//         .attr("text-anchor", "middle")
//         .text(options_long[xVar]) // Displays the current x-axis variable
//         .attr('class', 'labels')

//     // Y-axis label (rotated)
//     svg.append("text")
//         .attr("transform", "rotate(-90)")
//         .attr("x", -height / 2)
//         .attr("y", -margin.left + 40)
//         .attr("text-anchor", "middle")
//         .text(options_long[yVar]) // Displays the current y-axis variable
//         .attr('class', 'labels')
// }


function updateVis(){
    const currentData = getCurrentData();

    const grouped = d3.group(currentData, d => d.race);
    svg.selectAll(".points")
        .data(currentData, d => `${d.race}-${d.cohort}`)
        .join(
        enter => enter.append("circle")
            .attr("class", "points")
            .attr("cx", d => xScale(d.cohort))
            .attr("cy", d => yScale(d.value))
            .attr("r", 4)
            .style("fill", d => colorScale(d.race))
            .style("opacity", 0.6),
        update => update
            .transition()
            .duration(t)
            .attr("cx", d => xScale(d.cohort))
            .attr("cy", d => yScale(d.value))
            .style("fill", d => colorScale(d.race)),
        exit => exit.remove()
        );

    svg.selectAll(".line")
        .data(grouped, d => d[0]) // d[0] = race
        .join(
            enter => enter.append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", d => colorScale(d[0]))
            .attr("stroke-width", 2)
            .attr("d", d => line(d[1])),

            update => update
            .transition()
            .duration(t)
            .attr("stroke", d => colorScale(d[0]))
            .attr("d", d => line(d[1])),

            exit => exit.remove()
        );
}


// function updateVis(){
//   // Draws (or updates) the bubbles
//   // Filter data for the current year
//     let currentData = allData.filter(d => d.year === targetYear)

//     svg.selectAll('.points')
//         .data(currentData, d => d.country)
//         .join(
//             // When we have new data points
//             function(enter){
//                 return enter
//                     .append('circle')
//                     .attr('class', 'points')
//                     .attr('cx', d => xScale(d[xVar])) // Position on x-axis
//                     .attr('cy', d => yScale(d[yVar])) // Position on y-axis
//                     .attr('r',  d => sizeScale(d[sizeVar])) // Bubble size
//                     .style('fill', d => colorScale(d.continent))
//                     .style('opacity', .5) // Slight transparency for better visibility
//                     .attr('r', 0) // before transition r = 0
//                     .on('mouseover', function (event, d) {
//                         console.log(d) // See the data point in the console for debugging
//                         d3.select('#tooltip')
//                             // if you change opacity to hide it, you should also change opacity here
//                             .style("display", 'block') // Make the tooltip visible
//                             .html( // Change the html content of the <div> directly
//                             `<strong>${d.country}</strong><br/>
//                             Continent: ${d.continent}`)
//                             .style("left", (event.pageX + 20) + "px")
//                             .style("top", (event.pageY - 28) + "px");
                            
//                         d3.select(this) // Refers to the hovered circle
//                             .style('stroke', 'black')
//                             .style('stroke-width', '4px')
//                     })
//                     .on("mouseout", function (event, d) {
//                         d3.select('#tooltip')
//                           .style('display', 'none'); // Hide tooltip when cursor leaves
                          
//                         d3.select(this) // Refers to the hovered circle
//                           .style('stroke', 'none')
//                           .style('stroke-width', '0px');
//                     })
//                     .transition(t) // Animate the transition
//                     .attr('r', d => sizeScale(d[sizeVar])); // Expand to target size
//         },
//         // Update existing points when data changes
//         function(update){
//             return update
//                 // Smoothly move to new positions/sizes 
//                 .transition()
//                 .duration(t)                
//                 .attr('cx', d => xScale(d[xVar]))
//                 .attr('cy', d => yScale(d[yVar]))
//                 .attr('r',  d => sizeScale(d[sizeVar]));
//                 // .style('fill', d => colorScale(d.continent))
//                 // .style('opacity', .5)
//         },
//         // Remove points that no longer exist in the filtered data 
//         function(exit){
//             return exit
//             .transition()
//             .duration(t)
//             .attr('r', 0) // shrink to radius 0 
//             .remove(); // remove bubble 
//         }
//     );
// }

function addLegend(){
    // Adds a legend so users can decode colors
    let size = 10  // Size of the legend squares

    // Your turn, draw a set of rectangles using D3
    // data here should be "continents", which we've defined as a global variable
    // the rect's y could be  -margin.top/2, x could be based on i * (size + 100) + 100
    // i is the index in the continents array
    // use "colorScale" to fill them; colorScale is a global variable we defined, used in coloring bubbles
    svg.selectAll('racesSquare')
        .data(races)
        .enter()
        .append("rect")
        .attr("y", -margin.top/2)
        .attr("x", (d, i) => i * (size + 100) + 100)
        .attr("width", size)
        .attr("height", size)
        .style("fill", d => colorScale(d));
    
    svg.selectAll("racesName")
        .data(races)
        .enter()
        .append("text")
        .attr("y", -margin.top/2 + size) // Align vertically with the square
        .attr("x", (d, i) => i * (size + 100) + 120)  
        .style("fill", d => colorScale(d))  // Match text color to the square
        .text(d => races_long[d]) 
        .attr("text-anchor", "left")
        .style('font-size', '13px')
}
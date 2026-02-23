

const margin = {top: 40, right: 40, bottom: 40, left: 60};
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;
// The margin code above


// // Create SVG
const svg = d3.select('#vis')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

    // Specify margin
  // [copied from lab 2]
 
  // Create svg and g
  // [copied from lab 2]

  // Create scales
  const xScale = d3.scaleLinear() // a numeric / quantative scale
  .domain([0, 100]) // prefined data range
  .range([0, width]);

    const yScale = d3.scaleLinear()
    .domain([0, 100]) // prefined data range
    .range([height, 0]);

// Add axes
    const xAxis = d3.axisBottom(xScale);

    svg.append('g')
   .attr('transform', `translate(0,${height})`)
   .call(xAxis);


   const yAxis = d3.axisLeft(yScale)
   yAxis.ticks([5]);

    svg.append('g')
    .attr('class', 'y-axis')
    .call(yAxis);

  // [copied from lab 2]
    // Part 2:

    
    

    // svg.append('text')
    // .attr('class', 'axis-label')
    // .attr('x', width / 2)
    // .attr('y', height + margin.bottom - 10)
    // .style('text-anchor', 'middle')
    // .text('fruit');

    // svg.append('text')
    // .attr('class', 'axis-label')
    // .attr('transform', 'rotate(-90)')
    // .attr('x', -height / 2)
    // .attr('y', -margin.left + 15)
    // .style('text-anchor', 'middle')
    // .text('count');


    //part 2
    let currentData = []; // global variable

    d3.csv('data/data.csv')
        //callback function
        .then(data => {
            console.log(data)
            currentData = data.points
            updateVis()
        })
        .catch(error => console.error('Error loading data:', error))
    
    function updateVis(){
         // Now, the class point is important. 
        // To make sure we can manipulate circles, we need to select all .point elements. 
        // And thus, all circles created should have this class name (see below).
        svg.selectAll('.point')
        // using the global variable
        .data(currentData)
        .join(
                function(enter){ 
                    return enter
                    .append('circle')
                    .attr('cx', d => xScale(d.x))
                    .attr('cy', d => yScale(d.y))
                    .attr('r', 5)
                    .style('fill', d => d.color)
                    // Important. All new circles should be associated with the point class
                    .attr('class', 'point')},
                function(update){
                    return  update
                    .transition()              // ✅ transition goes HERE
                    .duration(800)
                    .attr('cx', d => xScale(d.x))
                    .attr('cy', d => yScale(d.y))
                 }, 
                function(exit){
                    return  exit.remove()
                }
   )}

   function addRandomPoint() {
    // make it easier for debugging
    console.log('add point')
    const newPoint = {
        x: (Math.random() * 100) < 0 ? (Math.random() * -100): (Math.random() * 100),
        y: (Math.random()) * 100,// finish the code, generate a number between 0 - 100
        color: 'red'
    };
    currentData.push(newPoint);
    // call to update visualization
    updateVis();
}

function removeRandomPoint() {
    // make it easier for debugging
    console.log('remove point')
    currentData.pop();
    // call to update visualization
    updateVis();
}


function updateRandomPoints() {
    
    // make it easier for debugging
    console.log('update points')
    currentData = currentData.map(d => ({
        id: currentData.length + 1,
        x: Math.max(0, Math.min(100,
            d.x + (Math.random() - 0.5) * 10,)), //moves between -5 and 5, prevents from going above 100 or below 0
        y: d.y + (Math.random() - 0.5) * 10,// finish the code, move d.y a bit
    }));



    // call to update visualization
    updateVis();
}

d3.select('#addPoint')
    .on('click', addRandomPoint);

d3.select('#removePoint')
    .on('click', removeRandomPoint);

d3.select('#updatePoints')
    .on('click', updateRandomPoints);
   

    


    
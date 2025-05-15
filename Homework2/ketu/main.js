// used Chatgpt to help with code

// #1
// Scatter Plot (Height vs Total Stats)
const svg = d3.select("svg"); // Select the existing <svg> element in the HTML

// Define margins and dimensions for scatter plot
let scatterMargin = {top: 40, right: 30, bottom: 30, left: 60},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

// Append a <g> container group to svg for the scatter plot area
const g1 = svg.append("g")
    .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);

// Load and parse CSV data
d3.csv("pokemon_alopez247.csv").then(rawData => {
    // Convert necessary fields to numbers
    rawData.forEach(d => {
        d.Height_m = +d.Height_m;
        d.Total = +d.Total;
    });

// Define all primary Pokémon types
const typeSet = [
    "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", 
    "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", 
    "Steel", "Fairy"
];

// Define color scale mapping each type to a distinct color
const colorScale = d3.scaleOrdinal()
    .domain(typeSet)
    .range([
        "#A8A77A", "#EE8130", "#6390F0", "#F7D02C", "#7AC74C", "#96D9D6", 
        "#C22E28", "#A33A31", "#B6A136", "#F02F6C", "#F95587", "#A6B91A", 
        "#B6A136", "#735797", "#6F4E37", "#C9A0DC", "#D3B493", "#9C28B8"
    ]);
    

    // Define X scale for Height
    const x1 = d3.scaleLinear()
        .domain([0, d3.max(rawData, d => d.Height_m)])
        .range([0, scatterWidth]);

    // Define Y scale for Total Stats
    const y1 = d3.scaleLinear()
        .domain([0, d3.max(rawData, d => d.Total)])
        .range([scatterHeight, 0]);

    // Add X axis to the bottom of the scatter plot
    const xAxisCall = d3.axisBottom(x1).ticks(10);
    g1.append("g")
        .attr("transform", `translate(0, ${scatterHeight})`)
        .call(xAxisCall);

    // Add Y axis to the left of the scatter plot
    const yAxisCall = d3.axisLeft(y1).ticks(8);
    g1.append("g").call(yAxisCall);

    // Add label for X axis
    g1.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + 40)
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .text("Height (m)");

    // Add label for Y axis (rotated)
    g1.append("text")
        .attr("x", -scatterHeight / 2)
        .attr("y", -40)
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Total Stats");

    // Add circles for each Pokémon, positioned by height and total stats

    g1.selectAll("circle")
        .data(rawData)
        .enter().append("circle")
        .attr("cx", d => x1(d.Height_m) + (Math.random() - 0.5) * 10) // Add random jitter to X
        .attr("cy", d => y1(d.Total) + (Math.random() - 0.5) * 10)  // Add random jitter to Y
        .attr("r", 5)
        .attr("fill", d => colorScale(d.Type_1)); // Color determined by type


    // Add chart title
    g1.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text("Height vs Total Stats");

    // Add legend to explain color coding for Pokémon types
    const legend = svg.append("g")
        .attr("transform", `translate(${scatterMargin.left + scatterWidth + 20}, 50)`);
    
    // Title for legend 
    legend.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Primary Type");

    // Create a legend item for each type
    const legendItem = legend.selectAll(".legend-item")
        .data(typeSet)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    // Add colored box to each legend item
    legendItem.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => colorScale(d));

    // Add text label for each type
    legendItem.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .attr("font-size", "12px")
        .attr("text-anchor", "start")
        .text(d => d);
});



// #2
// Bar Chart (Type Distribution by Generation)
let distrLeft = 600; // Left position of the bar chart
let distrTop = 40; // Top position of the bar chart

// Set margin and dimensions for the bar chart
let distrMargin = {top: 60, right: 150, bottom: 60, left: 60},
    distrWidth = 800 - distrMargin.left - distrMargin.right,  // Width after margin adjustments
    distrHeight = 400 - distrMargin.top - distrMargin.bottom;  // Height after margin adjustments

// Group for the bar chart within the SVG
const g2 = svg.append("g")
    .attr("transform", `translate(${distrLeft}, ${distrTop})`);

// Read and process the CSV data
d3.csv("pokemon_alopez247.csv").then(rawData => {
    // Predefined Pokémon types
    const typeSet = [
        "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", 
        "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", 
        "Steel", "Fairy"
    ];

    // Color scale for different types
    const colorScale = d3.scaleOrdinal()
        .domain(typeSet)
        .range([
            "#A8A77A", "#EE8130", "#6390F0", "#F7D02C", "#7AC74C", "#96D9D6", 
            "#C22E28", "#A33A31", "#B6A136", "#F02F6C", "#F95587", "#A6B91A", 
            "#B6A136", "#735797", "#6F4E37", "#C9A0DC", "#D3B493", "#9C28B8"
        ]);

    // Prepare nested data for type counts per generation
    const typeCounts = rawData.reduce((s, {Generation, Type_1}) => {
        s[Generation] = s[Generation] || {};
        s[Generation][Type_1] = (s[Generation][Type_1] || 0) + 1;
        return s;
    }, {});

    // Get the list of generations
    const generations = Object.keys(typeCounts).sort();

    // Flat data format for easier processing in the bar chart
    const flatData = [];
    generations.forEach(gen => {
        typeSet.forEach(type => {
            flatData.push({
                generation: gen,
                type: type,
                count: (typeCounts[gen][type] || 0)
            });
        });
    });

    // Define scales for the X and Y axes
    const x0 = d3.scaleBand()
        .domain(generations)  // X-axis shows generations
        .range([0, distrWidth])
        .padding(0.2);  // Space between bars for each generation

    const x1 = d3.scaleBand()
        .domain(typeSet)  // Sub-bars for each type within a generation
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(flatData, d => d.count)])  // Max Pokémon count per generation/type
        .nice()  // Ensure the axis ends on a nice round number
        .range([distrHeight, 0]);

    // Add X and Y axes to the chart
    g2.append("g")
        .attr("transform", `translate(0, ${distrHeight})`)  // Position X-axis at the bottom
        .call(d3.axisBottom(x0));

    g2.append("g")
        .call(d3.axisLeft(y));  // Y-axis for Pokémon count

    // Create groups for each generation, and add bars for each type within a generation
    const genGroups = g2.selectAll(".genGroup")
        .data(generations)
        .enter().append("g")
        .attr("transform", d => `translate(${x0(d)}, 0)`);
    
    // Append rectangles (bars) for each Pokémon type in the generation
    genGroups.selectAll("rect")
        .data(gen => typeSet.map(type => ({
            generation: gen,
            type: type,
            count: typeCounts[gen][type] || 0
        })))
        .enter().append("rect")
        .attr("x", d => x1(d.type))  // Position within each generation's group
        .attr("y", d => y(d.count))  // Height is based on Pokémon count
        .attr("width", x1.bandwidth())  // Width of each bar
        .attr("height", d => distrHeight - y(d.count))  // Height of the bar (difference from Y-axis)
        .attr("fill", d => colorScale(d.type));  // Color based on Pokémon type

    // Title for the bar chart
    g2.append("text")
        .attr("x", distrWidth / 2)  // Center title horizontally
        .attr("y", -20)  // Position above the chart
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text("Type Distribution by Generation");

    // Y Axis Label
    g2.append("text")
        .attr("transform", "rotate(-90)")  // Rotate Y-axis label for readability
        .attr("x", -distrHeight / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Number of Pokémon");

    // X Axis Label
    g2.append("text")
        .attr("x", distrWidth / 2)  // Center X-axis label
        .attr("y", distrHeight + 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Generation");

    // Legend for Pokémon types (18 types in total)
    const legend = g2.append("g")
        .attr("transform", `translate(${distrWidth + 20}, 0)`);  // Position the legend

    // Title for legend 
    legend.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Primary Type");

    typeSet.forEach((type, i) => {
        const row = legend.append("g")
            .attr("transform", `translate(0, ${i * 18})`);

        row.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", colorScale(type));  // Rectangle for each color in the legend

        row.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .text(type)  // Pokémon type label
            .attr("font-size", "12px")
            .attr("alignment-baseline", "middle");  // Align text vertically
    });
});



// #3
// Parallel Coordinates Plot (Stat Profiles by Type)
// Set margins and dimensions for the parallel coordinates plot
let pcMargin = {top: 10, right: 30, bottom: 10, left: 30},
    pcWidth = 900 - pcMargin.left - pcMargin.right,
    pcHeight = 400 - pcMargin.top - pcMargin.bottom;

// Append a group element (`g3`) to the main SVG for the parallel coordinates plot
// Position it below the scatter plot (assuming scatterHeight is already defined)
const g3 = svg.append("g")
    .attr("transform", `translate(${60}, ${scatterHeight + 200})`);

// Load Pokémon data from CSV
d3.csv("pokemon_alopez247.csv").then(data => {
    // Define the six stat columns to visualize
    const stats = ["HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed"];

    // Convert stat values from strings to numbers
    data.forEach(d => {
        stats.forEach(stat => {
            d[stat] = +d[stat];  // Cast to number
        });
    });

    // Create a y-scale for each stat using its min/max (extent)
    let y = {};
    stats.forEach(stat => {
        y[stat] = d3.scaleLinear()
            .domain(d3.extent(data, d => d[stat]))  // [min, max] for each stat
            .range([pcHeight, 0]);  // Invert to match SVG coordinate system
    });

    // Create an x-scale that positions each stat axis equally across the width
    const x = d3.scalePoint()
        .range([0, pcWidth])
        .domain(stats);

    const generationSet = [...new Set(data.map(d => d.Generation))].sort((a, b) => a - b);
    const colorScale = d3.scaleOrdinal()
        .domain(generationSet)
        .range(d3.schemeSet2);  // Or use d3.schemeCategory10, Set3, etc.
        

    // Function to generate a path for each Pokémon's stat profile
    function path(d) {
        return d3.line()(stats.map(p => [x(p), y[p](d[p])]));  // [[x1, y1], [x2, y2], ...]
    }

    // Draw a path for each Pokémon
    g3.selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", path)  // Path defined by the line generator
        .attr("fill", "none")
        .attr("stroke", d => colorScale(d.Generation))  // Color by Generation
        .attr("stroke-width", 1)
        .attr("opacity", 0.5);  // Make paths semi-transparent for visibility

    // Draw a vertical axis for each stat
    g3.selectAll(".dimension")
        .data(stats)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", d => `translate(${x(d)})`)  // Position on x-axis
        .each(function(d) {
            d3.select(this).call(d3.axisLeft(y[d]));  // Add left y-axis for the stat
        })
        .append("text")  // Add stat label above each axis
        .style("text-anchor", "middle")
        .attr("y", -10)
        .text(d => d)
        .style("fill", "black");

    // Add a title to the parallel coordinates plot
    g3.append("text")
        .attr("x", pcWidth / 2)
        .attr("y", -25)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text("Stat Profiles by Generation");

    // Append a legend group to the main SVG, positioned to the right of the plot
    const legend = svg.append("g")
        .attr("transform", `translate(${pcWidth + 100}, ${scatterHeight + 200})`);

    // Title for legend 
    legend.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Generation");

    // Create a legend item for each type
    const legendItems = legend.selectAll(".legend")
        .data(generationSet)
        
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);  // Stack vertically

    // Add a color box for each type
    legendItems.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => colorScale(d));  // Match color used in the plot

    // Add the text label next to each box
    legendItems.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => "Gen " + d)
        .style("font-size", "12px");
});


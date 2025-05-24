
//used Chatgpt to help with code

// #1
// Scatter Plot (Height vs Total Stats) 
// with filtering and fading animation

// Select the <svg> element from the HTML where the scatter plot will be drawn
const svg = d3.select("svg");

// Define margins and dimensions for the scatter plot drawing area
let scatterMargin = {top: 40, right: 30, bottom: 30, left: 60},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

// Append a <g> element inside the SVG to contain the scatter plot, and position it based on margins
const g1 = svg.append("g")
    .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);

// Load CSV data asynchronously
d3.csv("pokemon_alopez247.csv").then(rawData => {
    // Convert specific CSV fields to numeric values (originally loaded as strings)
    rawData.forEach(d => {
        d.Height_m = +d.Height_m;  // Convert Height from string to number
        d.Total = +d.Total;        // Convert Total stats from string to number
    });

    // List of all possible Pokémon primary types (used for color mapping and filtering)
    const typeSet = [
        "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", 
        "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", 
        "Steel", "Fairy"
    ];

    // Define an ordinal color scale assigning each Pokémon type a specific color
    const colorScale = d3.scaleOrdinal()
        .domain(typeSet)
        .range([
            "#A8A77A", // Normal
            "#EE8130", // Fire
            "#6390F0", // Water
            "#F7D02C", // Electric
            "#7AC74C", // Grass
            "#96D9D6", // Ice
            "#C22E28", // Fighting
            "#A33EA1", // Poison
            "#E2BF65", // Ground
            "#A98FF3", // Flying
            "#F95587", // Psychic
            "#A6B91A", // Bug
            "#B6A136", // Rock
            "#735797", // Ghost
            "#6F35FC", // Dragon
            "#705746", // Dark
            "#B7B7CE", // Steel
            "#D685AD"  // Fairy
        ]);

    // Define linear scales to map Height and Total stats to x and y coordinates on the plot
    const x1 = d3.scaleLinear()
        .domain([0, d3.max(rawData, d => d.Height_m)])  // Input domain from 0 to max height
        .range([0, scatterWidth]);                      // Output range is width of plotting area
    const y1 = d3.scaleLinear()
        .domain([0, d3.max(rawData, d => d.Total)])    // Input domain from 0 to max total stats
        .range([scatterHeight, 0]);                    // Output range inverted for SVG coordinate system

    // Append x-axis at the bottom of the scatter plot
    g1.append("g")
        .attr("transform", `translate(0, ${scatterHeight})`)
        .call(d3.axisBottom(x1).ticks(10));            // Add axis with 10 ticks

    // Append y-axis at the left of the scatter plot
    g1.append("g")
        .call(d3.axisLeft(y1).ticks(8));               // Add axis with 8 ticks

    // Add label for x-axis ("Height (m)")
    g1.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + 40)
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .text("Height (m)");

    // Add label for y-axis ("Total Stats") rotated vertically
    g1.append("text")
        .attr("x", -scatterHeight / 2)
        .attr("y", -40)
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Total Stats");

    // Add a title for the scatter plot
    g1.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text("Height vs Total Stats");

    // Draw scatter plot points (circles) for each Pokémon
    // Add some random jitter to x and y to reduce overlap of points
    const points = g1.selectAll("circle")
        .data(rawData)
        .enter()
        .append("circle")
        .attr("cx", d => x1(d.Height_m) + (Math.random() - 0.5) * 10)
        .attr("cy", d => y1(d.Total) + (Math.random() - 0.5) * 10)
        .attr("r", 5)
        .attr("fill", d => colorScale(d.Type_1))            // Fill color by primary type
        .attr("class", d => `point type-${d.Type_1.replace(/\s+/g, '')}`);  // Add class for styling/filtering

    // Create a legend container group positioned to the right of the scatter plot
    const legend = svg.append("g")
        .attr("transform", `translate(${scatterMargin.left + scatterWidth + 15}, 50)`);

    // Add title text for the legend
    legend.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Primary Type");

    // Create a group for each Pokémon type to hold the checkbox and label
    const checkboxGroup = legend.selectAll(".legend-item")
        .data(typeSet)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 22})`);

    // Append a foreignObject inside each legend item to hold an HTML checkbox and label
    checkboxGroup.append("foreignObject")
        .attr("width", 160)
        .attr("height", 20)
        .html(d => `
            <label style="display: flex; align-items: center; font-size: 12px;">
                <input type="checkbox" checked data-type="${d}" style="margin-right: 5px;" />
                <span style="color:${colorScale(d)}; font-weight: bold;">${d}</span>
            </label>
        `);

    // Function to update visibility of points based on which checkboxes are checked
    function updateVisibility() {
        // Collect all checked types from checkboxes
        const checkedTypes = [];
        svg.selectAll("input[type=checkbox]").each(function() {
            if (this.checked) checkedTypes.push(this.getAttribute("data-type"));
        });

        // Animate transition of points opacity:
        // fully visible if type is checked, faded if unchecked
        points.transition()
            .duration(500)
            .style("opacity", d => checkedTypes.includes(d.Type_1) ? 1 : 0.05);
    }

    // Attach event listener to all checkboxes to call updateVisibility on change
    svg.selectAll("input[type=checkbox]").on("change", updateVisibility);
});




// #2
// Bar Chart (Type Distribution by Generation)
// with bar selection, can select mulitple for easy comparison

// Position of the distribution chart within the SVG
let distrLeft = 600;
let distrTop = 40;

// Margins and dimensions for the grouped bar chart (distribution chart)
let distrMargin = {top: 60, right: 150, bottom: 60, left: 60},
    distrWidth = 800 - distrMargin.left - distrMargin.right,
    distrHeight = 400 - distrMargin.top - distrMargin.bottom;

// Append a group <g> element to SVG for the distribution chart and position it with translation
const g2 = svg.append("g")
    .attr("transform", `translate(${distrLeft}, ${distrTop})`);

// Create a div below the chart to display a list of selected bars (for user interaction)
const selectedBarsDiv = d3.select("body")
    .append("div")
    .attr("id", "selectedBars")
    .style("margin-top", "20px")
    .style("font-family", "sans-serif")
    .style("font-size", "14px")
    .style("white-space", "pre-line")  // Preserve line breaks
    .text("Selected Bars:\n");          // Initial text content

// Load CSV data asynchronously
d3.csv("pokemon_alopez247.csv").then(rawData => {
    // Define the set of Pokémon primary types
    const typeSet = [
        "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", 
        "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", 
        "Steel", "Fairy"
    ];

    // Define ordinal color scale mapping types to colors
    const colorScale = d3.scaleOrdinal()
        .domain(typeSet)
        .range([
            "#A8A77A", "#EE8130", "#6390F0", "#F7D02C", "#7AC74C", "#96D9D6",
            "#C22E28", "#A33EA1", "#E2BF65", "#A98FF3", "#F95587", "#A6B91A",
            "#B6A136", "#735797", "#6F35FC", "#705746", "#B7B7CE", "#D685AD"
        ]);

    // Aggregate data: count number of Pokémon by Generation and Type_1
    const typeCounts = rawData.reduce((acc, {Generation, Type_1}) => {
        acc[Generation] = acc[Generation] || {};
        acc[Generation][Type_1] = (acc[Generation][Type_1] || 0) + 1;
        return acc;
    }, {});

    // Extract and sort generations (keys)
    const generations = Object.keys(typeCounts).sort();

    // Flatten aggregated data into an array for easier binding
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

    // Define scale for x-axis: band scale for generations (groups)
    const x0 = d3.scaleBand()
        .domain(generations)
        .range([0, distrWidth])
        .padding(0.2);

    // Define inner scale for x-axis: band scale for types within each generation group
    const x1 = d3.scaleBand()
        .domain(typeSet)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    // Define y scale: linear scale for counts, from 0 up to max count
    const y = d3.scaleLinear()
        .domain([0, d3.max(flatData, d => d.count)])
        .nice()  // Makes axis end on round numbers
        .range([distrHeight, 0]);  // SVG y=0 is top, so invert range

    // Append x-axis at the bottom of the chart
    g2.append("g")
        .attr("transform", `translate(0, ${distrHeight})`)
        .call(d3.axisBottom(x0));

    // Append y-axis on the left
    g2.append("g")
        .call(d3.axisLeft(y));

    // Create a group <g> for each generation to hold the bars
    const genGroups = g2.selectAll(".genGroup")
        .data(generations)
        .enter().append("g")
        .attr("transform", d => `translate(${x0(d)}, 0)`);

    // Keep track of which bars are selected by the user (using a Set for uniqueness)
    const selectedBars = new Set();

    // Function to update the text div with the list of currently selected bars
    function updateSelectedList() {
        const selectedArray = Array.from(selectedBars);
        if (selectedArray.length === 0) {
            selectedBarsDiv.text("Selected Bars:\nNone");
        } else {
            // Format selected bars as a multi-line string showing generation, type, and count
            const list = selectedArray.map(key => {
                const [gen, type] = key.split("||");
                const count = typeCounts[gen][type];
                return `Gen ${gen}, ${type}: ${count}`;
            }).join("\n");
            selectedBarsDiv.text(`Selected Bars:\n${list}`);
        }
    }

    // For each generation group, create a bar for each Pokémon type
    genGroups.selectAll("rect")
        .data(gen => typeSet.map(type => ({
            generation: gen,
            type: type,
            count: typeCounts[gen][type] || 0
        })))
        .enter().append("rect")
        .attr("x", d => x1(d.type))                // Position within group by type
        .attr("y", d => y(d.count))                // Vertical position by count
        .attr("width", x1.bandwidth())             // Bar width from inner scale
        .attr("height", d => distrHeight - y(d.count))  // Bar height by count
        .attr("fill", d => colorScale(d.type))    // Fill color by Pokémon type
        .attr("stroke", "black")                   // Bar border color
        .attr("stroke-width", 0)                   // No border initially
        .on("click", function (event, d) {
            // Create a unique key for each bar based on generation and type
            const key = `${d.generation}||${d.type}`;

            // Toggle selection: if already selected, deselect; otherwise select
            if (selectedBars.has(key)) {
                selectedBars.delete(key);
                d3.select(this).attr("stroke-width", 0);  // Remove border on deselect
            } else {
                selectedBars.add(key);
                d3.select(this).attr("stroke-width", 2);  // Add border on select
            }

            // Update the displayed list of selected bars
            updateSelectedList();
        });

    // Add chart title at the top center
    g2.append("text")
        .attr("x", distrWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text("Type Distribution by Generation");

    // Add y-axis label (rotated vertically)
    g2.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -distrHeight / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Number of Pokémon");

    // Add x-axis label below the axis
    g2.append("text")
        .attr("x", distrWidth / 2)
        .attr("y", distrHeight + 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Generation");

    // Add legend container to the right of the chart
    const legend = g2.append("g")
        .attr("transform", `translate(${distrWidth + 20}, 0)`);

    // Legend title
    legend.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Primary Type");

    // Create a legend row for each Pokémon type with colored squares and text labels
    typeSet.forEach((type, i) => {
        const row = legend.append("g")
            .attr("transform", `translate(0, ${i * 18})`);

        row.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", colorScale(type));

        row.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .text(type)
            .attr("font-size", "12px")
            .attr("alignment-baseline", "middle");
    });
});




// #3
// Parallel Coordinates Plot (Stat Profiles by Type)
// with brushing so you can select subsets of Pokémon by dragging over the axes

// Set margins and dimensions for the parallel coordinates plot area
let pcMargin = {top: 10, right: 30, bottom: 10, left: 30},
    pcWidth = 900 - pcMargin.left - pcMargin.right,   // Width of plot area after subtracting margins
    pcHeight = 400 - pcMargin.top - pcMargin.bottom; // Height of plot area after subtracting margins

// Append a group element 'g3' to the main SVG container for the parallel coordinates plot
// Position it below the scatter plot (using scatterHeight) and shifted right (x=230, y=scatterHeight+200)
const g3 = svg.append("g")
    .attr("transform", `translate(${230}, ${scatterHeight + 200})`);

// Load Pokémon data from CSV file
d3.csv("pokemon_alopez247.csv").then(data => {
    // Define stats to include as parallel axes
    const stats = ["HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed"];

    // Convert string stats in data to numeric values
    data.forEach(d => {
        stats.forEach(stat => {
            d[stat] = +d[stat]; // Unary plus converts string to number
        });
    });

    // Create a y-scale for each stat: linear scale mapping stat values to vertical positions
    let y = {};
    stats.forEach(stat => {
        y[stat] = d3.scaleLinear()
            .domain(d3.extent(data, d => d[stat])) // min and max of stat values
            .range([pcHeight, 0]);                 // invert range so higher values are higher up
    });

    // x-scale: distributes each stat evenly along horizontal axis using scalePoint
    const x = d3.scalePoint()
        .range([0, pcWidth])
        .domain(stats);

    // Get sorted unique set of Generations for coloring
    const generationSet = [...new Set(data.map(d => d.Generation))].sort((a, b) => a - b);

    // Color scale mapping each generation to a distinct color from d3.schemeSet2
    const colorScale = d3.scaleOrdinal()
        .domain(generationSet)
        .range(d3.schemeSet2);

    // Function to generate path string for each Pokémon line across all stats
    function path(d) {
        return d3.line()(stats.map(p => [x(p), y[p](d[p])])); 
        // For each stat, map to [x position, y position] and create line
    }

    // Draw lines for each Pokémon using the path function
    const lines = g3.selectAll("path.line")
        .data(data)
        .enter().append("path")
        .attr("class", "line")
        .attr("d", path)  // Set SVG path attribute to line through all stats
        .attr("fill", "none")
        .attr("stroke", d => colorScale(d.Generation)) // Color by generation
        .attr("stroke-width", 1)
        .attr("opacity", 0.5);

    // Create a group for each dimension (stat axis) positioned along x-axis
    const dimensions = g3.selectAll(".dimension")
        .data(stats)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", d => `translate(${x(d)})`)
        .each(function(d) {
            // Call axisLeft for each y-scale to draw vertical axis for that stat
            d3.select(this).call(d3.axisLeft(y[d]));
        });

    // Add axis labels above each dimension group
    dimensions.append("text")
        .style("text-anchor", "middle")
        .attr("y", -10) // Position above axis line
        .text(d => d)   // Text is the stat name
        .style("fill", "black");

    // Add vertical brush for each axis to enable interactive filtering
    dimensions.append("g")
        .attr("class", "brush")
        .each(function(d) {
            d3.select(this).call(d3.brushY()
                .extent([[-10, 0], [10, pcHeight]]) // Brush area width and height
                .on("brush end", brushed));          // Attach event handler for brushing
        });

    // Add main title for parallel coordinates plot
    g3.append("text")
        .attr("x", pcWidth / 2)
        .attr("y", -55)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text("Stat Profiles by Generation");

    // Add instruction text below the title for user guidance
    g3.append("text")
        .attr("x", pcWidth / 2)
        .attr("y", -35)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-style", "italic")
        .attr("fill", "#555")
        .text("Use brushing on the axes to select and highlight subsets of Pokémon");

    // Add legend for generations on the right side of the plot
    const legend = svg.append("g")
        .attr("transform", `translate(${pcWidth + 270}, ${scatterHeight + 200})`);

    // Legend title
    legend.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Generation");

    // Legend items for each generation with colored squares and text labels
    const legendItems = legend.selectAll(".legend")
        .data(generationSet)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItems.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => colorScale(d));

    legendItems.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => "Gen " + d)
        .style("font-size", "12px");

    // Brush event handler: highlights lines that fall within all active brushes
    function brushed(event) {
        const actives = [];
        // Collect all active brushes and their extents
        dimensions.selectAll(".brush")
            .filter(function(d) {
                return d3.brushSelection(this); // Check if brush selection is active
            })
            .each(function(d) {
                actives.push({
                    dimension: d,
                    extent: d3.brushSelection(this).map(y[d].invert).sort((a,b) => a - b)
                    // Map pixel brush extent back to data domain and sort ascending
                });
            });

        // Adjust stroke opacity of lines based on whether data values are inside all brush extents
        lines.style("stroke-opacity", d => {
            return actives.every(active => {
                const val = d[active.dimension];
                return val >= active.extent[0] && val <= active.extent[1];
            }) ? 0.9 : 0.1;  // Highlight if inside all brushes, fade if not
        });
    }
});

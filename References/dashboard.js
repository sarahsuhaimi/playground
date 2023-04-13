var formatAsPercentage = d3.format("%"),
    formatAsPercentage1Dec = d3.format(".1%"),
    formatAsInteger = d3.format(","),
    fsec = d3.time.format("%S s"),
    fmin = d3.time.format("%M m"),
    fhou = d3.time.format("%H h"),
    fwee = d3.time.format("%a"),
    fdat = d3.time.format("%d d"),
    fmon = d3.time.format("%b");

function dsPieChart() {

    var dataset = [
        { category: "Samad", measure: 0.30 },
        { category: "Phang", measure: 0.25 },
        { category: "Johan", measure: 0.15 },
        { category: "Rita", measure: 0.05 },
        { category: "Lenny", measure: 0.18 },
        { category: "Pian", measure: 0.04 },
        { category: "Siti", measure: 0.03 }];

    var width = 400,
        height = 400,
        outerRadius = Math.min(width, height) / 2,
        innerRadius = outerRadius * .999,
        // for animation 
        innerRadiusFinal = outerRadius * .5,
        innerRadiusFinal3 = outerRadius * .45,
        color = d3.scale.category20();

    var vis = d3.select("#pieChart")
        .append("svg:svg")         //create the SVG element  
        .data([dataset])           //associate data 
        .attr("width", width)      //set the width and height  
        .attr("height", height)
        .append("svg:g")
        //move the center of the pie chart  
        .attr("transform", "translate(" + outerRadius + "," +
            outerRadius + ")");

    var arc = d3.svg.arc()       // create <path> elements  
        .outerRadius(outerRadius).innerRadius(innerRadius);

    // for animation 

    var arcFinal = d3.svg.arc()
        .innerRadius(innerRadiusFinal)
        .outerRadius(outerRadius);

    var arcFinal3 = d3.svg.arc()
        .innerRadius(innerRadiusFinal3)
        .outerRadius(outerRadius);

    var pie = d3.layout.pie()
        .value(function (d) { return d.measure; });

    var arcs = vis.selectAll("g.slice")
        .data(pie)            //associate the generated pie data  
        .enter()              //create <g> elements  
        .append("svg:g")      //create a group to hold each slice  
        .attr("class", "slice")    //set style in the slices  
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("click", up);

    arcs.append("svg:path")
        //set the color for each slice 
        .attr("fill", function (d, i) { return color(i); })
        .attr("d", arc)     // actual SVG path  
        .append("svg:title") //mouseover title  
        .text(function (d) {
            return d.data.category + ": " +
                formatAsPercentage(d.data.measure);
        });

    d3.selectAll("g.slice").selectAll("path").transition()
        .duration(750)
        .delay(10)
        .attr("d", arcFinal);

    // Add a label to the larger arcs, translated to the arc centroid  

    arcs.filter(function (d) { return d.endAngle - d.startAngle > .1; })
        .append("svg:text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
            return "translate(" +
                arcFinal.centroid(d) + ")rotate(" + angle(d) + ")";
        })
        //.text(function(d) { return formatAsPercentage(d.value); }) 
        .text(function (d) { return d.data.category; });

    // Computes the label angle of an arc, convert from rad to deg. 
    function angle(d) {
        var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
        return a > 90 ? a - 180 : a;
    }

    // Pie chart title    
    vis.append("svg:text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text("Revenue 2022")
        .attr("class", "title");

    function mouseover() {
        d3.select(this).select("path").transition()
            .duration(750)
            .attr("d", arcFinal3);
    }

    function mouseout() {
        d3.select(this).select("path").transition()
            .duration(750)
            .attr("d", arcFinal);
    }

    function up(d, i) {

        /* update bar chart when user selects piece of the pie chart */
        updateBarChart(d.data.category, color(i));
        updateLineChart(d.data.category, color(i));


    }
}

dsPieChart();

var group = 'All';

d3.csv("revenueData.csv", function (revdata) {

    revdata.forEach(function (d) {
        d.income = +d.income;
        d.year = +d.year;
        d.performance = +d.performance;
    });

    function datasetChosen(group) {
        var ds = [];
        for (x in revdata) {
            if (revdata[x].group == group) {
                ds.push(revdata[x]);
            }
        }
        return ds;
    };

    /* 
        ############# BAR CHART ################### 
        ------------------------------------------- 
        */

    //set margin to plot bar chart 
    function dsBarChartBasics() {

        var margin = { top: 30, right: 5, bottom: 20, left: 50 },
            width = 500 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom,
            colorBar = d3.scale.category20(),
            barPadding = 1;

        return {
            margin: margin,
            width: width,
            height: height,
            colorBar: colorBar,
            barPadding: barPadding
        };
    }
    
    function dsBarChart() {

        var firstDatasetBarChart = datasetChosen(group);
        var basics = dsBarChartBasics();
        var margin = basics.margin,
            width = basics.width,
            height = basics.height,
            colorBar = basics.colorBar,
            barPadding = basics.barPadding;

        //set x and y scale     
        var xScale = d3.scale.linear()
            .domain([0, firstDatasetBarChart.length])
            .range([0, width]);
        var yScale = d3.scale.linear()
            .domain([0, d3.max(firstDatasetBarChart, function (d) {
                return d.income;})])
            .range([height, 0]);

        //Create SVG element, select css style for bar chart 
        var svg = d3.select("#barChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("id", "barChartPlot");

        var plot = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," +
                margin.top + ")");

        plot.selectAll("rect")
            .data(firstDatasetBarChart)
            .enter()
            .append("rect")
            .attr("x", function (d, i) { return xScale(i); })
            .attr("width", width / firstDatasetBarChart.length - barPadding)
            .attr("y", function (d) { return yScale(d.income); })
            .attr("height", function (d) { return height - yScale(d.income); })
            .attr("fill", "lightgrey");

        // Add y labels to plot  

        plot.selectAll("text")
            .data(firstDatasetBarChart)
            .enter()
            .append("text")
            .text(function (d) {
                return formatAsInteger(d3.round(d.income));
            })
            .attr("text-anchor", "middle")

            // Set x position to the left edge of each bar plus half the bar width 

            .attr("x", function (d, i) {
                return (i * (width / firstDatasetBarChart.length)) +
                    ((width / firstDatasetBarChart.length - barPadding) / 2);
            })
            .attr("y", function (d) {
                return yScale(d.income) + 14;
            })
            .attr("class", "yAxis");

        // Add x labels to chart  

        var xLabels = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," +
                (margin.top + height) + ")");

        xLabels.selectAll("text.xAxis")
            .data(firstDatasetBarChart)
            .enter()
            .append("text")
            .text(function (d) { return d.category; })
            .attr("text-anchor", "middle")

            // Set x position to the left edge of each bar plus half the bar width 
            .attr("x", function (d, i) {
                return (i * (width /
                    firstDatasetBarChart.length)) + ((width / firstDatasetBarChart.length -
                        barPadding) / 2);
            })
            .attr("y", 15)
            .attr("class", "xAxis");

        // Add Title of bar chart 

        svg.append("text")
            .attr("x", (width + margin.left + margin.right) / 2)
            .attr("y", 15)
            .attr("class", "title")
            .attr("text-anchor", "middle")
            .text("Overall Income Breakdown (2012)");

    }
    dsBarChart();

    /* ** UPDATE CHART ** */

    /* updates bar chart on request. Set the function as global */

    window.updateBarChart = function (group, colorChosen) {

        var currentDatasetBarChart = datasetChosen(group);

        var basics = dsBarChartBasics();

        var margin = basics.margin,
            width = basics.width,
            height = basics.height,
            colorBar = basics.colorBar,
            barPadding = basics.barPadding;

        var xScale = d3.scale.linear()
            .domain([0, currentDatasetBarChart.length])
            .range([0, width]);


        var yScale = d3.scale.linear()
            .domain([0, d3.max(currentDatasetBarChart, function (d) {
                return d.income;
            })])
            .range([height, 0]);

        var svg = d3.select("#barChart svg");

        var plot = d3.select("#barChartPlot")
            .datum(currentDatasetBarChart);

        /* Note that here we only need to select the elements */

        plot.selectAll("rect")
            .data(currentDatasetBarChart)
            .transition()
            .duration(750)
            .attr("x", function (d, i) {
                return xScale(i);
            })
            .attr("width", width / currentDatasetBarChart.length - barPadding)
            .attr("y", function (d) {
                return yScale(d.income);
            })
            .attr("height", function (d) {
                return height - yScale(d.income);
            })
            .attr("fill", colorChosen);

        // target the text element(s) which has a yAxis class defined 

        plot.selectAll("text.yAxis")
            .data(currentDatasetBarChart)
            .transition()
            .duration(750)
            .attr("text-anchor", "middle")
            .attr("x", function (d, i) {
                return (i * (width /
                    currentDatasetBarChart.length)) + ((width /
                        currentDatasetBarChart.length - barPadding) / 2);
            })
            .attr("y", function (d) { return yScale(d.income) + 14; })
            .text(function (d) {
                return formatAsInteger(d3.round(d.income));
            })
            .attr("class", "yAxis");

        // target the text element(s) which has a title class defined 

        svg.selectAll("text.title")
            .attr("x", (width + margin.left + margin.right) / 2)
            .attr("y", 15)
            .attr("class", "title")
            .attr("text-anchor", "middle")
            .text(group + "'s Income Breakdown (2012)")
            ;
    }
    /* 
        ############# LINE CHART ################### 
        ------------------------------------------- 
        */

    function dsLineChartBasics() {

        var margin = { top: 20, right: 10, bottom: 0, left: 50 },
            width = 500 - margin.left - margin.right,
            height = 150 - margin.top - margin.bottom;

        return {
            margin: margin,
            width: width,
            height: height};
    }

    function dsLineChart() {

        var firstDatasetLineChart = datasetChosen(group);
        
        var basics = dsLineChartBasics();

        var margin = basics.margin,
            width = basics.width,
            height = basics.height;

        var xScale = d3.scale.linear()
            .domain([0, firstDatasetLineChart.length - 1])
            .range([0, width]);

        var yScale = d3.scale.linear()
            .domain([0, d3.max(firstDatasetLineChart, function (d) { 
                return d.performance; })])
            .range([height, 0]);

        var line = d3.svg.line()
            .x(function(d, i) { 
                return xScale(i); })
            .y(function (d) {
                return yScale(d.performance); });

        var svg = d3.select("#lineChart").append("svg")
            .datum(firstDatasetLineChart)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

        // create group and move it so that margins are respected (space for axis and title)
        var plot = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("id", "lineChartPlot");

        /* descriptive titles as part of plot -- start */
        var dsLength = firstDatasetLineChart.length;
        
        plot.append("text")
            .text(firstDatasetLineChart[dsLength - 1].performance)
            .attr("id", "lineChartTitle2")
            .attr("x", width / 2)
            .attr("y", height / 2)
            ;
        /* descriptive titles -- end */

        plot.append("path")
            .attr("class", "line")
            .attr("d", line)
            // add color
            .attr("stroke", "lightgrey")
            ;

        plot.selectAll(".dot")
            .data(firstDatasetLineChart)
            .enter()
            .append("circle")
            .attr("class", "dot")
            //.attr("stroke", function (d) { return d.measure==datasetMeasureMin ? "red" : (d.measure==datasetMeasureMax ? "green" : "steelblue") } )
            .attr("fill", function (d) { return d.performance == d3.min(firstDatasetLineChart, function (d) { return d.performance; }) ? "red" : (d.performance == d3.max(firstDatasetLineChart, function (d) { return d.performance; }) ? "green" : "white") })
            //.attr("stroke-width", function (d) { return d.measure==datasetMeasureMin || d.measure==datasetMeasureMax ? "3px" : "1.5px"} )
            .attr("cx", line.x())
            .attr("cy", line.y())
            .attr("r", 3.5)
            .attr("stroke", "lightgrey")
            .append("title")
            .text(function (d) { return d.year + ": " + formatAsInteger(d.performance); })
            ;

        svg.append("text")
            .text("Performance on 2012")
            .attr("id", "lineChartTitle1")
            .attr("x", margin.left + ((width + margin.right) / 2))
            .attr("y", 10)
            ;

    }
    dsLineChart();

    /* ** UPDATE CHART ** */

    /* updates line chart on request */
    window.updateLineChart = function (group, colorChosen) {

        var currentDatasetLineChart = datasetChosen(group);

        var basics = dsLineChartBasics();

        var margin = basics.margin,
            width = basics.width,
            height = basics.height;

        var xScale = d3.scale.linear()
            .domain([0, currentDatasetLineChart.length - 1])
            .range([0, width]);

        var yScale = d3.scale.linear()
            .domain([0, d3.max(currentDatasetLineChart, function (d) { return d.performance; })])
            .range([height, 0]);

        var line = d3.svg.line()
            .x(function (d,i) { return xScale(i); })
            .y(function (d) { return yScale(d.performance); });

        var svg = d3.select("#lineChart svg");

        var plot = d3.select("#lineChartPlot")
            .datum(currentDatasetLineChart);

        /* descriptive titles as part of plot -- start */
        var dsLength = currentDatasetLineChart.length;

        plot.select("text")
            .text(currentDatasetLineChart[dsLength - 1].performance);
        /* descriptive titles -- end */

        plot
            .select("path")
            .transition()
            .duration(750)
            .attr("x",function(d, i){
                return xScale(i)
            })
            .attr("y", function(d){
                return yScale(d.performance)
            })
            .attr("class", "line")
            .attr("d", line)
            // add color
            .attr("stroke", colorChosen);

        plot
            .selectAll(".dot")
            .data(currentDatasetLineChart)
            .transition()
            .duration(750)
            .attr("class", "dot")
            .attr("fill", function (d) { return d.performance == d3.min(currentDatasetLineChart, function (d) { return d.performance; }) ? "red" : (d.performance == d3.max(currentDatasetLineChart, function (d) { return d.performance; }) ? "green" : "white") })
            .attr("cx", function(d,i){
                return xScale(i)
            })
            .attr("cy", function(d){
                return yScale(d.performance)
            })
            .attr("r", 3.5)
            // add color
            .attr("stroke", colorChosen)
            

        plot
            .selectAll('title')
            .data(currentDatasetLineChart)
            .text(function (d) { 
                return d.year + ": " + formatAsInteger(d.performance); })
    }
});
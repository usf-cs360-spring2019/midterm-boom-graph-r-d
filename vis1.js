const svgDom = document.getElementById("svg");

var margin = {top: 30, right: 10, bottom: 10, left: 10};

var width = svgDom.clientWidth - margin.left - margin.right;
var height = svgDom.clientHeight - margin.top - margin.bottom;


function createGraph(data) {
  var x = d3.scalePoint().range([0, width]).padding(1),
      y = {};

  var line = d3.line(),
      axis = d3.axisLeft(),
      background,
      foreground;

  const svg = d3.select("#svg");

  const svg_adjusted = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let headers = ["distanceFromDowntown","incidentCount", "averageResponseTime"];

  let toText = (key) => {
    return {
      "distanceFromDowntown": "Distance from downtown",
      "averageResponseTime": "Average Response Time",
      "incidentCount": "Number of incidents",
    }[key]
  }

  let sortAxis = (a,b) => headers.indexOf(a) - headers.indexOf(b);

  let dimensions = d3.keys(data[0]).filter(function(d) {
    if (headers.includes(d)) {
     y[d] = d3.scaleLinear()
         .domain(d3.extent(data, function(p) { return p[d];}))
         .range([height, 0]);

     return true;
    }
    return false;
  }).sort(sortAxis);

  x.domain(dimensions);

  let color = d3.scaleLinear()
  .domain([0, 7])
  .range(['#ff4d00', '#149428']);

  let size = d3.scaleLinear()
  .domain([0, 14000])
  .range([0, 3])

  // Add grey background lines for context.
  background = svg_adjusted.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(data)
    .enter().append("path")
      .attr("d", path);

  // Add blue foreground lines for focus.
  foreground = svg_adjusted.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(data)
    .enter().append("path")
      .attr("stroke", (d) => !d.hide ? color(d.distanceFromDowntown) : null)
      .attr("stroke-width", (d) => !d.hide ? size(d.incidentCount) : null)
      .attr("d", path);

  // Add a group element for each dimension.
  const g = svg_adjusted.selectAll(".dimension")
      .data(dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

  // Add an axis and title.
  g.append("g")
      .attr("class", "axis")
      .style("font-size", "1.2em")
      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    .append("text")
      .style("text-anchor", "middle")
      .style("font-size", "1.3em")
      .attr("y", -9)
      .text(function(d) { return toText(d); });

  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) {
          d3.select(this).call(y[d].brush = d3.brushY()
            .extent([[-10,0], [10,height]])
            .on("brush", brush)
            .on("end", brush)
            )
        })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);

  // Create Legend with gradient
  let gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "linear-gradient");

  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#ff4d00")

  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#149428")

  // Append Legend
  let legend = svg.append("g")
  .attr("class", "legend")

  legend.append("text")
    .attr("x", width - 110)
    .attr("y", 30)
    .style("font-size", "1.2em")
    .text("Mean Parent Income");

  legend.append("rect")
    .attr("x", width - 100)
    .attr("y", 40)
    .attr("width", 80)
    .attr("height", 20)
    .style("stroke", "black")
    .style("stroke-width", 1)
    .style("fill", "url(#linear-gradient)");

  legend.append("text")
    .attr("x", width - 100)
    .attr("y", 75)
    .attr("text-anchor", "middle")
    .text("0");

  legend.append("text")
    .attr("x", width - 20)
    .attr("y", 75)
    .attr("text-anchor", "middle")
    .text("550000");
  // Returns the path for a given data point.
  function path(d) {
    return line(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
  }

  // Handles a brush event, toggling the display of foreground lines.
  function brush() {
    var actives = [];
    svg.selectAll(".brush")
      .filter(function(d) {
            y[d].brushSelectionValue = d3.brushSelection(this);
            return d3.brushSelection(this);
      })
      .each(function(d) {
          // Get extents of brush along each active selection axis (the Y axes)
            actives.push({
                dimension: d,
                extent: d3.brushSelection(this).map(y[d].invert)
            });
      });

    var selected = [];
    // Update foreground to only display selected values
    foreground.style("display", function(d) {
        return actives.every(function(active) {
            let result = active.extent[1] <= d[active.dimension] && d[active.dimension] <= active.extent[0];
            if(result)selected.push(d);
            return result;
        }) ? null : "none";
    });
  }
}
createGraph(sourceData2000.map((data) => {
  return {
    ...data,
    hide: data.zipcode != 94105
  }
}));

// MAIN //

// Create global SVG DOM variable
const svgDom = document.getElementById("svg");

// Margins
let margin = {top: 30, right: 10, bottom: 10, left: 10};

// Graph width and height
let width = svgDom.clientWidth - margin.left - margin.right;
let height = svgDom.clientHeight - margin.top - margin.bottom;

const svg = d3.select("#svg");

const svg_adjusted = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// GLOBAL VARIABLES //

// Headers for parallel coordinate graph
let headers = ["distanceFromDowntown","incidentCount", "averageResponseTime"];

// Header key to text for label
let toText = (key) => {
  return {
    "distanceFromDowntown": "Distance from downtown (miles)",
    "averageResponseTime": "Average Response Time (s)",
    "incidentCount": "Number of incidents",
  }[key]
}

 // Axis sorting function
let sortAxis = (a,b) => headers.indexOf(a) - headers.indexOf(b);

// Create first graph with data given and append all paths to SVG
function createGraph(data) {
  let line = d3.line();
  let axis = d3.axisLeft();

  // Create x-y functions
  let x = d3.scalePoint().range([0, width]).padding(1);
  let y = {};

  // Create each dimension with scale and order by sortAxis
  let dimensions = d3.keys(data[0]).filter((d) => {
    if (headers.includes(d)) {
      y[d] = d3.scaleLinear()
         .domain(d3.extent(data, p => p[d]))
         .range([height, 0]);

      return true;
    }
    return false;
  }).sort(sortAxis);

  x.domain(dimensions);

  // Create color scale
  let color = d3.scaleLinear()
    .domain([
      d3.min(data, d => d.distanceFromDowntown),
      d3.max(data, d => d.distanceFromDowntown)
    ])
    .range(['#ff4d00', '#149428']);

  // Create size scale
  let size = d3.scaleLinear()
    .domain([
      d3.min(data, d => d.incidentCount),
      d3.max(data, d => d.incidentCount)
    ])
    .range([1, 4]);

  // Add lines
  svg_adjusted.append("g")
      .attr("class", "graph")
      .selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("stroke", d => !d.hide ? color(d.distanceFromDowntown) : "grey")
      .attr("stroke-width", d => !d.hide ? size(d.incidentCount) : 0.5)
      .attr("d", path);

  // Add a group element for each dimension.
  const g = svg_adjusted.selectAll(".dimension")
      .data(dimensions)
      .enter()
      .append("g")
      .attr("class", "dimension")
      .attr("transform", d => `translate(${x(d)})`);

  // Add an axis and title.
  g.append("g")
      .attr("class", "axis")
      .style("font-size", "1.2em")
      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    .append("text")
      .style("text-anchor", "middle")
      .style("font-size", "1.3em")
      .attr("y", -9)
      .text(d => toText(d));

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

    // Append Color Legend
    let legend = svg.append("g")
    .attr("class", "legend")

    legend.append("text")
      .attr("x", width - 125)
      .attr("y", 30)
      .style("font-size", "1.2em")
      .text("Distance from Downtown");

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
      .text("7 miles");

  // Returns the path for a given data point.
  function path(d) {
    return line(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
  }
}

// Updates graph data
function updateGraph(data) {
  let x = d3.scalePoint().range([0, width]).padding(1);
  let y = {};

  let line = d3.line();
  let axis = d3.axisLeft();

  // Update dimentions range and domain
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

  // Update color scale
  let color = d3.scaleLinear()
    .domain([
      d3.min(data, d => d.distanceFromDowntown),
      d3.max(data, d => d.distanceFromDowntown)
    ])
    .range(['#ff4d00', '#149428']);

  // Update size scale
  let size = d3.scaleLinear()
    .domain([
      d3.min(data, d => d.incidentCount),
      d3.max(data, d => d.incidentCount)
    ])
    .range([1, 4]);

  // Update path values
  svg_adjusted.select(".graph").selectAll("path")
    .data(data)
    .attr("d", path)
    .attr("stroke", (d) => !d.hide ? color(d.distanceFromDowntown) : "grey")
    .attr("stroke-width", (d) => {
      return d.highlight ? 3 : (!d.hide ? size(d.incidentCount) : 0.5);
    })

  // Update Dimensions and axis
  const g = d3.selectAll(".dimension")
      .data(dimensions)

  g.select(".axis")
      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })

  // Returns the path for a given data point.
  function path(d) {
    return line(dimensions.map(p => [x(p), y[p](d[p])]));
  }
}

// INIT
createGraph(sourceData2000);

// Set current data in use
let currentDataSource = sourceData2000;

// Update data source function
function updateDataSource(dataSource) {
  currentDataSource = dataSource;
  updateGraph(currentDataSource);
}

// Load per year data
$(".year").click((e) => {
  $(".year").removeClass("is-primary");
  $(e.currentTarget).addClass("is-primary");
  let year = $(e.currentTarget).attr("id");

  // Load corresponding year
  switch(year) {
    case "2000":
      updateDataSource(sourceData2000);
      break;
    case "2005":
      updateDataSource(sourceData2005);
      break;
    case "2010":
      updateDataSource(sourceData2010);
      break;
    case "2015":
      updateDataSource(sourceData2015);
      break;
    case "2018":
      updateDataSource(sourceData2018);
      break;
    default:
      updateDataSource(sourceData2000);
      break;
  }

  // Keep distance filter if it exists
  if($(".distance.is-primary").attr("id") !== "clear") {
      $(".distance.is-primary").click();
  }
})

// Load per distance from downtown data
$(".distance").click((e) => {
  $(".distance").removeClass("is-primary");
  $(".special").removeClass("is-primary");
  $(e.currentTarget).addClass("is-primary");
  let distance = $(e.currentTarget).attr("id");

  // Load corresponding year
  switch(distance) {
    case "short":
      updateDataSource(currentDataSource.map((location) => {
        return {
          ...location,
          hide: location.distanceFromDowntown > 2
        }
      }));
      break;
    case "medium":
      updateDataSource(currentDataSource.map((location) => {
        return {
          ...location,
          hide: location.distanceFromDowntown < 2 || location.distanceFromDowntown > 4
        }
      }));
      break;
    case "large":
    updateDataSource(currentDataSource.map((location) => {
      return {
        ...location,
        hide: location.distanceFromDowntown < 4
      }
    }));
      break;
    case "clear":
      $(".year.is-primary").click();
      break;
    default:
      updateDataSource(sourceData2000);
      break;
  }
})

$(".scroll").click((e) => {
  setTimeout(() => {
    $(".year#" + 2000).click();
  }, 1000);
  setTimeout(() => {
    $(".year#" + 2005).click();
  }, 3000);
  setTimeout(() => {
    $(".year#" + 2010).click();
  }, 5000);
  setTimeout(() => {
    $(".year#" + 2015).click();
  }, 7000);
  setTimeout(() => {
    $(".year#" + 2018).click();
  }, 9000);
})

$(".special").click((e) => {
  $(".special").removeClass("is-primary");
  $(e.currentTarget).addClass("is-primary");
  let special = $(e.currentTarget).attr("id");
  switch(special) {
    case "treasureIsland":
      updateDataSource(currentDataSource.map((location) => {
        return {
          ...location,
          hide: location.neighborhood !== "Treasure Island",
          highlight: location.neighborhood === "Treasure Island"
        }
      }));
      break;
    case "tenderloin":
      updateDataSource(currentDataSource.map((location) => {
        return {
          ...location,
          hide: location.zipcode !== "94102",
          highlight: location.zipcode === "94102"
        }
      }));
      break;
    case "usf":
      updateDataSource(currentDataSource.map((location) => {
        return {
          ...location,
          hide: location.zipcode !== "94117",
          highlight: location.zipcode === "94117"
        }
      }));
      break;
    case "mission":
      updateDataSource(currentDataSource.map((location) => {
        return {
          ...location,
          hide: location.neighborhood !== "Mission",
          highlight: location.neighborhood === "Mission"
        }
      }));
      break;
  }
})

$('select[name="dropdown"]').change(function() {
  updateDataSource(currentDataSource.map((location) => {
    return {
      ...location,
      hide: location.zipcode !== $(this).val(),
      highlight: location.zipcode === $(this).val()
    }
  }));
});

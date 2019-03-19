let svg = d3.select("svg");
let margin = {top: 20, right: 20, bottom: 30, left: 40};

let svgDom = document.getElementById("svg");

let width = svgDom.clientWidth - margin.left - margin.right;
let height = svgDom.clientHeight - margin.top - margin.bottom;

let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let keys = ["Potentially Life-Threatening", "Non Life-threatening", "Alarm", "Fire"];

function createGraph(data) {
  // set x scale
  let x = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.05)
      .align(0.1);

  // set y scale
  let y = d3.scaleLinear()
      .rangeRound([height, 0]);

  // set the colors
  let z = d3.scaleOrdinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  data.sort(function(a, b) { return a.zipcode - b.zipcode; });
  x.domain(data.map(function(d) { return d.zipcode; }));
  y.domain([0, d3.max(data, function(d) { return d.callCount; })]).nice();
  z.domain(keys);

  g.append("g")
    .attr("class", "graph")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))
    .enter().append("g")
      .attr("fill", function(d) { return z(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.data.zipcode); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth())
    .on("mouseover", function() { tooltip.style("display", null); })
    .on("mouseout", function() { tooltip.style("display", "none"); })
    .on("mousemove", function(d) {
      let xPosition = d3.mouse(this)[0] - 5;
      let yPosition = d3.mouse(this)[1] - 5;
      tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
      tooltip.select("text").text(d[1]-d[0]);
    });

  g.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis y-axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start");

  let legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });

  // Prep the tooltip bits, initial display is hidden
  let tooltip = svg.append("g")
    .attr("class", "tooltip")
    .style("display", "none");

  tooltip.append("rect")
    .attr("width", 60)
    .attr("height", 20)
    .attr("fill", "white")
    .style("opacity", 0.5);

  tooltip.append("text")
    .attr("x", 30)
    .attr("dy", "1.2em")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");
}


createGraph(sourceData2015);

function updateGraph(data) {
  let x = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.05)
      .align(0.1);

  // set y scale
  let y = d3.scaleLinear()
      .rangeRound([height, 0]);

  // set the colors
  let z = d3.scaleOrdinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  data.sort(function(a, b) { return a.zipcode - b.zipcode; });
  x.domain(data.map(function(d) { return d.zipcode; }));
  y.domain([0, d3.max(data, function(d) { return d.callCount; })]).nice();
  z.domain(keys);

  d3.select(".graph")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))

  d3.select(".graph")
    .selectAll("g")
    .selectAll("rect")
    .data(function(d) { return d; })
      .attr("x", function(d) { return x(d.data.zipcode); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth())

  g.select(".x-axis")
      .call(d3.axisBottom(x));

  g.select(".y-axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start");
}

function transformGraph(newData) {
  let data = newData.map((row) => {
    return {
      ...row,
      "Alarm": row["Alarm"] / row["callCount"],
      "Fire": row["Fire"] / row["callCount"],
      "Non Life-threatening": row["Non Life-threatening"] / row["callCount"],
      "Potentially Life-Threatening": row["Potentially Life-Threatening"] / row["callCount"]
    }
  });
  let x = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.05)
      .align(0.1);

  // set y scale
  let y = d3.scaleLinear()
      .rangeRound([height, 0]);

  x.domain(data.map(function(d) { return d.zipcode; }));
  y.domain([0, 1]);

  d3.select(".graph")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))

  d3.select(".graph")
    .selectAll("g")
    .selectAll("rect")
    .data(function(d) { return d; })
      .attr("x", function(d) { return x(d.data.zipcode); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth())

  g.select(".y-axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start");
}

// Load per year data
$(".year").click((e) => {
  $(".year").removeClass("is-primary");
  $(e.currentTarget).addClass("is-primary");
  if($(".transform").hasClass("is-primary")) {
    let year = $(".year.is-primary").attr("id");

    // Load corresponding year
    switch(year) {
      case "2014":
        transformGraph(sourceData2014);
        break;
      case "2015":
        transformGraph(sourceData2015);
        break;
      case "2016":
        transformGraph(sourceData2016);
        break;
      case "2017":
        transformGraph(sourceData2017);
        break;
      case "2018":
        transformGraph(sourceData2018);
        break;
      default:
        transformGraph(sourceData2014);
        break;
    }
    return;
  }
  $(".transform").removeClass("is-primary");
  let year = $(e.currentTarget).attr("id");

  // Load corresponding year
  switch(year) {
    case "2014":
      updateGraph(sourceData2014);
      break;
    case "2015":
      updateGraph(sourceData2015);
      break;
    case "2016":
      updateGraph(sourceData2016);
      break;
    case "2017":
      updateGraph(sourceData2017);
      break;
    case "2018":
      updateGraph(sourceData2018);
      break;
    default:
      updateGraph(sourceData2014);
      break;
  }
})
// Load per year data
$(".transform").click((e) => {
  if ($(e.currentTarget).hasClass("is-primary")) {
    $(".transform").removeClass("is-primary");
    $(".year.is-primary").click();
  } else {
    $(".transform").addClass("is-primary");
    let year = $(".year.is-primary").attr("id");

    // Load corresponding year
    switch(year) {
      case "2014":
        transformGraph(sourceData2014);
        break;
      case "2015":
        transformGraph(sourceData2015);
        break;
      case "2016":
        transformGraph(sourceData2016);
        break;
      case "2017":
        transformGraph(sourceData2017);
        break;
      case "2018":
        transformGraph(sourceData2018);
        break;
      default:
        transformGraph(sourceData2014);
        break;
    }
  }
})

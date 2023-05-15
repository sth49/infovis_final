class Scatterplot {
  margin = {
    top: 10,
    right: 100,
    bottom: 40,
    left: 40,
  };

  constructor(svg, data, width = 250, height = 250) {
    this.svg = svg;
    this.data = data;
    this.width = width;
    this.height = height;

    this.handlers = {};
  }

  initialize() {
    this.svg = d3.select(this.svg);
    this.container = this.svg.append("g");
    this.xAxis = this.svg.append("g");
    this.yAxis = this.svg.append("g");
    this.legend = this.svg.append("g");

    this.xScale = d3.scaleLinear();
    this.yScale = d3.scaleLinear();
    this.zScale = d3.scaleOrdinal().range(d3.schemeCategory10);

    this.svg
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    this.container.attr(
      "transform",
      `translate(${this.margin.left}, ${this.margin.top})`
    );
    this.brush = d3
      .brush()
      .extent([
        [0, 0],
        [this.width, this.height],
      ])
      .on("start brush", (event) => {
        this.brushCircles(event);
      });
    // TODO: create a brush object, set [[0, 0], [this.width, this.height]] as the extent, and bind this.brushCircles as an event listenr
  }

  update(xVar, yVar, colorVar, useColor) {
    this.xVar = xVar;
    this.yVar = yVar;

    this.xScale
      .domain(d3.extent(this.data, (d) => d[xVar]))
      .range([0, this.width]);
    this.yScale
      .domain(d3.extent(this.data, (d) => d[yVar]))
      .range([this.height, 0]);
    this.zScale.domain([...new Set(this.data.map((d) => d[colorVar]))]);

    this.circles = this.container.selectAll("circle").data(data).join("circle");

    this.circles
      .transition()
      .attr("cx", (d) => this.xScale(d[xVar]))
      .attr("cy", (d) => this.yScale(d[yVar]))
      .attr("fill", useColor ? (d) => this.zScale(d[colorVar]) : "black")
      .attr("r", 3);

    this.container.call(this.brush);

    this.xAxis
      .attr(
        "transform",
        `translate(${this.margin.left}, ${this.margin.top + this.height})`
      )
      .transition()
      .call(d3.axisBottom(this.xScale));

    this.yAxis
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
      .transition()
      .call(d3.axisLeft(this.yScale));

    if (useColor) {
      this.legend
        .style("display", "inline")
        .style("font-size", ".8em")
        .attr(
          "transform",
          `translate(${this.width + this.margin.left + 10}, ${this.height / 2})`
        )
        .call(d3.legendColor().scale(this.zScale));
    } else {
      this.legend.style("display", "none");
    }
  }
  isBrushed(d, selection) {
    // destructuring assignment
    let [[x0, y0], [x1, y1]] = selection;
    let x = this.xScale(d[this.xVar]);
    let y = this.yScale(d[this.yVar]);
    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
  }

  // isBrushed(d, selection) {
  //   let [[x0, y0], [x1, y1]] = selection; // destructuring assignment

  //   // TODO: return true if d's coordinate is inside the selection
  // }

  // this method will be called each time the brush is updated.
  brushCircles(event) {
    let selection = event.selection;

    this.circles.classed("brushed", (d) => this.isBrushed(d, selection));

    if (this.handlers.brush)
      this.handlers.brush(
        this.data.filter((d) => this.isBrushed(d, selection))
      );
  }

  on(eventType, handler) {
    this.handlers[eventType] = handler;
  }
}

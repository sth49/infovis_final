class Scatterplot {
  margin = {
    top: 50,
    right: 100,
    bottom: 40,
    left: 40,
  };

  constructor(svg, width = 250, height = 250) {
    this.svg = svg;
    // this.data = data;
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
  }

  update(data) {
    this.data = data;
    this.xVar = "sample_loss";
    this.yVar = "sample_acc";
    this.colorVar = "round";
    data = data.map((d) => {
      return {
        ...d,
        [this.xVar]: Math.min(d[this.xVar], 3),
      };
    });
    this.xScale
      .domain(d3.extent(data, (d) => d[this.xVar]))
      .range([0, this.width]);
    this.yScale
      .domain(d3.extent(data, (d) => d[this.yVar]))
      .range([this.height, 0]);
    let zDomain = [...new Set(data.map((d) => d[this.colorVar]))];
    this.zScale.domain(zDomain.sort((a, b) => a - b));
    console.log("update scatterplot:", data);

    this.circles = this.container.selectAll("circle").data(data).join("circle");

    this.circles
      .transition()
      .attr("cx", (d) => this.xScale(d[this.xVar]))
      .attr("cy", (d) => this.yScale(d[this.yVar]))
      .attr("fill", (d) => this.zScale(d[this.colorVar]))
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
    // let useColor = true;
    // if (useColor) {
    this.legend
      .style("display", "inline")
      .style("font-size", ".8em")
      .attr(
        "transform",
        `translate(${this.width + this.margin.left + 10}, ${this.height / 2})`
      )
      .call(d3.legendColor().scale(this.zScale));
    // } else {
    //   this.legend.style("display", "none");
    // }
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
    console.log("brushed2");
    this.circles.classed("brushed", (d) => this.isBrushed(d, selection));
    // let data = this.circles;
    if (this.handlers.brush)
      this.handlers.brush(
        this.data.filter((d) => this.isBrushed(d, selection))
      );
  }

  on(eventType, handler) {
    this.handlers[eventType] = handler;
  }
}

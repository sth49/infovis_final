class Scatterplot {
  margin = {
    top: 50,
    right: 100,
    bottom: 40,
    left: 40,
  };

  constructor(svg, width = 250, height = 250) {
    this.svg = svg;
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

    this.circles = this.container.selectAll("circle").data(data).join("circle");

    this.circles
      .transition()
      .attr("cx", (d) => this.xScale(d[this.xVar]))
      .attr("cy", (d) => this.yScale(d[this.yVar]))
      .attr("fill", (d) => this.zScale(d[this.colorVar]))
      .attr("r", 3);

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
    this.legend
      .style("display", "inline")
      .style("font-size", ".8em")
      .attr(
        "transform",
        `translate(${this.width + this.margin.left + 10}, ${this.height / 2})`
      )
      .call(d3.legendColor().scale(this.zScale));
  }
}

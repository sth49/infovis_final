// # 코드 출처: https://github.com/e-/d3-examples
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
      .attr("width", this.width + this.margin.left + this.margin.right + 20)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", this.width / 2 + this.margin.left + 30)
      .attr("y", this.height + this.margin.top + 40)
      .text("Loss");
    this.svg
      .append("text")
      .attr("class", "y-axis-label") // Add a class to the Y-axis label
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", this.margin.left - 20)
      .attr("x", -this.height / 2 + this.margin.top - 60)
      .text("Accuracy");

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
      .range([20, this.width]);
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
      .attr(
        "transform",
        `translate(${this.margin.left + 20}, ${this.margin.top})`
      )
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

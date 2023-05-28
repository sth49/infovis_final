// # 코드 출처: https://github.com/e-/d3-examples
class TsneScatterplot {
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
    this.zScale = d3.scaleSequential(d3.interpolateGreens).domain([0, 1]);

    this.svg
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .style("fill", "none")
      .style("stroke", "gray");

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
    this.xVar = "x";
    this.yVar = "y";
    this.colorVar = "sample_acc";

    this.xScale
      .domain(d3.extent(data, (d) => d[this.xVar]))
      .range([0, this.width]);
    this.yScale
      .domain(d3.extent(data, (d) => d[this.yVar]))
      .range([this.height, 0]);

    this.circles = this.container.selectAll("circle").data(data).join("circle");

    this.circles
      .transition()
      .attr("cx", (d) => this.xScale(d[this.xVar]))
      .attr("cy", (d) => this.yScale(d[this.yVar]))
      .attr("fill", (d) => this.zScale(d[this.colorVar]))
      .attr("r", 3);

    this.container.call(this.brush);
    this.legend
      .style("display", "inline")
      .style("font-size", ".8em")
      .attr(
        "transform",
        `translate(${this.width + this.margin.left + 10}, ${this.height / 2})`
      )
      .call(d3.legendColor().scale(this.zScale))
      .append("text")
      .text("Accuracy")
      .attr("y", -15)
      .attr("x", 20)
      .attr("dy", "0.5em")
      .style("text-anchor", "middle")
      .style("font-size", "1em");
  }
  isBrushed(d, selection) {
    let [[x0, y0], [x1, y1]] = selection;
    let x = this.xScale(d[this.xVar]);
    let y = this.yScale(d[this.yVar]);
    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
  }

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

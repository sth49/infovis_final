class Heatmap {
  margin = {
    top: 70,
    right: 80,
    bottom: 90,
    left: 90,
  };

  constructor(svg, data, width = 450, height = 450) {
    this.svg_id = svg;
    this.data = data;
    this.width = width - this.margin.left - this.margin.right;
    this.height = height - this.margin.top - this.margin.bottom;
  }

  initialize() {
    this.svg = d3.select(this.svg_id);
    this.container = this.svg.append("g");
    this.legend = this.svg.append("g");
    this.xAxis = this.svg.append("g");
    this.yAxis = this.svg.append("g");

    this.svg
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    this.container.attr(
      "transform",
      `translate(${this.margin.left}, ${this.margin.top})`
    );

    this.group = [
      "budget",
      "config_batch_size",
      "config_momentum",
      "config_hidden_size",
      "config_lerning_rate",
      "config_weight_decay",
      "sample_loss",
      "sample_acc",
    ];
    this.variable = [
      "budget",
      "config_batch_size",
      "config_momentum",
      "config_hidden_size",
      "config_lerning_rate",
      "config_weight_decay",
      "sample_loss",
      "sample_acc",
    ];
    let colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([1, -1]);
    let xScale = d3
      .scaleBand()
      .range([0, this.width])
      .domain(this.group)
      .paddingInner(0.05);

    let yScale = d3
      .scaleBand()
      .range([this.height, 0])
      .domain(this.variable)
      .paddingInner(0.05);

    this.rectangles = this.container
      .selectAll("rect")
      .data(this.data)
      .join("rect");
    this.rectangles
      .transition()
      .attr("x", (d) => xScale(d.group))
      .attr("y", (d) => yScale(d.variable))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .style("fill", (d) => colorScale(d.value));

    this.xAxis
      .attr(
        "transform",
        `translate(${this.margin.left}, ${this.margin.top + this.height})`
      )
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-90)");
    this.yAxis
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
      .call(d3.axisLeft(yScale));

    this.legend
      .style("display", "inline")
      .style("font-size", ".8em")
      .attr(
        "transform",
        `translate(${this.width + this.margin.left + 10}, ${this.height / 2})`
      )
      .call(d3.legendColor().scale(colorScale))
      .append("text")
      .text("Correlation")
      .attr("y", -15)
      .attr("x", 30)
      .attr("dy", "0.5em")
      .style("text-anchor", "middle")
      .style("font-size", "1em");
    // tooltip 생성 부분을 initialize 밖으로 빼냅니다.
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("position", "absolute"); // position이 absolute가 되어야 합니다.

    const mouseover = function (event, d) {
      tooltip.style("opacity", 1);
    };

    const mousemove = function (event, d) {
      tooltip
        .html("Correlation is: " + d.value)
        .style("left", event.pageX + 10 + "px") // event.x 대신 event.pageX를 사용
        .style("top", event.pageY + 10 + "px"); // event.y 대신 event.pageY를 사용
    };

    const mouseleave = function (d) {
      tooltip.style("opacity", 0);
    };

    this.container
      .selectAll("rect")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);
  }
}

class Histogram {
  margin = {
    top: 10,
    right: 10,
    bottom: 40,
    left: 40,
  };

  constructor(svg, width = 250, height = 250) {
    this.svg = svg;
    this.width = width;
    this.height = height;
  }

  initialize() {
    // 사용자가 선택한 것만 그러야 함.
    this.svg = d3.select(this.svg);
    this.container = this.svg.append("g");
    this.xAxis = this.svg.append("g");
    this.yAxis = this.svg.append("g");
    this.legend = this.svg.append("g");

    this.xScale = d3.scaleBand();
    this.yScale = d3.scaleLinear();
    this.zScale = d3.scaleSequential(d3.interpolateReds).domain([0, 1]);
    this.svg
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    this.container.attr(
      "transform",
      `translate(${this.margin.left}, ${this.margin.top})`
    );
  }

  update(data) {
    // 선택된 애들만 업데이트
    let xVar = "sample_type";
    const categories = [...new Set(data.map((d) => d[xVar]))];
    const counts = {};
    const zData = [];
    categories.forEach((c) => {
      let sum = 0;
      counts[c] = data.filter((d) => d[xVar] === c).length;
      data
        .filter((d) => d[xVar] === c)
        .forEach((d) => {
          sum += d["sample_acc"];
        });
      zData.push(sum / counts[c]);
    });
    // zData.push(data.filter((d) => d['sample_type']== 'BO'))

    this.xScale.domain(categories).range([0, this.width]).padding(0.3);
    this.yScale
      .domain([0, d3.max(Object.values(counts))])
      .range([this.height, 0]);

    // TODO: draw a histogram
    this.container
      .selectAll("rect")
      .data(categories)
      .join("rect")
      .attr("x", (d) => this.xScale(d))
      .attr("y", (d) => this.yScale(counts[d]))
      .attr("width", this.xScale.bandwidth())
      .attr("height", (d) => this.height - this.yScale(counts[d]))
      .attr("fill", (d, i) => this.zScale(zData[i]));
    this.xAxis
      .attr(
        "transform",
        `translate(${this.margin.left}, ${this.margin.top + this.height})`
      )
      .call(d3.axisBottom(this.xScale));

    this.yAxis
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
      .call(d3.axisLeft(this.yScale));
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
        .html(
          "Count :" +
            counts[d] +
            "<br>" +
            "Accuracy :" +
            zData[Object.keys(counts).indexOf(d)].toFixed(3)
        )
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

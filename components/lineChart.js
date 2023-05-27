class LineChart {
  margin = {
    top: 30,
    right: 100,
    bottom: 40,
    left: 50,
  };
  // 생성자
  constructor(svg, dataloader, width = 400, height = 350) {
    this.svg = svg;
    this.dataloader = dataloader;
    this.width = width;
    this.height = height;
    this.handlers = {};
    this.selectedLine = null;
    this.selectedRound = null;
    this.handlers = {};
  }
  // 초기화
  initialize() {
    this.svg = d3.select(this.svg);
    this.legend = this.svg.append("g");
    this.svg
      .attr("width", this.width + this.margin.left + this.margin.right + 20)
      .attr("height", this.height + this.margin.top + this.margin.bottom);
    this.container = this.svg.append("g");
    this.container.attr(
      "transform",
      `translate(${this.margin.left}, ${this.margin.top})`
    );
    this.xAxis = this.svg.append("g");
    this.yAxis = this.svg.append("g");
    this.xScale = d3.scalePoint(); // round
    this.yScale = d3.scaleLinear(); // 평균 accuracy
    this.zScale = d3.scaleOrdinal().range(d3.schemeCategory10); // bracket
    // x축 y축 레이블
  }
  update(dataType) {
    let text = "Avg. Accuracy";
    if (dataType === "linechart") {
      this.data = this.dataloader.linechart;
    } else if (dataType === "linechart2") {
      this.data = this.dataloader.linechart2;
      text = "Best Accuracy";
    }
    // Check if Y-axis label already exists
    const yAxisLabel = this.svg.select(".y-axis-label");
    if (yAxisLabel.empty()) {
      this.svg
        .append("text")
        .attr("class", "y-axis-label") // Add a class to the Y-axis label
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", this.margin.left - 20)
        .attr("x", -this.height / 2 + this.margin.top)
        .text(text);
    } else {
      yAxisLabel.text(text); // Update the existing Y-axis label text
    }
    this.svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", this.width / 2 + this.margin.left + 30)
      .attr("y", this.height + this.margin.top + 40)
      .text("Round");

    // 범례

    // 매핑할 변수
    this.xVar = "round";
    this.yVar = "avg_acc";
    this.colorVar = "bracket";
    // x축 y축 color 범위 설정
    this.xScale.domain([-0.3, 0, 1, 2, 3, 4, 5]).range([20, this.width]);
    this.yScale
      .domain(d3.extent(this.data, (d) => d[this.yVar]))
      .range([this.height, 0]);
    let zDomain = [...new Set(this.data.map((d) => d[this.colorVar]))];
    this.zScale.domain(zDomain.sort((a, b) => a - b));
    // 점 그리기
    this.circles = this.container
      .selectAll("circle")
      .data(this.data)
      .join("circle")
      .attr("cx", (d) => this.xScale(d[this.xVar]))
      .attr("cy", (d) => this.yScale(d[this.yVar]))
      .attr("fill", (d) => this.zScale(d[this.colorVar]))
      .attr("r", 3);
    // x,y 축 그리기
    this.xAxis
      .attr(
        "transform",
        `translate(${this.margin.left}, ${this.margin.top + this.height})`
      )
      .transition()
      .call(d3.axisBottom(this.xScale).tickValues([0, 1, 2, 3, 4, 5]));
    this.yAxis
      .attr(
        "transform",
        `translate(${this.margin.left + 20}, ${this.margin.top})`
      )
      .transition()
      .call(d3.axisLeft(this.yScale));
    // 라인 정보들
    this.line = d3
      .line()
      .x((d) => this.xScale(d[this.xVar]))
      .y((d) => this.yScale(d[this.yVar]));
    this.groups = Array.from(
      d3.group(this.data, (d) => d[this.colorVar]),
      ([key, value]) => ({ key, value })
    );

    // 라인 그리기
    this.container
      .selectAll("path.line")
      .data(this.groups)
      .join("path")
      .attr("class", "line")
      .attr("d", (d) => this.line(d.value))
      .style("stroke", (d) => this.zScale(d.key))
      .style("fill", "none")
      // hover 효과
      .on("mouseover", function (event, d) {
        d3.select(this).style("stroke-width", "4");
      })
      .on("mouseout", (event, d) => {
        if (this.selectedLine !== d) {
          d3.select(event.target).style("stroke-width", "1");
        }
      })
      // line에 대한 클릭 효과
      .on("click", (event, d) => {
        event.stopPropagation();
        if (this.selectedLine) {
          this.container
            .selectAll("path.line")
            .filter((line) => line === this.selectedLine)
            .style("stroke-width", "1");
          this.circles
            .filter((circle) => circle.bracket === this.selectedLine.key)
            .style("r", "3");
        }
        this.selectedLine = d;
        d3.select(event.target).style("stroke-width", "4");
        this.circles
          .filter((circle) => circle.bracket === d.key)
          .style("r", "5");
        if (this.handlers.clicked) {
          this.handlers.clicked(d.key);
        }
      });
    // line 이외의 영역을 클릭했을 때
    this.svg.on("click", () => {
      if (this.selectedLine) {
        this.container
          .selectAll("path.line")
          .filter((line) => line === this.selectedLine)
          .style("stroke-width", "1");
        this.circles
          .filter((circle) => circle.bracket === this.selectedLine.key)
          .style("r", "3");
        this.selectedLine = null;
        // handler
        if (this.handlers.clicked) {
          this.handlers.clicked(null);
        }
      }
    });
    // 점에 대한 클릭 효과
    this.circles.on("click", (event, d) => {
      event.stopPropagation();
      if (this.selectedLine) {
        this.container
          .selectAll("path.line")
          .filter((line) => line === this.selectedLine)
          .style("stroke-width", "1");
        this.circles
          .filter((circle) => circle.bracket === this.selectedLine.key)
          .style("r", "3");
      }
      this.selectedLine = this.groups.filter(
        (line) => line.key === d.bracket
      )[0];
      this.container
        .selectAll("path.line")
        .filter((line) => line === this.selectedLine)
        .style("stroke-width", "4");
      this.circles
        .filter((circle) => circle.bracket === d.bracket)
        .style("r", "5");
      if (this.handlers.clicked) {
        this.handlers.clicked(this.selectedLine.key);
      }
    });
    this.legend
      .style("display", "inline")
      .style("font-size", ".8em")
      .attr(
        "transform",
        `translate(${this.width + this.margin.left + 10}, ${this.height / 2})`
      )
      .call(d3.legendColor().scale(this.zScale));
  }

  on(event, handler) {
    this.handlers[event] = handler;
  }
}

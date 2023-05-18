class DataTable {
  constructor(id, columns) {
    this.id = id;

    columns = columns
      .filter((d) => d != "bracket")
      .filter((d) => d != "round")
      .filter((d) => d != "trial")
      .filter((d) => d != "x")
      .filter((d) => d != "y");
    this.columns = columns;
    this.columns.unshift("id");
  }
  update(data) {
    // console.log(columns);
    // columns = columns || Object.keys(data[0]);
    data.sort((b, a) => a["sample_acc"] - b["sample_acc"]);
    console.log(this.columns);
    let table = d3.select(this.id);
    let rows = table.selectAll("tr").data(data).join("tr");
    console.log("data", data);
    rows
      .selectAll("td")
      .data((d) => this.columns.map((c) => d[c]))
      .join("td")
      .text((d) => d);
  }
}

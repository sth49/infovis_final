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
  update(data, sortingType) {
    console.log("sortingType", sortingType);
    console.log(data);
    if (sortingType === "sample_id") {
      data.sort((a, b) => {
        let comparison = a["bracket"] - b["bracket"];

        if (comparison === 0) {
          comparison = a["round"] - b["round"];
        }

        if (comparison === 0) {
          comparison = a["trial"] - b["trial"];
        }
        return comparison;
      });
    } else if (typeof data[0][sortingType] === "string") {
      data.sort((a, b) => a[sortingType].localeCompare(b[sortingType]));
    } else {
      data.sort((b, a) => a[sortingType] - b[sortingType]);
    }

    let table = d3.select(this.id);
    let rows = table.selectAll("tr").data(data).join("tr");
    rows
      .selectAll("td")
      .data((d) => this.columns.map((c) => d[c]))
      .join("td")
      .text((d) => d);
  }
}

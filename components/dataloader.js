class DataLoader {
  constructor(csvData, csvData2) {
    this.data = csvData;
    this.corr = csvData2;
    this.brackets = [];
    for (let i = 5; i >= 0; i--) {
      this.brackets[i] = this.data.filter((d) => d["bracket"] == i);
    }
    this.rounds = [];
    this.linechart = [];
    this.linechart2 = [];
    this.rounds_best = [];
    for (let j = 5; j >= 0; j--) {
      this.rounds[j] = []; // 초기화
      this.rounds_best[j] = [];
      for (let i = 0; i <= j; i++) {
        this.rounds[j][i] = this.brackets[j].filter((d) => d["round"] == i);
        this.rounds_best[j][i] = this.rounds[j][i].filter(
          (d) =>
            d["sample_acc"] == d3.max(this.rounds[j][i], (d) => d["sample_acc"])
        );
        this.linechart.push({
          bracket: j,
          round: i,
          avg_acc: d3.mean(this.rounds[j][i], (d) => d["sample_acc"]),
        });
        this.linechart2.push({
          bracket: j,
          round: i,
          avg_acc: this.rounds_best[j][i][0]["sample_acc"],
        });
      }
    }
  }
}

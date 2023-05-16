class DataLoader {
  constructor(csvData) {
    this.data = csvData;
    console.log(this.data);
    this.brackets = [];
    for (let i = 5; i >= 0; i--) {
      this.brackets[i] = this.data.filter((d) => d["bracket"] == i);
    }
    console.log(this.brackets);
    this.rounds = [];
    this.linechart = [];
    for (let j = 5; j >= 0; j--) {
      this.rounds[j] = []; // 초기화
      for (let i = 0; i <= j; i++) {
        this.rounds[j][i] = this.brackets[j].filter((d) => d["round"] == i);
        this.linechart.push({
          bracket: j,
          round: i,
          avg_acc: d3.mean(this.rounds[j][i], (d) => d["sample_acc"]),
        });
      }
    }
    console.log(this.linechart);
  }
}

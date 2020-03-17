async function createChart(divName, data, dates, color) {
  let chart = await new ApexCharts(document.getElementById(divName), {
    series: [
      {
        name: "Temperatura",
        data: data
      }
    ],
    chart: {
      type: "area",
      height: "100%",
      width: "100%"
    },
    dataLabels: {
      enabled: false
    },
    colors: [color],
    stroke: {
      curve: "smooth"
    },
    labels: dates,
    xaxis: {
      labels: {
        show: false
      }
    }
  });
  return chart.render();
}

fetch("http://192.168.0.120:5656/readDB")
  .then(data => data.json())
  .then(async data => {
    await createChart(
      "chart-inroom-curr",
      data.insideC.map(e => e.temp),
      data.insideC.map(e => e.date),
      "#39d428"
    );
    await createChart(
      "chart-inroom-daily",
      data.insideD.map(e => e.temp),
      data.insideD.map(e => e.date),
      "#249c17"
    ),
      await createChart(
        "chart-outroom-curr",
        data.outsideC.map(e => e.temp),
        data.outsideC.map(e => e.date),
        "#2ac5e8"
      );
    await createChart(
      "chart-outroom-daily",
      data.outsideD.map(e => e.temp),
      data.outsideD.map(e => e.date),
      "#2a7adb"
    );
  });

function createChart(divName, data, dates) {
  var options = {
    series: [
      {
        name: "Przykładowa wartość",
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
    stroke: {
      curve: "smooth"
    },
    labels: dates,
    xaxis: {
      labels: {
        show: false
      }
    },
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm"
      }
    }
  };

  var chart = new ApexCharts(document.getElementById(divName), options);
  chart.render();
}

fetch("http://192.168.0.120:5656/readDB")
  .then(data => data.json())
  .then(async data => {
    await createChart(
      "chart-inroom-curr",
      data.insideC.map(e => e.temp),
      data.insideC.map(e => e.date)
    );
    await createChart(
      "chart-inroom-daily",
      data.insideD.map(e => e.temp),
      data.insideD.map(e => e.date)
    );
    await createChart(
      "chart-outroom-curr",
      data.outsideC.map(e => e.temp),
      data.outsideC.map(e => e.date)
    );
    await createChart(
      "chart-outroom-daily",
      data.outsideD.map(e => e.temp),
      data.outsideD.map(e => e.date)
    );
  });

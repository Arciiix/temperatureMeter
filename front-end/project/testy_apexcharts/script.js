function createChart(divName) {
  var options;
  (async () => {
    options = {
      series: [
        {
          name: "Przykładowa wartość",
          data: random(500)
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
  })().then(() => {
    var chart = new ApexCharts(document.getElementById(divName), options);
    chart.render();
  });
}

function random(times) {
  let arr = new Array();
  for (let i = 0; i < times; i++) {
    arr.push(Math.floor(Math.random() * 100));
  }
  return arr;
}

createChart("myChart1");
createChart("myChart2");
createChart("myChart3");
createChart("myChart4");

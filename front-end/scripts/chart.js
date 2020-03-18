//Divs
let inside_C = document.getElementById("chart-inroom-curr");
let inside_D = document.getElementById("chart-inroom-daily");
let outside_C = document.getElementById("chart-outroom-curr");
let outside_D = document.getElementById("chart-outroom-daily");

async function createChart(div, data, dates, color) {
  let chart = new ApexCharts(div, {
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
  setTimeout(() => {
    return new Promise(resolve => {
      chart.render().then(resolve());
    });
  }, 100);
}

fetch("http://192.168.0.120:5656/readDB")
  .then(data => data.json())
  .then(async data => {
    //Making arrays with data
    let temps = [
      data.insideC.map(e => e.temp),
      data.insideD.map(e => e.temp),
      data.outsideC.map(e => e.temp),
      data.outsideD.map(e => e.temp)
    ];
    let dates = [
      data.insideC.map(e => e.date),
      data.insideD.map(e => e.date),
      data.outsideC.map(e => e.date),
      data.outsideD.map(e => e.date)
    ];
    //Rendering charts
    await createChart(inside_C, temps[0], dates[0], "#39d428");
    await createChart(inside_D, temps[1], dates[1], "#249c17");
    await createChart(outside_C, temps[2], dates[2], "#2ac5e8");
    await createChart(outside_D, temps[3], dates[3], "#2a7adb");
  });

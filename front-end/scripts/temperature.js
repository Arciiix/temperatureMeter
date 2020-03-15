let temperatureInside = document.getElementById("tempInside");
let temperatureOutside = document.getElementById("tempOutside");
let insideValue, outsideValue;

//Temperatures
fetch("http://192.168.0.120:5656/getData")
  .then(data => data.json())
  .then(data => {
    temperatureInside.innerText += " " + data.temperature + "°C";
    temperatureInside.style.opacity = 1;
    insideValue = parseFloat(data.temperature);
    temperatureOutside.innerText += " " + data.outsideTemperature + "°C";
    temperatureOutside.style.opacity = 1;
    outsideValue = parseFloat(data.outsideTemperature);
    setColors(data);
  });

function setColors(data) {
  if (insideValue <= data.limits.max && insideValue >= data.limits.min) {
    temperatureInside.style.color = "#71f071";
  } else if (insideValue >= data.limits.max) {
    temperatureInside.style.color = "#e6a720";
  } else {
    temperatureInside.style.color = "#2079e6";
  }

  if (outsideValue < data.limits.minO) {
    temperatureOutside.style.color = "#2079e6";
  } else {
    temperatureOutside.style.color = "#71f071";
  }
}

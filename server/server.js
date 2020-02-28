const refreshRate = 60; //in seconds, time between temperature measurements
const outsideRefreshRate = 15; //in minutes, time between OUTSIDE temperature mesurements

const express = require("express");
const app = express();
const port = 5656;

const fetch = require("node-fetch");
const { Expo } = require("expo-server-sdk");

let expo = new Expo();

let token = "";

let temperature = 0;
outsideTemp = 0;

let alert = "normal";
let outsideAlert = false; //false - it's bad, true - it's good

let temperatures = {
  min: 19, //minimum inside
  max: 24, //maximum inside
  minO: 15 //ideal minimum outside
};

const nightHours = {
  start: 22,
  end: 10
};

let insideInterval, outsideInterval;

let nightMode = false;

const api = require("./api.js");

app.get("/token", (req, res, next) => {
  if (!Expo.isExpoPushToken(req.query.token)) {
    console.error(
      `[${formatDate(new Date())}] Token ${
        req.query.token
      } is not a valid Expo push token`
    );
    res.send("invaild");
  } else {
    token = req.query.token;
    console.log(`[${formatDate(new Date())}] New token has been set!`);
    res.send("set");
  }
});

app.get("/temp", (req, res, next) => {
  res.send(temperature.toString());
});

app.get("/setTemp", (req, res, next) => {
  temperatures.min = +req.query.min;
  temperatures.max = +req.query.max;
  res.send("good");
  console.log(
    `[${formatDate(new Date())}] Set new min and max temperatures values: ${
      temperatures.min
    } and ${temperatures.max}`
  );
});

app.get("/outsideTemp", (req, res, next) => {
  res.send(outsideTemp.toString());
});

app.get("/getTemp", (req, res, next) => {
  res.send(JSON.stringify(temperatures));
});

app.get("/setOutsideLimit", (req, res, next) => {
  temperatures.minO = +req.query.temp;
  console.log(
    `[${formatDate(new Date())}] Set new ideal outside temperature value: ${
      temperatures.minO
    }`
  );
  res.send("good");
});

function getTempInside() {
  fetch("http://192.168.0.115/getInfo")
    .then(data => data.text())
    .then(data => {
      let spanStart = data.indexOf("<span>") + 4; //When the infomation starts
      let spanEnd = data.indexOf("</span>"); //When the information ends
      let parsed;
      for (let i = spanStart; i < spanEnd; i++) {
        parsed += data.charAt(i); //Create a string with the information
      }

      //INDEX
      //alarm time
      //is alarm active
      //temperature
      //time
      //is alarm now running
      //version

      parsed = parsed.split(" "); //Making the data an array
      //We need temperature, so it is 3th, so [2]
      temperature = parsed[2];
      sendPush(temperature);
    });
}

function sendPush(temp) {
  let tempAlert = "";
  if (temp >= temperatures.max) {
    tempAlert = "hot";
  } else if (temp <= temperatures.max && temp >= temperatures.min) {
    tempAlert = "good";
  } else {
    tempAlert = "cold";
  }

  if (alert != tempAlert) {
    alert = tempAlert;

    if (token != "" && alert != "good") {
      let message = [
        {
          to: token,
          sound: "default",
          body:
            alert === "cold"
              ? "Temperatura w pokoju jest zbyt mała!"
              : "Temperatura w pokoju jest zbyt duża!"
        }
      ];
      send(message);
    }
  }
}

function send(message) {
  let chunks = expo.chunkPushNotifications(message);

  (async () => {
    for (let chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
        console.log(`[${formatDate(new Date())}] Sent a push notification!`);
      } catch (error) {
        console.error(
          `[${formatDate(new Date())}] Error while sending push notification`
        );
      }
    }
  })();
}

function getOutsideTemp() {
  fetch(
    "https://airapi.airly.eu/v2/measurements/point?lat=49.98844&lng=18.55807",
    {
      method: "get",
      headers: {
        apikey: api
      }
    }
  )
    .then(data => data.json())
    .then(data => {
      let lastElem = data.current.values.length;
      outsideTemp = data.current.values[lastElem - 1].value;
      sendPushOutside(outsideTemp);
    })
    .catch(err => {
      console.error(
        `[${formatDate(new Date())}] Error while getting outside temperature`
      );
    });
}

function sendPushOutside(temp) {
  let tempAlert = null;
  if (temp >= temperatures.minO) {
    tempAlert = true;
  } else {
    tempAlert = false;
  }
  if (outsideAlert != tempAlert) {
    outsideAlert = tempAlert;
    if (token != "" && outsideAlert === true) {
      let message = [
        {
          to: token,
          sound: "default",
          body: "Temperatura na dworze jest idealna!"
        }
      ];
      send(message);
    }
  }
}

function formatDate(date) {
  return `${date.getHours() < 10 ? "0" + date.getHours() : date.getHours()}:${
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
  }:${date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()} ${
    date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
  }.${
    date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
  }.${date.getFullYear()}`;
}

//
outsideTemp = 5;

app.listen(port, () => console.log(`Server started at port ${port}!`));

insideInterval = setInterval(getTempInside, refreshRate * 1000);
outsideInterval = setInterval(getOutsideTemp, outsideRefreshRate * 60000);

setInterval(() => {
  let currDate = new Date();
  if (currDate.getHours() == nightHours.start && !nightMode) {
    nightMode = true;
    clearInterval(insideInterval);
    clearInterval(outsideInterval);
    console.log(`[${formatDate(new Date())}] Night mode has started!`);
  } else if (currDate.getHours() == nightHours.end && nightMode) {
    nightMode = false;
    insideInterval = setInterval(getTempInside, refreshRate * 1000);
    outsideInterval = setInterval(getOutsideTemp, outsideRefreshRate * 60000);
    console.log(`[${formatDate(new Date())}] Night mode has ended!`);
  }
}),
  60000;

const refreshRate = 60; //in seconds, time between temperature measurements

const express = require("express");
const app = express();
const port = 5656;

const fetch = require("node-fetch");
const { Expo } = require("expo-server-sdk");

let expo = new Expo();

let token = "";

let temperature = 0;

let alert = "normal";

let temperatures = {
  min: 19,
  max: 24
};

app.get("/token", (req, res, next) => {
  if (!Expo.isExpoPushToken(req.query.token)) {
    console.error(`Token ${req.query.token} is not a valid Expo push token`);
    res.send("invaild");
  } else {
    token = req.query.token;
    console.log("New token has been set!");
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
    `Set new min and max temperatures values: ${temperatures.min} and ${temperatures.max}`
  );
});

app.get("/getTemp", (req, res, next) => {
  res.send(JSON.stringify(temperatures));
});

setInterval(() => {
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
}, refreshRate * 1000);

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

      let chunks = expo.chunkPushNotifications(message);

      (async () => {
        for (let chunk of chunks) {
          try {
            await expo.sendPushNotificationsAsync(chunk);
            console.log("Sent a push notification!");
          } catch (error) {
            console.error(error);
          }
        }
      })();
    }
  }
}

app.listen(port, () => console.log(`Server started at port ${port}!`));

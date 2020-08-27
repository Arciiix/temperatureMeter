const refreshRate = 60; //in seconds, time between temperature measurements
const outsideRefreshRate = 15; //in minutes, time between OUTSIDE temperature measurements and savings to the database

const express = require("express");
const app = express();
const port = 5656;

const fetch = require("node-fetch");
const { Expo } = require("expo-server-sdk");

const cors = require("cors");
app.use(cors());

let expo = new Expo();

//Database
const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("./db.db", (err) => {
  if (err) {
    console.log(
      `[${formatDate(new Date())}] Error while connecting to the database`
    );
  } else {
    console.log(`[${formatDate(new Date())}] Connected to the database`);
  }
});

let rowsTable = [];
let token = "";

let temperature = 0;
outsideTemp = 0;

let alert = "normal";
let outsideAlert = false; //false - it's bad, true - it's good

//Arrays for average value of temperatures
let averageOut = new Array();
let averageIn = new Array();

let temperatures = {
  min: 19, //minimum inside
  max: 24, //maximum inside
  minO: 15, //ideal minimum outside
};

/*
const nightHours = {
  start: 22,
  end: 10
};
*/

const savingAverageTempHour = 22;
let didSaveTheAverageTemp = false;

let insideInterval, outsideInterval, savingInterval;

let shouldOverwrite = false;
//let nightMode = false;

//const api = require("./api.js");

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

app.get("/getData", (req, res, next) => {
  let obj = {
    temperature: temperature.toString(),
    outsideTemperature: outsideTemp.toString(),
    limits: temperatures,
  };
  res.send(JSON.stringify(obj));
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

//Database data send
app.get("/readDB", async (req, res, next) => {
  rowsTable = [];
  await readFromDB("inroom_d");
  await readFromDB("inroom_c");
  await readFromDB("outroom_d");
  await readFromDB("outroom_c");
  setTimeout(() => {
    let obj = {};
    obj.insideD = rowsTable[0];
    obj.insideC = rowsTable[1];
    obj.outsideD = rowsTable[2];
    obj.outsideC = rowsTable[3];
    res.send(obj);
  }, 1000);
});

function readFromDB(tableName) {
  let sql = `SELECT * FROM ${tableName}`;

  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject();
        throw err;
      }
      rowsTable.push(rows);
      resolve();
    });
  });
}

function getTempInside() {
  fetch("http://192.168.0.115/getInfo")
    .then((data) => data.text())
    .then((data) => {
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
      averageIn.push(temperature);
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
              : "Temperatura w pokoju jest zbyt duża!",
        },
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
  /*
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
      averageOut.push(outsideTemp);
      sendPushOutside(outsideTemp);
      //Saving current temperatures to the database
      addTemps();
    })
    .catch(err => {
      console.error(
        `[${formatDate(new Date())}] Error while getting outside temperature`
      );
    });
    */
  fetch(`http://10.249.20.150:8080/json.htm?type=devices&rid=33`) //Local temperature sensor in domoticz
    .then((data) => data.json())
    .then((data) => {
      if (!data.result) {
        return console.error(
          `[${formatDate(
            new Date()
          )}] Error while getting outside temperature - the JSON output is not valid`
        );
      }
      let currOutsideTemp = parseFloat(data.result[0].Temp).toFixed(2);
      if (!isNaN(currOutsideTemp) && currOutsideTemp !== 0) {
        outsideTemp = currOutsideTemp;
      }
      averageOut.push(outsideTemp);
      sendPushOutside(outsideTemp);
    })
    .catch((err) => {
      console.error(
        `[${formatDate(
          new Date()
        )}] Error while getting outside temperature: ${err}`
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
          body: "Temperatura na dworze jest idealna!",
        },
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

insideInterval = setInterval(getTempInside, refreshRate * 1000);
outsideInterval = setInterval(getOutsideTemp, outsideRefreshRate * 60000);
savingInterval = setInterval(addTemps, outsideRefreshRate * 60000 + 10000); //Give the outside temperature fetch some time

setInterval(() => {
  let currDate = new Date();
  if (currDate.getHours() == savingAverageTempHour && !didSaveTheAverageTemp) {
    didSaveTheAverageTemp = true;
    //Average of the outside temp
    let averageOutside = average(averageOut);
    let averageInside = average(averageIn);
    averageIn = [];
    averageOut = [];
    let date = new Date();
    let currDate = `${
      date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
    }.${
      date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1
    }.${date.getFullYear()}`;
    insert("inroom_d", averageInside, currDate);
    insert("outroom_d", averageOutside, currDate);
    console.log(
      `[${formatDate(new Date())}] Saved the daily temperature average!`
    );
    setTimeout(() => {
      didSaveTheAverageTemp = false;
    }, 3600000);
  }
}, 60000);

function average(table) {
  let sum = table.reduce((last, curr) => parseFloat(last) + parseFloat(curr));
  let average = (sum / table.length).toFixed(2);
  return average;
}

async function addTemps() {
  let date = new Date();
  let currDate = `${
    date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
  }:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()} ${
    date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
  }.${
    date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
  }.${date.getFullYear()}`;

  await insert("inroom_c", temperature, currDate);
  await insert("outroom_c", outsideTemp, currDate);
  await checkForOverwrite();
  if (shouldOverwrite) {
    await db.run(
      `DELETE FROM inroom_c WHERE id IN (SELECT id FROM inroom_c LIMIT 1)`
    );

    await db.run(
      `DELETE FROM outroom_c WHERE id IN (SELECT id FROM outroom_c LIMIT 1)`
    );
    console.log(
      `[${formatDate(new Date())}] Deleted first rows of current temperature`
    );
  }
}

function insert(tableName, temp, date) {
  db.run(
    `INSERT INTO ${tableName} (id, temp, date) VALUES(?, ?, ?)`,
    [null, parseFloat(temp), date],
    (err) => {
      if (err) {
        return console.log(
          `[${formatDate(
            new Date()
          )}] Error while trying to add a row to the table!`
        );
      }
      console.log(`[${formatDate(new Date())}] Added a row to the table!`);
    }
  );
}
function checkForOverwrite() {
  let sql = `
  SELECT COUNT(id) FROM inroom_c;`;
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, data) => {
      if (err) {
        reject();
        throw err;
      }
      if (data[0]["COUNT(id)"] > 288) {
        shouldOverwrite = true;
      } else {
        shouldOverwrite = false;
      }
      resolve();
    });
  });
}

checkForOverwrite();

app.listen(port, () => {
  //App is ready
  console.log(`Server started at port ${port}!`);
});

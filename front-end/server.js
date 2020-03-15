const port = 3627;

const express = require("express");
const app = express();
app.use(express.static(__dirname));
app.get("/", (req, res, next) => {
  res.sendFile(__dirname + "/index.html");
});

app.use((req, res, next) => {
  res.sendFile(__dirname + "/404.html");
});

app.listen(port, () => console.log(`App started at port ${port}`));

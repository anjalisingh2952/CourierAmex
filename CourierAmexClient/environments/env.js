#!/bin/node

const fs = require("fs");
//Obtain the environment string passed to the node script
const environment = process.argv[2];
//read the content of the json file

const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgBlue = "\x1b[34m";
const FgMagenta = "\x1b[35m";
const FgWhite = "\x1b[37m";
const FgCyan = "\x1b[36m";

let color = "";
switch (environment.toLowerCase()) {
  case "dev":
    color = FgGreen;
    break;
  case "qa":
    color = FgMagenta;
    break;
  case "prod":
    color = FgRed;
    break;
  default:
    color = FgWhite;
    break;
}

console.info(color, `******************************************`);
console.info(
  color,
  `************ Using ${environment.toUpperCase()} configs ************`
);
console.info(color, `******************************************`);

const envFileContent = require(`./${environment}.json`);

//copy the json inside the env.json file
fs.writeFileSync(
  "./src/assets/config/settings.json",
  JSON.stringify(envFileContent, undefined, 2)
);

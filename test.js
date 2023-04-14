const fs = require('fs');


const d = JSON.stringify(fs.readFileSync("input.json", "utf8"))

console.log(d)
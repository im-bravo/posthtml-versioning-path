const fs = require("fs-extra");

fs.removeSync("processed");
fs.copySync("build", "processed");

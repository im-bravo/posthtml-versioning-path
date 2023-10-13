const fs = require("fs");
const posthtml = require("posthtml");
const { versioningPath } = require("@im-bravo/posthtml-versioning-path");

const html = fs.readFileSync("./processed/index.html");

function getTimestampString() {
  const now = new Date()
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

posthtml()
  .use(
    versioningPath({
      path: "processed",
      transformPath: (filepath) => {
        //console.log(filepath)
        return filepath
          .replace("https://example.com/", "")
          .replace("[versioning_path]/", "")
      },
      versioningPath: ( ) => {
        const versionPath = getTimestampString()
        return versionPath
      }
    })
  )
  .process(html)
  .then((result) => fs.writeFileSync("./processed/index.html", result.html));

# examples/versioning-path
## Script

The [script.js](script.js) file contains the script that runs posthtml.

```js
// script.js
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
```

Run the script:

```bash
yarn install

# copy build directory to processed
yarn clean

yarn path
```


## Results
### As is
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta property="og:image" content="https://example.com/static/[versioning_path]/image.png" />
    <meta property="twitter:image" content="https://example.com/static/[versioning_path]/image.png" />
    <meta property="twitter:image" content="https://example.com/static/[versioning_path]/assets/small-image.png" />
  </head>
  <body>
    <img src="/static/[versioning_path]/assets/small-image.png" alt="small image in body" />
    <img src="/static/[versioning_path]/assets/small-image.png" alt="small image in body" />
    <img src="/static/[versioning_path]/assets/small-image.png" alt="small image in body" />

    <img src="/static/[versioning_path]/image.png" alt="small image in body" />
    <img src="/static/[versioning_path]/image.png" alt="small image in body" />
    <img src="/static/[versioning_path]/image.png" alt="small image in body" />
    
    <img src="/static/[versioning_path]/assets/small-image.png" alt="small image in body" />
    <img src="/static/non-versioning-target/image.png" alt="small image in body" />
  </body>
</html>

```

### To be
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta property="og:image" content="https://example.com/static/20231013233358/image.png">
    <meta property="twitter:image" content="https://example.com/static/20231013233358/image.png">
    <meta property="twitter:image" content="https://example.com/static/20231013233358/assets/small-image.png">
  </head>
  <body>
    <img src="/static/20231013233358/assets/small-image.png" alt="small image in body">
    <img src="/static/20231013233358/assets/small-image.png" alt="small image in body">
    <img src="/static/20231013233358/assets/small-image.png" alt="small image in body">

    <img src="/static/20231013233358/image.png" alt="small image in body">
    <img src="/static/20231013233358/image.png" alt="small image in body">
    <img src="/static/20231013233358/image.png" alt="small image in body">
    
    <img src="/static/20231013233358/assets/small-image.png" alt="small image in body">
    <img src="/static/non-versioning-target/image.png" alt="small image in body">
  </body>
</html>
```


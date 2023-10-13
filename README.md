# posthtml-versioning-path <img align="right" width="220" height="200" title="PostHTML logo" src="http://posthtml.github.io/posthtml/logo.svg">

[![NPM][npm]][npm-url]

`posthtml-versioning-path` is a [PostHTML](https://github.com/posthtml/posthtml) plugin for hashing file names to enable caching.

```diff
<html>
  <head>
-   <link rel="stylesheet" href="/[versioning_path]/styles.css" />
+   <link rel="stylesheet" href="/20231013220934001/styles.css" />
  </head>
  <body>
-   <script src="/[versioning_path]/src.js"></script>
+   <script src="/20231013220934001/src.js"></script>
  </body>
</html>
```

## Install
```bash
# npm
npm i -D @im-bravo/posthtml-versioning-path
```

## Usage
By default, the plugin will attempt to hash file names that contain `[versioning_path]`. As an additional qualifier, only nodes containing `href`, `src`, or `content` attributes are eligible.

```html
<html>
  <head>
    <!-- ✅ versioned -->
    <link rel="stylesheet" href="/[versioning_path]/styles.css" />

    <!-- ❌ not versioned -->
    <link rel="stylesheet" href="reset.css" />
  </head>
  <body>
    <!-- ✅ versioned -->
    <script src="/[versioning_path]/src.js"></script>

    <!-- ❌ not versioned -->
    <script src="analytics.js"></script>
  </body>
</html>
```

```js:postbuild.js
const fs = require("fs");
const posthtml = require("posthtml");
const { versioningPath } = require("posthtml-versioning-path");
const html = fs.readFileSync("./processed/index.html");

function yourOwnVersioningLogic() {
  const now = new Date()
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
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
        return filepath
          .replace("https://example.com/", "") // 
          .replace("[versioning_path]/", "")
      },
      versioningPath: ( ) => {
        const versionPath = yourOwnVersioningLogic()
        return versionPath
      }
    })
  )
  .process(html)
  .then((result) => fs.writeFileSync("./processed/index.html", result.html));

```

For convenience, you can add the post-build script to your package.json. The `postbuild` script is automatically invoked following the `build` script.

```json
{
  "scripts": {
    "build": "rollup -c",
    "postbuild": "node postbuild.js"
  }
}
```



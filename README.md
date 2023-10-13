# posthtml-versioning-path <img align="right" width="220" height="200" title="PostHTML logo" src="http://posthtml.github.io/posthtml/logo.svg">

[![NPM][npm]][npm-url]

`posthtml-versioning-path` is a [PostHTML](https://github.com/posthtml/posthtml) plugin for add versioned layer path to enable caching.
The concept is similar to posthtml-hash.

## Why versioned path layer instead of hash filename ?
When deploying static content, when a new version of a resource is accessed using the same path, there is a certain probability of encountering a problem: the resource version referenced by the HTML file may be inconsistent with the actual resource version, which may cause the page to crash.
It may be caused by cache (browser cache, proxy cache, or CDN cache), or sometimes it may be caused by the coexistence of old and new instances during the release process, such as replacement deployment based on docker.
The filename hash is one of the good idea but there is still have some issue.
But, to ensure no-inconsistency during deployment period, even if we use hash, it's better to use incremental-deployment. 
In this case, we need consider the life cycle of each build and clean up old builds. for example keep only last 10 build version in the storage server.
Inject build version in to path can be helpful for us to easily findout which build old we can delete. for example sort by version folder name and keep latest 10 build version.

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



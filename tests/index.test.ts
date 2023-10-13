import { beforeAll, test, expect, describe } from "vitest";
import fs from "fs";
import path from "path";
import posthtml from "posthtml";
import { versioningPath, replaceVersionPath } from "../src";
import * as API from "../src";

describe("posthtml-versioning-path", () => {
  beforeAll(() => {
    if (!fs.existsSync("tests/__fixtures__/processed")) {
      fs.mkdirSync("tests/__fixtures__/processed");
    }
  });

  const buffer = fs.readFileSync(
    path.resolve(__dirname, "__fixtures__/original/bundle.min.js")
  );

  //const DEFAULT_VERSIONING_PATH = 20;
  const DEFAULT_PATTERN = new RegExp(/\[versioning_path.*]/g);
  const DEFAULT_VERSIONING_PATH = '1234'

  test("plugin", () => {
    expect(Object.keys(API)).toMatchInlineSnapshot(`
      [
        "replaceVersionPath",
        "default",
        "versioningPath",
        "posthtmlVersioningPath",
      ]
    `);
    expect(
      replaceVersionPath("/[versioning_path]/bundle.min.js.js", buffer, DEFAULT_PATTERN, DEFAULT_VERSIONING_PATH)
    ).toEqual("/1234/bundle.min.js.js");
    // expect(
    //   replaceVersionPath(
    //     "script.[hash].js",
    //     buffer,
    //     DEFAULT_PATTERN,
    //     DEFAULT_VERSIONING_PATH
    //   )
    // ).toEqual("script.b0dcc67ffc1fd562f212.js");
    // expect(
    //   replaceVersionPath(
    //     "script.[hash:20].js",
    //     buffer,
    //     DEFAULT_PATTERN,
    //     DEFAULT_VERSIONING_PATH
    //   )
    // ).toEqual("script.b0dcc67ffc1fd562f212.js");
    // expect(
    //   replaceVersionPath(
    //     "script.[hash:8].js",
    //     buffer,
    //     DEFAULT_PATTERN,
    //     DEFAULT_VERSIONING_PATH
    //   )
    // ).toEqual("script.b0dcc67f.js");
    // expect(() =>
    //   replaceVersionPath("script[].js", buffer, DEFAULT_PATTERN, DEFAULT_VERSIONING_PATH)
    // ).toThrow();
    // expect(() =>
    //   replaceVersionPath(
    //     "script.[has:8].js",
    //     buffer,
    //     DEFAULT_PATTERN,
    //     DEFAULT_VERSIONING_PATH
    //   )
    // ).toThrow();
    // expect(() =>
    //   replaceVersionPath("script.js", buffer, DEFAULT_PATTERN, DEFAULT_VERSIONING_PATH)
    // ).toThrow();
    // expect(() =>
    //   replaceVersionPath("script.js", buffer, DEFAULT_PATTERN, DEFAULT_VERSIONING_PATH)
    // ).toThrow();

    // const CUSTOM_EXP = new RegExp(/\[oh-my-hash.*]/g);

    // expect(
    //   replaceVersionPath("[oh-my-hash].js", buffer, CUSTOM_EXP, DEFAULT_VERSIONING_PATH),
    //   "b0dcc67ffc1fd562f212.js"
    // );
    // expect(
    //   replaceVersionPath("script.[oh-my-hash].js", buffer, CUSTOM_EXP, 8),
    //   "script.b0dcc67f.js"
    // );

    // const CUSTOM_EXP_2 = new RegExp(/\oh-my-hash/);

    // expect(
    //   replaceVersionPath("oh-my-hash.js", buffer, CUSTOM_EXP_2, DEFAULT_VERSIONING_PATH),
    //   "b0dcc67ffc1fd562f212.js"
    // );
    // expect(
    //   replaceVersionPath("script.oh-my-hash.js", buffer, CUSTOM_EXP_2, 8),
    //   "script.b0dcc67f.js"
    // );

    // const CUSTOM_EXP_3 = new RegExp(/custom-hash/);

    // expect(
    //   replaceVersionPath(
    //     "script.custom-hash.js",
    //     buffer,
    //     CUSTOM_EXP_3,
    //     DEFAULT_VERSIONING_PATH
    //   )
    // ).toEqual("script.b0dcc67ffc1fd562f212.js");
    // expect(
    //   replaceVersionPath("script.custom-hash.js", buffer, CUSTOM_EXP_3, 4)
    // ).toEqual("script.b0dc.js");

    function copyFixture(fileName: string) {
      const file = path.join(__dirname, "__fixtures__/original", fileName);
      fs.copyFileSync(
        file,
        path.join(__dirname, "__fixtures__/processed", fileName)
      );
    }

    async function fixture() {
      copyFixture("bundle.min.css");
      copyFixture("bundle.min.js");

      copyFixture("script.oh-my-hash.js");

      const result2 = await posthtml()
        .use(
          versioningPath({
            path: "tests/__fixtures__/processed",
            hashLength: 8,
            transformPath: (filepath) => {
              return filepath
                .replace("https://example.com/", "")
                .replace("[versioning_path]/", "")
            },
            versioningPath: ( ) => {
              return '666'
            }
          })
        )
        .process(
          `<html>
            <body>
              <link rel="stylesheet" href="https://example.com/[versioning_path]/bundle.min.css" />
              <script src="[versioning_path]/bundle.min.js"></script>
            </body>
          </html>`
        );

      expect(result2.html.replace(/\n|\s+/g, "")).toEqual(
        '<html><body><linkrel="stylesheet"href="https://example.com/666/bundle.min.css"><scriptsrc="666/bundle.min.js"></script></body></html>'
      );
    }

    fixture();
  });
});

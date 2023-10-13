import fs, { accessSync } from "fs";
import path from "path";
import type PostHTML from "posthtml";

const DEFAULT_PATTERN = new RegExp(/\[versioning_path.*]/g);

export const replaceVersionPath = (
  str: string,
  buffer: Buffer,
  exp: RegExp,
  versioningPath: string
) => {
  const match = str.match(exp);
  return str.replace(exp, versioningPath);
};

interface PostHTMLVersioningPathOptions {
  path?: string;
  hashLength?: number;
  pattern?: RegExp;
  transformPath?: (filepath: string) => string;
  versioningPath?: () => string;
}

const plugin = (options?: PostHTMLVersioningPathOptions) => {
  const versionedUrls = new Map<string, string>();

  return (tree: PostHTML.Node) => {
    const exp = options?.pattern || DEFAULT_PATTERN;
    const transformPath = options?.transformPath || ((filepath) => filepath);
    const versioningPath = options?.versioningPath || (() => "");

    tree.match(
      [
        { attrs: { href: exp } },
        { attrs: { src: exp } },
        { attrs: { content: exp } },
      ],
      (node) => {
        const _node = node as unknown as NodeWithHashRegex;
        const { href, src, content } = _node.attrs;
        const fileName = href! || src! || content!;
        const transformedFileName = transformPath(fileName);
        const versionPath = versioningPath();
        const pathToFile = options?.path || "";
        const file = path.join(process.cwd(), pathToFile, transformedFileName!);

        if (fs.existsSync(file)) {
          const buffer = fs.readFileSync(file);
          const versionedFileName = replaceVersionPath(
            fileName!,
            buffer,
            exp,
            versionPath
          );
          const transformedVersionedFileName = transformPath(versionedFileName);
          const versionedFile = path.join(
            process.cwd(),
            pathToFile,
            transformedVersionedFileName
          );
          var versionedFileDir = path.dirname(versionedFile);
          if (!fs.existsSync(versionedFileDir)) {
            fs.mkdirSync(versionedFileDir)
          }

          fs.cpSync(file, versionedFile);
          versionedUrls.set(file, versionedFileName);

          if (href) _node.attrs.href = versionedFileName;
          if (src) _node.attrs.src = versionedFileName;
          if (content) _node.attrs.content = versionedFileName;

        } else {

          if (versionedUrls.has(file)) {
            const existingHashedUrl = versionedUrls.get(file);
  
            if (href) _node.attrs.href = existingHashedUrl;
            if (src) _node.attrs.src = existingHashedUrl;
            if (content) _node.attrs.content = existingHashedUrl;
          } else {
            console.log("File does not exist:", file);
          }
        }

        return node;
      }
    );
    versionedUrls.forEach((file, to) => {
      console.log(`rm origin:${file}`);
      fs.rmSync(to)
    })
  };
};

export default plugin;
export { plugin as versioningPath, plugin as posthtmlVersioningPath };

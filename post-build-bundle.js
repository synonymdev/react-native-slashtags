const fs = require("fs");
const { exec } = require("child_process");

const inputDir = "web/dist";
const outputDir = "lib/src";
const orginalHtmlFilePath = `${inputDir}/index.html`;
const bundleHtmlFilePath = `${inputDir}/index-bundle.html`;
const bundleJsFilePath = `${outputDir}/web-interface.ts`;

/**
 * Replaces the placeholder with the contents of the input file
 * @param placeholder
 * @param inputPath
 * @param outputPath
 * @returns {Promise<unknown>}
 */
const injectJS = (placeholder, inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    // nodeJS breaks the minified code, resorted to shell
    exec(
      `sed -i.bak '/${placeholder}/r././${inputPath}' ./${outputPath}`,
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        if (stderr) {
          error(new Error(stderr));
          return;
        }

        resolve(stdout);
      }
    );
  });
};

/**
 * Lists all *.js files in directory
 * @returns {Promise<?> | Promise<unknown>}
 * @param dir
 */
const listJsBundles = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, function (err, files) {
      if (err) {
        reject(err);
      }

      let indexJSFiles = [];
      files.forEach(function (file) {
        if (file.endsWith(".js")) {
          indexJSFiles.push(file);
        }
      });

      resolve(indexJSFiles);
    });
  });
};

/**
 * Injects all separete JS code into a single HTML file
 * @returns {Promise<void>}
 */
const bundleWebAppIntoSingleFile = async () => {
  let htmlContent = fs.readFileSync(orginalHtmlFilePath).toString();

  try {
    const indexJSFiles = await listJsBundles(inputDir);
    console.log(indexJSFiles);

    //Remove sources and replace with placeholders
    indexJSFiles.forEach((indexJS) => {
      console.log(`Injecting placeholder from ${indexJS}`);

      const scriptTag1 = `<script type="module" src="/${indexJS}"></script>`;
      const scriptTag2 = `<script src="/${indexJS}" nomodule="" defer></script>`;

      const indexJSContent = fs
        .readFileSync(`${inputDir}/${indexJS}`)
        .toString();

      const closingBody = `</body>`;

      htmlContent = htmlContent.replace(
        scriptTag1,
        `\n<script type="module">\n// injext file ${indexJS}\n</script>\n`
      );
      htmlContent = htmlContent.replace(
        scriptTag2,
        `\n<script nomodule="" defer>\n// injext file ${indexJS}\n</script>\n`
      );
    });

    // Write content to file because we're using shell to inject content (nodeJS breaks the minified code)
    fs.writeFileSync(bundleHtmlFilePath, htmlContent);

    for (let index = 0; index < indexJSFiles.length; index++) {
      const indexJS = indexJSFiles[index];

      await injectJS(indexJS, `${inputDir}/${indexJS}`, bundleHtmlFilePath);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

/**
 * Reads the single html file and creates a JS file with the code exported as a hex string
 */
const bundleHtmlFileIntoJsCode = () => {
  console.log("bundleHtmlFileIntoJsCode");
  const content = fs.readFileSync(bundleHtmlFilePath).toString();

  const bufferText = Buffer.from(content, "utf8");
  const hex = bufferText.toString("hex");
  const tsCode = `export default "${hex}";`;

  fs.writeFileSync(bundleJsFilePath, tsCode);
};

bundleWebAppIntoSingleFile()
  .then(() => {
    bundleHtmlFileIntoJsCode();
  })
  .catch(console.error);

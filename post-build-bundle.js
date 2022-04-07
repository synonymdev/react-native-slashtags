const fs = require("fs");
const { exec } = require("child_process");


const inputDir = './web/dist';
const outputDir = './lib/src';

const bundleWebAppIntoSingleFile = () => {
    let htmlContent = fs.readFileSync(`${inputDir}/index.html`).toString();
    fs.readdir(inputDir, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
    
        let indexJSFiles = [];
        files.forEach(function (file) {
            if (file.endsWith(".js")) {
                indexJSFiles.push(file);
            }
        });
    
        indexJSFiles.reverse().forEach(indexJS => {
            console.log(`Injecting placeholder from ${indexJS}`);
    
            const scriptTag1 = `<script type="module" src="/${indexJS}"></script>`;
            const scriptTag2 = `<script src="/${indexJS}" nomodule="" defer></script>`;
    
            const indexJSContent = fs.readFileSync(`${inputDir}/${indexJS}`).toString();
            // const bundledScript1 = `<script type="module">${indexJSContent}</script>`;
            // const bundledScript2 = `<script nomodule="" defer>${indexJSContent}</script>`;
    
            const closingBody = `</body>`;
    
            htmlContent = htmlContent.replace(scriptTag1, `\n\n\n\n\n\n\n\n\n<script type="module">\n\n// injext file ${indexJS}\n\n</script>\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n`)
            htmlContent = htmlContent.replace(scriptTag2, `\n\n\n\n\n\n\n\n\n<script nomodule="" defer>\n\n// injext file ${indexJS}\n\n</script>\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n`)
    
            htmlContent = htmlContent.replaceAll('.js.map', '');


            // if (htmlContent.includes(scriptTag1)) {
            //     console.log('scriptTag1');
            //     htmlContent = htmlContent.replace(scriptTag1, "");
            //     htmlContent = htmlContent.replace(closingBody, `${bundledScript1}`);
            // }
    
            // if (htmlContent.includes(scriptTag2)) {
            //     console.log('scriptTag2');
            //     htmlContent = htmlContent.replace(scriptTag2, "");
            //     htmlContent = htmlContent.replace(closingBody, `${bundledScript2}`);
            // }
    
            // 
    
            //TODO make sure there are no more references to these index files
            // if (htmlContent.includes(indexJS)) {
            //     console.error(`ERROR: Script tag was not replaced with content: ${indexJS}`);
            // }
        });

        // let hasReplaced = false;
        // indexJSFiles.forEach(indexJS => {
        //     // if (hasReplaced) {
        //         htmlContent = htmlContent.replaceAll(`[${indexJS}]`, `// REPLACED CONTENT ** [${indexJS}]** `);
        //         return;
        //     // }
        //     hasReplaced = true;
            
        //     console.log(`Injecting code from ${indexJS}`);
        //     const indexJSContent = fs.readFileSync(`${inputDir}/${indexJS}`).toString();
        //     htmlContent = htmlContent.replaceAll(`[${indexJS}]`, indexJSContent);
        //     return;
        // });

        
    
        //TODO put back when done debugging
        // bundleContentIntoJS(htmlContent);
        fs.writeFileSync(`${inputDir}/index-bundle.html`, htmlContent);


        for (let index = 0; index < indexJSFiles.length; index++) {
            const indexJS = indexJSFiles[index];

            console.log(`TODO: ${indexJS}`);

            setTimeout(() => {
                exec(`sed -i.bak '/${indexJS}/r././web/dist/${indexJS}' ./web/dist/index-bundle.html`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
    
                    console.log(`stdout: ${stdout}`);
                });
                //sed -i.bak '/this/r./test.txt' ./web/dist/index-bundle.html
            }, 1000 * index);
        }
    });    
}

const bundleHtmlFileIntoJsCode = () => {
    console.log("bundleHtmlFileIntoJsCode");
    let htmlContent = fs.readFileSync(`${inputDir}/index-bundle.html`).toString();
    bundleContentIntoJS(htmlContent);
}

const bundleContentIntoJS = (content) => {
    const bufferText = Buffer.from(content, 'utf8');    
    const hex = bufferText.toString('hex');
    const tsCode = `export default "${hex}";`

    // fs.writeFileSync(`${inputDir}/index-bundle.html`, htmlContent);
    fs.writeFileSync(`${outputDir}/web-interface.ts`, tsCode);
}

bundleWebAppIntoSingleFile();

setTimeout(() => {
    bundleHtmlFileIntoJsCode();
}, 5000);
// bundleHtmlFileIntoJsCode();
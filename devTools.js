const fs = require('fs');
const argv = process.argv

function removeConsoleLog(dirPath){
    fs.readdir(dirPath, (err, files) => {
        files.forEach(file => {
            const filePath = `${dirPath}/${file}`;
            fs.stat(filePath, (err, stat) => {
                if(stat.isDirectory()){
                    removeConsoleLog(filePath);
                } else {
                    fs.readFile(filePath, 'utf8', (err, data) => {
                        if(data.includes('console.log')){
                            const newData = data.replace(/console.log\((.*)\);?/g, '');
                            fs.writeFile(filePath, newData, 'utf8', (err) => {
                                if(err) throw err;
                            });
                        }
                    });
                }
            });
        });
    });
}

function changeToMJS(dirPath){
    fs.readdir(dirPath, (err, files) => {
        files.forEach(file => {
            const filePath = `${dirPath}/${file}`;
            fs.stat(filePath, (err, stat) => {
                if(stat.isDirectory()){
                    changeToMJS(filePath);
                } else {
                    if(filePath.endsWith('.js')){
                        const newFilePath = filePath.replace('.js', '.mjs');
                        fs.rename(filePath, newFilePath, (err) => {
                            if(err) throw err;
                        });
                    }
                }
            });
        });
    });

    // Change the import statements from js to mjs

    fs.readdir(dirPath, (err, files) => {
        files.forEach(file => {
            const filePath = `${dirPath}/${file}`;
            fs.stat(filePath, (err, stat) => {
                if(stat.isDirectory()){
                    changeToMJS(filePath);
                } else {
                    fs.readFile(filePath, 'utf8', (err, data) => {
                        console.log(data);
                        if(data.includes('.js')){
                            const newData = data.replace(/\.js/g, '.mjs');
                            fs.writeFile(filePath, newData, 'utf8', (err) => {
                                if(err) throw err;
                            });
                        }
                    });
                }
            });
        });
    });
}

if (argv[2] === 'removeConsoleLog'){
    if (argv.length < 4){
        console.log('Please provide a directory path');
    }
    
    removeConsoleLog(argv[3]);
}

if (argv[2] === 'changeToMJS'){
    if (argv.length < 4){
        console.log('Please provide a directory path');
    }
    
    changeToMJS(argv[3]);
}


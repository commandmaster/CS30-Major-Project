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

if (argv[2] === 'removeConsoleLog'){
    if (argv.length < 4){
        console.log('Please provide a directory path');
    }
    
    removeConsoleLog(argv[3]);
}
const fs = require('fs').promises;
const path = require('path');

async function getFiles(dir, files) {

    if(!files)
        files = [];

    let fileList = await fs.readdir(dir);
    for(let k in fileList) {
        let stat = await fs.stat(path.join(dir, fileList[k]));
        if(stat.isDirectory())
            await getFiles(path.join(dir, fileList[k]), files);
        else
            files.push(path.join(dir, fileList[k]));
    }

    return files;

}

module.exports = getFiles;
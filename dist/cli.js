#!/usr/bin/env node
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const cp = require("child_process");
const readline = require("readline");
const path = require("path");
const ts = Date.now();
const date = new Date();
const d = [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getDate()
].join('-');
const csvPath = path.resolve(process.cwd() + '/' + ts + '-interview.csv');
process.once('exit', code => {
    cp.execSync(`rm -rf ${ts}`);
});
try {
    fs.mkdirSync(String(ts));
}
catch (err) {
    console.error(err);
}
const b = cp.spawn(`bash`);
b.stdin.end(`git clone https://github.com/jimmyislive/sample-files.git ${ts}`);
b.stdout.pipe(fs.createWriteStream('/dev/null'));
b.stderr.pipe(process.stderr);
const csvFileStream = fs.createWriteStream(csvPath);
const getFileData = (absPath) => {
    const words = String(fs.readFileSync(absPath)).split(/\s+/g);
    return [
        path.basename(absPath),
        String(cp.execSync(`shasum '${absPath}'`)).split(' ')[0],
        fs.statSync(absPath).size,
        words.length,
        new Set(words).size,
        d
    ].join(',') + '\n';
};
b.once('exit', code => {
    if (code && code > 0) {
        throw "Exit code was: " + code;
    }
    const k = cp.spawn('bash');
    const rl = readline.createInterface({
        input: k.stdout
    });
    k.stdin.end(`
   ls ${ts}
 `);
    rl.on('line', d => {
        const fullPath = path.resolve(process.cwd() + '/' + ts + '/' + d);
        if (path.extname(fullPath) != '.txt') {
            return;
        }
        csvFileStream.write(getFileData(fullPath));
    });
    rl.once('exit', () => {
        csvFileStream.end();
    });
});

const http = require('http');
const fs = require('fs'); //File System
const url = require('url');

const app = http.createServer((req, res) => {
    var _url = req.url;
    var queryData = url.parse(_url, true).query;
    console.log(queryData);
    if(_url == '/'){
        _url = '/index.html'
    }
    if(_url == '/favicon.ico'){
       return res.writeHead(404);
    } 
    res.writeHead(200);
    //res.end(queryData.id);
    res.end(fs.readFileSync(__dirname + _url));
});

app.listen(3000);
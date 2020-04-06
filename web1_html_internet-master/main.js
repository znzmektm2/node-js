const http = require('http');
const fs = require('fs'); //File System
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template.js');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const app = http.createServer((req, res) => {
    var _url = req.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname == '/'){
        if(queryData.id === undefined){
            fs.readdir('./data', (err, filelist) => {
                var title = 'Welcome';
                var description = 'Hello, Node.js';    
                var list = template.list(filelist);
                var html = template.html(title, list, `<h2>${title}</h2>${description}`, 
                    `<a href="/create">create</a>`);
                res.writeHead(200);
                res.end(html);
            });
        } else {
            fs.readdir('./data', (err, filelist) => {
                var filteredId = path.parse(queryData.id).base;
                fs.readFile(`data/${filteredId}`, 'utf8', (err, description) => {
                    var title = queryData.id;
                    var sanitizedTitle = sanitizeHtml(title);
                    var sanitizedDescription = sanitizeHtml(description, {
                        allowedTags:['h1'], // h1 태그를 쓰면 허용 하겠다.
                    });
                    var list = template.list(filelist);
                    var html = template.html(sanitizedTitle, list, `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                        `<a href="/create">create</a>
                         <a href="/update?id=${sanitizedTitle}">update</a>
                         <form action="delete_process" method="post" onsubmit="confirm('really?')">
                            <input type="hidden" name="id" value="${sanitizedTitle}">
                            <input type="submit" value="delete">
                         </form>`);
                    res.writeHead(200);
                    res.end(html);
                });                
            });
        }        
    } else if(pathname === '/create') {
        fs.readdir('./data', (err, filelist) => {
            var title = 'WEB - create';
            var list = template.list(filelist);
            var html = template.html(title, list, `
            <form action="/create_process" method="post"> 
                <p><input type='text' name="title" placeholder="title"></p>
                <p>
                    <textarea name='description' placeholder="description"></textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>`, '');
            res.writeHead(200);
            res.end(html);
        });
    } else if (pathname === '/create_process') {
        var body = '';
        req.on('data', (data) => { //웹브라우저에서 post 방식으로 data가 조각조각 들어올 때 처리
            body = body + data;
        }); 
        req.on('end', () => {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
                res.writeHead(302, {Location: `/?id=${title}`}); //200은 성공, 302는 페이지를 다른데로 리다이렉트 시켜라
                res.end();
            });
        });
    } else if (pathname === '/update') {
        fs.readdir('./data', (err, filelist) => {
            fs.readFile(`data/${queryData.id}`, 'utf8', (err, description) => {
                var title = queryData.id;
                var list = template.list(filelist);
                var html = template.html(title, list, 
                `<form action="/update_process" method="post"> 
                    <input type='hidden' name="id" value="${title}">
                    <p><input type='text' name="title" placeholder="title" value="${title}"></p>
                    <p>
                        <textarea name='description'>${description}</textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>`,
                `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
                res.writeHead(200);
                res.end(html);
            });                
        });
    } else if (pathname === '/update_process') {
        var body = '';
        req.on('data', (data) => { //웹브라우저에서 post 방식으로 data가 조각조각 들어올 때 처리
            body = body + data;
        }); 
        req.on('end', () => {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, (error) => {
                fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
                    res.writeHead(302, {Location: `/?id=${title}`}); //200은 성공, 302는 페이지를 다른데로 리다이렉트 시켜라
                    res.end();
                });
            });
        });
    } else if (pathname === '/delete_process') {
        var body = '';
        req.on('data', (data) => { //웹브라우저에서 post 방식으로 data가 조각조각 들어올 때 처리
            body = body + data;
        }); 
        req.on('end', () => {
            var post = qs.parse(body);
            var id = post.id;
            fs.unlink(`data/${id}`, (error) => {
                res.writeHead(302, {Location: `/`});
                res.end();
            });
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
    res.writeHead(200);    
});

app.listen(3000);
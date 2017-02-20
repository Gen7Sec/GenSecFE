#!/usr/bin/env node
//requiring files which hold command this will need to use later.
var http = require('http');
var _ = require('lodash');
var express = require('express');
var fs = require('fs');
var path = require('path');
var util = require('util');
var program = require('commander');

function collect(val, memo) {
  if(val && val.indexOf('.') != 0) val = "." + val;
  memo.push(val);
  return memo;
}
//----------------------------------------------------------------------------------------------------------
program
  .option('-p, --port <port>', 'Port to run the file-browser. Default value is 3002') //option text
  .parse(process.argv);

var app = express();
var dir =  process.cwd();
app.use(express.static(dir)); //app public directory
app.use(express.static(__dirname)); //module directory
var server = http.createServer(app); //create server 

if(!program.port) program.port = 3002;

server.listen(program.port, '0.0.0.0'); //listen - server.listen(program.port);
console.log("To view files, go to http://<YOUR-IP>:PORT#  -- Default Port is 3002. To specidy, add '-p PORT#' to your command line. To close the port, simply hit CTR+C and then select y. ");
//-----------------------------------------------------------------------------------------------------------
app.get('/files', function(req, res) {  //get files
 var currentDir =  dir;
 var query = req.query.path || '';
 if (query) currentDir = path.join(dir, query);
 console.log("Someone viewed ", currentDir);
 fs.readdir(currentDir, function (err, files) {
     if (err) {
        throw err;
      }
      var data = [];
      files
      .filter(function (file) {
          return true;
      }).forEach(function (file) {
        try {
                //viewing stuff
                var isDirectory = fs.statSync(path.join(currentDir,file)).isDirectory();
                if (isDirectory) {
                  data.push({ Name : file, IsDirectory: true, Path : path.join(query, file)  });
                } else {
                  var ext = path.extname(file);             
                  data.push({ Name : file, Ext : ext, IsDirectory: false, Path : path.join(query, file) }); //viewing information.
                }

        } catch(e) {
          console.log(e); 
        }        
        
      });
      data = _.sortBy(data, function(f) { return f.Name });
      res.json(data);
  });
});

app.get('/', function(req, res) {
 res.redirect('lib/template.html');  //HTML Viewing Page.
});

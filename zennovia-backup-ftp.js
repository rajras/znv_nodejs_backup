#!/usr/bin/env node
require(__dirname + '/global.js');

var FtpClient = require('ftp');
var proyectos;  
var ftp = new FtpClient();
var util = require('util');

proyectos = config.get("proyectos");

proyectos.forEach(function(proyecto){
    if(proyecto.ftp !== undefined){
        
        if(proyecto.prefijo === undefined || proyecto.ftp.url === undefined || proyecto.ftp.port === undefined || proyecto.ftp.usuario === undefined || proyecto.ftp.pass === undefined || proyecto.ftp.folders === undefined){
            console.log('skipping:');
            console.log(proyecto);
            return false;    
        }
        
        ftp.connect({
            host: proyecto.ftp.url,
            port: proyecto.ftp.port,
            user: proyecto.ftp.usuario,
            password: proyecto.ftp.pass
        });
        
        var url = process.cwd() ;
        
        if(config.get("backup_folder") !== undefined){
            url += '/' + config.get("backup_folder");
        }
        url += '/'+ proyecto.prefijo + '/ftp';
        mkdirp.sync(url);
    
        
        proyecto.ftp.folders.forEach(function(folder){
            var lastFolderName = folder.match(/([^\/]*)\/*$/)[1];
            getFolder(folder,url + "/" + lastFolderName);
        });
        
        ftp.end();
        console.log("terminado");
    }
});

function getFile(pathToFile,destPath){
    ftp.get(pathToFile, function(err, stream) {
      if (err) throw err;
      console.log("obteniendo " + pathToFile);
      
      mkdirp.sync(path.dirname(destPath));
      stream.on('error',function(err){
           console.log("error:" + err.toString());
      });
      stream.pipe(fs.createWriteStream(destPath));
      
    });
}
function getFolder(path,destPath, overwriteAll){
    overwriteAll = typeof overwriteAll !== 'undefined' ? overwriteAll : false;
    var stat;
    ftp.list(path,function(err,list){
        if (err) throw err;
        list.forEach(function(item){
           
           if(item.type == '-'){
               //is file
                try {
                    stat = fs.statSync(destPath + "/" + item.name);
                }catch (ex){
                    stat = false;
                }
                
               if(overwriteAll === true || stat === false || item.date.getTime() > stat.mtime.getTime()){
                   //aca debo bajar el archivo.
                   getFile(path + "/" + item.name,destPath + "/" + item.name);
               }else{
                   console.log("skipping:" + path + "/" + item.name);
               }
           }else{
               getFolder(path + "/" + item.name,destPath + "/" + item.name, overwriteAll);
           }
        });
    });
}

ftp.on('ready',function(){
   console.log('ready event');
});
ftp.on('error',function(err){
   console.log('ready event' + err.toString());
});


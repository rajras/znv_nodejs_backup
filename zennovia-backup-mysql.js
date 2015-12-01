#!/usr/bin/env node
require(__dirname + '/global.js');

var spawn = require('child_process').spawn,
    proyectos;

function eliminarFile(url){
    if(fs.existsSync(url)) {            
            fs.unlinkSync(url);
    };
}
function guardarDatos(datos,file){
    mkdirp(path.dirname(file), function (err) {
        if (err) throw err;
        fs.appendFile(file, datos);
    });
}

proyectos = config.get("proyectos");

proyectos.forEach(function(proyecto){
    if(proyecto.base_datos !== undefined){
        if(proyecto.prefijo === undefined || proyecto.base_datos.host === undefined || proyecto.base_datos.usuario === undefined || proyecto.base_datos.pass === undefined || proyecto.base_datos.database === undefined){
            console.log("salteo proyecto" + proyecto.nombre );
            return false;    
        }
        
       
        var fecha = new Date;
        var url = process.cwd();
        
        if(config.get("backup_folder") !== undefined){
            url += '/' + config.get("backup_folder");
        }
        url += '/'+ proyecto.prefijo + '/mysql/' + proyecto.prefijo + "_" +  fecha.yyyymmdd() + ".sql";
        
        eliminarFile(url);
        var child;
        var com;
        if(process.env.comspec !== undefined){
            com = ' -h' + proyecto.base_datos.host + 
              ' -u' + proyecto.base_datos.usuario +
              ' -p' + proyecto.base_datos.pass +
              ' ' + proyecto.base_datos.database;
            child =  spawn(process.env.comspec, ['/c', 'mysqldump ' + com]);
        }else{
            
            child =  spawn('mysqldump', [
                                        '-h'+ proyecto.base_datos.host,
                                        ' -u' + proyecto.base_datos.usuario,
                                        ' -p' + proyecto.base_datos.pass,
                                        proyecto.base_datos.database
                                         ]);
        }
         
        child.stdout.on("data", function(data) {
            guardarDatos(data,url);
        });
        child.stderr.on("data", function(data) {
            console.log("error:" + data);
        });
        child.on('close', function (code) {
            if(code > 0){
                eliminarFile(url);
            }
            
        });
                    
    }
});


//console.log(proyectos);


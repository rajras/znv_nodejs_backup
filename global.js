fs = require('fs');
mkdirp = require('mkdirp');
path = require("path");
require(__filename + "/process_config.js");

Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
  };

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

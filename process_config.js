config = require('nconf');

config.overrides({
  'always': 'be this value'
});

//
// 2. `process.env`
// 3. `process.argv`
//
config.env().argv();

//
// 4. Values in `config.json`
//
config.file(__dirname + '/config.json');

//
// 5. Any default values
//
config.defaults({
  'if nothing else': 'use this value'
});

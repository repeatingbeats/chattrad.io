
var runner = require('nodeunit').reporters.default;

process.chdir(__dirname);
runner.run([ '/models', '/routes' ]);


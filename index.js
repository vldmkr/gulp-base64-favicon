'use strict';

var path        = require('path');
var fs          = require('fs');
var through     = require('through2');
var gutil       = require('gulp-util');

const PLUGIN_NAME = 'gulp-base64-favicon';
const FIND_REGEXP = /<!--[\s]*?shortcut::[\s\S]*?-->/g;
const DEL_REGEXP  = / *?<!--[\s]*?shortcut::| *?-->/g;

module.exports = function(obj) {
  var src = (obj && obj.src) || obj || '';
  return through.obj(function(file, encoding, callback) {
    if (file.isBuffer()) {
      var htmlContents = String(file.contents);
      var matchArray = htmlContents.match(FIND_REGEXP);
      if(matchArray && matchArray.length === 1) {
        var match = matchArray[0].replace(DEL_REGEXP, '').trim();
        fs.readFile(path.join(src, match), 'binary', function(err, data) {
          if (err) {
            callback(new gutil.PluginError(PLUGIN_NAME, err));
          } else {
            var shortcutIcon = 
            '<link rel="shortcut icon" href="data:image/png;base64,' 
            + new Buffer(data, 'binary').toString('base64') 
            + '"/>';

            file.contents = new Buffer(htmlContents.replace(FIND_REGEXP, shortcutIcon));
            callback(null, file);
          }
        });
      } else {
        callback(new gutil.PluginError(PLUGIN_NAME, 'The correct key is not found, match array: ' + matchArray));
      }
    } else {
      callback(new gutil.PluginError(PLUGIN_NAME, 'Not supporting contents type'));
    }
  });
};

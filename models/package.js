var path = require('path');
var fs = require('fs-extra');
var _ = require('lodash');
var moment = require('moment');
var tarExtractor = require('tarball-extract');
var tar = require('../lib/tar');
var builder = require('spm-builder').build;

function Package(package) {
  if (!package.name || !package.version) {
    return;
  }
  this.name = package.name;
  this.version = package.version;

  var pkg;
  var datafile = this.datafile();
  if (fs.existsSync(datafile)) {
    pkg = fs.readJsonSync(datafile);
  } else {
    pkg = {};
  }
  _.extend(this, pkg, package);
  return this;
}

Package.prototype = {
  datafile: function() {
    return path.join(CONFIG.wwwroot, 'repository', this.name, this.version, 'index.json');
  },

  save: function() {
    var now = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    this['created_at'] = this['created_at'] || now;
    this['updated_at'] = now;
    fs.outputJsonSync(this.datafile(), this);
    return this;
  },

  saveTarfile: function(data, cb) {
    var self = this;
    this.filename = this.name + '-' + this.version + '.tar.gz';
    var tarPath = path.join(CONFIG.wwwroot, 'repository', this.name, this.version, this.filename);
    var extractPath = path.join(CONFIG.wwwroot, 'repository', this.name, this.version, this.name + '-' + this.version);
    fs.writeFileSync(tarPath,data);
    tarExtractor.extractTarball(tarPath, extractPath, function(err) {
      console.log('extracted', err)

      var buildArgs = {
        cwd: path.resolve(extractPath),
        install: true,
        dest: path.resolve(path.join(CONFIG.wwwroot, 'repository', self.name, self.version, self.name + '-' + self.version + '-packed'))
      }
      console.log('Cwd is:' + extractPath);

      builder(buildArgs, function(err) {
        if(err) {
          self.delete();
          return cb(err);
        }

        var buildedPath = path.join(buildArgs.dest, self.name, self.version);
        var saveBuildedTo = path.resolve(path.join(CONFIG.wwwroot, 'repository', self.name, self.version, self.name + '-' + self.version + '-packed.tar.gz'));
        tar.create(buildedPath, saveBuildedTo, function(err, target) {
            if(err) {
              self.delete();
              return cb(err);
            }

            cb();
        })

      });
    });
  },

  delete: function() {
    fs.removeSync(path.join(CONFIG.wwwroot, 'repository', this.name, this.version));
    return this;
  }
};


module.exports = Package;

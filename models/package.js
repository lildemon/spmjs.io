var path = require('path');
var fs = require('fs-extra');
var _ = require('lodash');
var moment = require('moment');
var tar = require('tarball-extract');

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

  saveTarfile: function(data) {
    this.filename = this.name + '-' + this.version + '.tar.gz';
    var tarPath = path.join(CONFIG.wwwroot, 'repository', this.name, this.version, this.filename);
    var extractPath = path.join(CONFIG.wwwroot, 'repository', this.name, this.version, this.name + '-' + this.version);
    fs.writeFileSync(tarPath,data);
    tar.extractTarball(tarPath, extractPath, function(err) {
      console.log('extracted', err)
    });
  },

  delete: function() {
    fs.removeSync(path.join(CONFIG.wwwroot, 'repository', this.name, this.version));
    return this;
  }
};


module.exports = Package;

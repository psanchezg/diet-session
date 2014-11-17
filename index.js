var debug = require('debug')('diet-session');
var uid = require('uid-safe').sync;
var fs = require('fs');
var path = require('path');
var signature = require('cookie-signature');

var options = module.parent.options || {};

var getCookie = function (cookie, secret) {
	if (!cookie) {
		return uid(24);
	}
	var cookieid = signature.unsign(cookie, secret);
	if (cookieid === false) {
		debug('cookie signature invalid');
		cookieid = uid(24);
	}
	return cookieid;
};

var setcookie = function ($, name, cookieid, secret) {
  var signed = signature.sign(cookieid, secret);
  debug('set-cookie %s', signed);
	$.cookies.set(name, signed);
};

var readSession = function (sid) {
	var data, stats;
	try {
		stats = fs.statSync(options.dir);
	} catch (err) {
		// errno=2, 32: ENOENT, No such file or directory is not an error.
	  if (err.errno != 2 && err.errno != 32 && err.errno != 34) throw err;
	}
	if (!stats || !stats.isDirectory()) {
		try {
	    fs.mkdirSync(options.dir, 0755);
			debug('Created session directory');
		} catch(err) {
			debug("Creating", err.errno);
			throw err;
		}
  }
	
	try {
		data = fs.readFileSync(path.join(options.dir, sid + ".json"), 'UTF-8');
		data = JSON.parse(data.toString());
	} catch (err) {
		debug('Session not stored');
		data = {};
	}
	return data;
};

var Session = function ($) {
	this.__proto__.header = [];
	this.__proto__.signal = $;
	
	var name = options.name || options.key || 'diet.sid';

	if (!options.secret) {
    debug('provide secret option');
  }

	var sid = getCookie($.cookies[name], options.secret),
			session = {
				id: sid,
				name: name
			};

	options.dir = options.dir || './sessions';
	this.data = readSession(sid);
	this.session = session;
	setcookie($, name, sid, options.secret);
	return this;
};

Session.prototype.save = function(){
	try {
		fs.writeFileSync(path.join(options.dir, this.session.id + ".json"), JSON.stringify(this.data, null, 4));
	} catch (err) {
		debug(err);
	}
};

Session.prototype.destroy = function () {
	try {
		fs.deleteSync(path.join(options.dir, this.session.id + '.json'));
	} catch (err) {
		debug(err);
	}
    $.session.data = {};
};

// Cookie Handler Module
module.exports.global = function($){
	$.return(new Session($));
};

module.parent.return();
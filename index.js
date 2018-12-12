/*jslint node: true */
'use strict';

var debug = require('debug')('diet-session');
var uid = require('uid-safe').sync;
var fs = require('fs');
var path = require('path');
var signature = require('cookie-signature');

var options = module.parent.options || {},
    session, sessions = {}, session_ids = [];

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
    if (!$.cookies) {
        return;
    }
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
    if (err.errno !== 2 && err.errno !== 32 && err.errno !== 34) {
      throw err;
    }
	}
	if (!stats || !stats.isDirectory()) {
		try {
      fs.mkdirSync(options.dir, 755);
			debug('Created session directory');
		} catch (mkerr) {
			debug("Creating", mkerr.errno);
			throw mkerr;
		}
  }
	
	try {
		data = fs.readFileSync(path.join(options.dir, sid + ".json"), 'UTF-8');
		data = JSON.parse(data.toString());
	} catch (serr) {
		debug('Session not stored.', serr.message);
		data = {};
	}
	return data;
};

var Session = function ($, id) {
	//this.__proto__.header = [];
	//this.__proto__.signal = $;

  if (!options.secret) {
    debug('provide secret option');
    throw 'provide secret option';
  }
  
  var name = options.name || options.key || 'diet.sid';
  if (!id) {
    id = ($.cookies ? getCookie($.cookies[name], options.secret) : uid(24));
  }
	options.dir = options.dir || './sessions';

  if (session_ids.indexOf(id) > -1) {
    return sessions[id];
  }

  this.cookie = ($.cookies ? getCookie($.cookies[name], options.secret) : null);

	var session = {
			  id: id,
        name: name
      };

	this.data = readSession(session.id);
	this.session = session;
	setcookie($, name, session.id, options.secret);
	return this;
};

/**
 * Update reset `.cookie.maxAge` to prevent
 * the cookie from expiring when the
 * session is still active.
 *
 * @return {Session} for chaining
 * @api public
 */

Session.prototype.touch = function () {
  return this.resetMaxAge();
};

/**
 * Reset `.maxAge` to `.originalMaxAge`.
 *
 * @return {Session} for chaining
 * @api public
 */

Session.prototype.resetMaxAge = function () {
  this.cookie.maxAge = this.cookie.originalMaxAge;
  return this;
};


Session.prototype.save = function () {
	try {
		fs.writeFileSync(path.join(options.dir, this.session.id + ".json"), JSON.stringify(this.data, null, 4));
    session_ids.push(this.session.id);
    sessions[this.session.id] = this;
	} catch (err) {
		debug(err);
	}
};

Session.prototype.destroy = function () {
	try {
		fs.deleteSync(path.join(options.dir, this.session.id + '.json'));
    var index = session_ids.indexOf(this.session.id);
    if (index !== -1) session_ids.splice(index, 1);
    delete sessions[this.session.id];
	} catch (err) {
		debug(err);
	}
    this.data = {};
};

// Session Handler Module
module.exports.global = function ($) {
  var name = options.name || options.key || 'diet.sid';
  var id = ($.cookies ? getCookie($.cookies[name], options.secret) : uid(24));
  session = new Session($, id);
	$['return'](session);
};

module.parent['return']();
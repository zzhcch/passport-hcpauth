/**
 * Module dependencies.
 */
var uri = require('url'),
  crypto = require('crypto'),
  util = require('util'),
  OAuth2Strategy = require('passport-oauth2'),
  Profile = require('./profile'),
  InternalOAuthError = require('passport-oauth2').InternalOAuthError;

/**
 * `Strategy` constructor.
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify, additionalParams) {
  options = options || {};
  options.base = options.base || '';
  options.authorizationURL =
    options.authorizationURL || options.base + '/oauth/authorize';
  options.tokenURL = options.tokenURL || options.base + '/oauth/token';
  options.scopeSeparator = options.scopeSeparator || ',';
  OAuth2Strategy.call(this, options, verify);
  this.name = options.name || 'hcp';
  this.additionalParams = additionalParams || {};
  this._profileURL = options._profileURL || options.base + '/svc/getuser';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile.
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */

Strategy.prototype.userProfile = function(accessToken, done) {
  var _this = this;
  var url = uri.parse(this._profileURL);
  url = uri.format(url);
  this._oauth2.get(url, accessToken, function(err, body, res) {
    var json;
    if (err) {
      if (err.data) {
        try {
          json = JSON.parse(err.data);
        } catch (_) {}
      }
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }

    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }

    var profile = Profile.parse(json);
    profile.provider = _this.name || 'hcp';
    //profile.provider = 'hcp';
    profile._raw = body;
    profile._json = json;
    done(null, profile);
  });
};

/**
 * Parse error response from OAuth 2.0 token endpoint.
 *
 * @param {String} body
 * @param {Number} status
 * @return {Error}
 * @api protected
 */
Strategy.prototype.parseErrorResponse = function(body, status) {
  var json = JSON.parse(body);
  return OAuth2Strategy.prototype.parseErrorResponse.call(this, body, status);
};

Strategy.prototype.authorizationParams = function(options) {
  Object.keys(this.additionalParams).map(param => {
    if (param) {
      options[param] = this.additionalParams[param];
    }
  });
  return options;
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;

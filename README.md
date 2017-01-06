# passport-hcpAuth


[Passport](http://passportjs.org/) strategy for authenticating with Hcp-Auth-Tool(internal)
using the OAuth 2.0 API.

This module lets you authenticate using Hcp-Auth-Tool in your Node.js applications.

### Many thanks to Tony qian's big contribution!

## Install

```bash
$ npm install passport-hcpAuth
```

## Usage
### noraml:
```js
var passport = var passport = require('passport');
var HcpStrategy = require('passport-hcpAuth').Strategy;

passport.use(new HcpStrategy({
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    base: config.environmentUrl,
    authorizationURL: config.authorizeUrl,
    tokenURL: config.tokenUrl,
    callbackURL: config.callBackUrl,//("http://127.0.0.1:3000/auth/hcp/callback")
    _profileURL: config.profileUrl
  },
  function(accessToken, refreshToken, profile, cb) {
    fetch_user(config.profileUrl, accessToken).then(function (obj) {
          return cb(null,  obj);
      });
  }
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'hcpAuth'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js

app.get('/auth/hcp',function(req, res, next){
      if (req.query.redirect) {
        req.session.authRedirect = req.query.redirect;
      }
      passport.authenticate('hcp')(req, res, next);
    });

app.get('/auth/hcp/callback', function (req, res) {
      var redirect = function () {
        var _redirect = req.session.authRedirect;
        if (_redirect) {
          delete req.session.authRedirect;
        }
        return res.status(303).location(_redirect || '/').end();
      };

      // Successful authentication, redirect home.
      passport.authenticate('hcp', function (err, user) {
          return redirect();
      })(req, res);
    });

```

### In loopBack:
1. first:create or addto provider.json
```json
"hcp": {
        "provider": "hcp",
        "base": BASE_URL,
        "module": "passport-hcpAuth",
        "strategy": "OAuth2Strategy",
        "clientID": CLIENT_ID,
        "clientSecret": CLIENT_SECRET,
        "authPath": "/auth/hcp",
        "response_type": "code",
        "successRedirect": "/success",
        "failureRedirect": "/login",
        "state": "security_token",
        "failureFlash": true,
        "callbackURL": "/auth/hcp/callback"
    }
```


2. app in server.js
```js
// Passport configurators..
var loopbackPassport = require('loopback-component-passport');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

// attempt to build the providers/passport config
var config = {};
try {
    config = require('../providers.json');
} catch (err) {
    console.trace(err);
    process.exit(1); // fatal
}

// The access token is only available after boot
app.middleware('auth', loopback.token({
    model: app.models.accessToken,
}));

app.middleware('session:before', cookieParser(app.get('cookieSecret')));
app.middleware('session', session({
    secret: 'kitty',
    saveUninitialized: true,
    resave: true,
}));
passportConfigurator.init();

// We need flash messages to see passport errors
app.use(flash());

passportConfigurator.setupModels({
    userModel: app.models.user,
    userIdentityModel: app.models.userIdentity,
    userCredentialModel: app.models.userCredential,
});
for (var s in config) {
    var c = config[s];
    c.session = c.session !== false;
    passportConfigurator.configureProvider(s, c);
}
```

then it works




## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2016 Osborn zhang

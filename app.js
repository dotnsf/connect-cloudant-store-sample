//. app.js

var express = require( 'express' ),
    ejs = require( 'ejs' ),
    passport = require( 'passport' ),
    session = require( 'express-session' ),
    WebAppStrategy = require( 'ibmcloud-appid' ).WebAppStrategy,
    app = express();

var settings = require( './settings' );

//. Cloudant
var CloudantStore = require( 'connect-cloudant-store' )( session );
var store = new CloudantStore({
  database: settings.cloudant_database,
  url: settings.cloudant_url
});

store.on( 'connect', function(){
  console.log( 'Cloudant session store is ready for use.' );
  setInterval( function(){
    store.cleanupExpired();
  }, 3600 * 1000 );
});

store.on( 'disconnect', function(){
  console.log( 'failed to connect to Cloudant db - by default falls back to Memory store.' );
});

store.on( 'error', function( err ){
  console.log( 'You can log the store errors to your app log.', err );
});

//. setup session
app.use( session({
  secret: 'connect-cloudant-store-sample',
  store: store,   //. if deleted/commented this line, it will work as expected.
  resave: false,
  //cookie: { maxAge: ( 365 * 24 * 60 * 60 * 1000 ) },
  //proxy: true
  saveUninitialized: false
}));

//. setup passport
app.use( passport.initialize() );
app.use( passport.session() );
passport.serializeUser( ( user, cb ) => cb( null, user ) );
passport.deserializeUser( ( user, cb ) => cb( null, user ) );
passport.use( new WebAppStrategy({
  tenantId: settings.tenantId,
  clientId: settings.clientId,
  secret: settings.secret,
  oauthServerUrl: settings.oauthServerUrl,
  redirectUri: settings.redirectUri
}));

//. enable routing
app.use( express.Router() );

//. template engine
app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );

//. login
app.get( '/appid/login', passport.authenticate( WebAppStrategy.STRATEGY_NAME, {
  successRedirect: '/',
  forceLogin: false //true
}));

//. callback
app.get( '/appid/callback', function( req, res, next ){
  next();
}, passport.authenticate( WebAppStrategy.STRATEGY_NAME )
);

//. logout
app.get( '/appid/logout', function( req, res ){
  WebAppStrategy.logout( req );
  res.redirect( '/' );
});

//. access restriction
app.all( '/*', function( req, res, next ){
  if( !req.user || !req.user.sub ){
    res.redirect( '/appid/login' );
  }else{
    next();
  }
});


//. top page
app.get( '/', function( req, res ){
  res.render( 'index', { profile: req.user } );
});


//. listening to port
var port = process.env.PORT || 8080;
app.listen( port );
console.log( "server starting on " + port + " ..." );


const { URL } = require('url');
const httpProxy = require('http-proxy');

// To simplify deployment for our demo, we aggregate web and bot server into a single endpoint.
// If the HTTP POST is going to /api/messages, we will reverse-proxy the request to the bot server at http://localhost:3978/.

const { PROXY_BOT_URL } = process.env;

if (PROXY_BOT_URL) {
  const proxy = httpProxy.createProxyServer();

  console.log(`Will redirect /api/messages to ${new URL('api/messages', PROXY_BOT_URL).href}`);

  // Add the next callback and call it after proxying the request
  module.exports = (req, res, next) => {
    proxy.web(req, res, { target: PROXY_BOT_URL }, (err) => {
      if (err) {
        console.error('Error in proxying request:', err);
        res.send(500);
      }
      next();  // Ensure to call next() after proxying the request
    });
  };
} else {
  let warningShown;

  module.exports = (_, res, next) => {
    if (!warningShown) {
      warningShown = true;
      console.warn('PROXY_BOT_URL is not set, we are not reverse-proxying /api/messages.');
    }

    res.send(502);
    next();  // Call next() here as well
  };
}

require('dotenv').config();
const { AZURE_STORAGE_CONTAINER_NAME } = process.env;

// Setting default environment variables
// Use the Azure-provided PORT if available, fallback to 5000 for local development.
process.env = {
  AZURE_STORAGE_CONTAINER_NAME: AZURE_STORAGE_CONTAINER_NAME,
  PORT: process.env.PORT || '5000',  // Use Azure's PORT or fallback to 5000 for local
  STATIC_FILES: 'public',  // Make sure this matches the location of your public folder
  ...process.env
};

// Checks for required environment variables.
[
  'AZURE_STORAGE_ACCOUNT_KEY',
  'AZURE_STORAGE_ACCOUNT_NAME',
  'AZURE_STORAGE_CONTAINER_NAME',
  'BOT_ID',
  'BOT_TENANT_ID'
].forEach(name => {
  if (!process.env[name]) {
    throw new Error(`Environment variable ${name} must be set.`);
  }
});

const { join } = require('path');
const restify = require('restify');

const server = restify.createServer();
const { PORT, STATIC_FILES } = process.env;

server.use(restify.plugins.queryParser());

// Registering routes.
server.get('/api/azurestorage/uploadsastoken', require('./routes/azureStorage/uploadSASToken'));
server.get('/api/directline/token', require('./routes/directLine/token'));
server.post('/api/messages', require('./routes/botMessages'));

// Correcting the static file path to point to the right directory
STATIC_FILES &&
  server.get(
    '/*',
    restify.plugins.serveStatic({
      default: 'index.html',
      directory: join(__dirname, '..', STATIC_FILES)  // Change this if your public folder is not in src
    })
  );

// Listen on the correct port (Azure's provided port or fallback for local development)
server.listen(PORT, () => {
  STATIC_FILES && console.log(`Will serve static content from ${STATIC_FILES}`);
  console.log(`Rest API server is listening on port ${PORT}`);
});

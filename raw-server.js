// raw-server.js
// We import the built-in 'http' module from Node.js
const http = require('http');

// Create a basic HTTP server. 
// The 'req' (request) and 'res' (response) objects are very raw.
const server = http.createServer((req, res) => {
  
  // Pain Point 1: We have to manually check the URL and the HTTP method (GET, POST, etc.)
  if (req.url === '/notes' && req.method === 'GET') {
    
    // Pain Point 2: We have to manually set the HTTP status code (200 = OK)
    res.statusCode = 200;
    
    // Pain Point 3: We have to manually set the headers to tell the browser we are sending JSON
    res.setHeader('Content-Type', 'application/json');
    
    // Pain Point 4: We have to manually convert our JavaScript object into a JSON string
    const notes = [{ id: 1, text: "Learn Express.js" }];
    res.end(JSON.stringify(notes));
    
  } else {
    // If the route doesn't match, we have to manually handle the 404 error
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not Found');
  }
});

// Tell the server to listen on port 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Raw Node server is running on http://localhost:${PORT}`);
});
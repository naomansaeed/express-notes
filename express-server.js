// express-server.js
import {readFile, writeFile} from 'node:fs/promises';

import { fileURLToPath} from 'node:url';
import { dirname, join } from 'node:path';

// Creating universals
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// path to data storage file
const dataFilePath = join (__dirname, 'notes.json');

// 1. We import the 'express' package instead of the raw 'http' module.
// Because we added "type": "module" to package.json, we use the modern 'import' syntax.
import express from 'express';

// 2. We initialize Express. This 'app' object is our new steering wheel.
const app = express();
const PORT = 3000;

async function loadNotes() {
    try {
        const content = await readFile (dataFilePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.log(error);
        return [];
    }
}

// -------------------------------------------------------------------
// SOLUTION TO PAIN POINTS 1 & 2: ROUTING AND HTTP METHODS
// -------------------------------------------------------------------
// In raw Node, we had to write: if (req.url === '/notes' && req.method === 'GET')
// In Express, we just use app.get()! Express handles the URL and Method matching for us.
app.get('/notes', async (req, res) => {
  
  const notes = await loadNotes();

  // -------------------------------------------------------------------
  // SOLUTION TO PAIN POINTS 3 & 4: HEADERS AND JSON STRINGIFICATION
  // -------------------------------------------------------------------
  // In raw Node, we had to manually set res.statusCode = 200, 
  // manually set the 'Content-Type' header, and manually call JSON.stringify().
  
  // Express gives us a built-in .json() method! 
  // It automatically sets the status to 200, sets the correct headers, 
  // and converts our JavaScript object into a JSON string behind the scenes.
  res.status(200).json(notes);
});

// read a single note using GET method
app.get('/notes/:id', async(req, res) => {
    // load notes from the file
    const notes = await loadNotes();
    // notes id from request, parsed into integer
    const notesID =  parseInt(req.params.id);
    // using find() method to locate the exact note
    const note = notes.find(note => note.id === notesID);
    // parse the output as JSON
    //return JSON.parse(note.text); // I used the old way by mistake. It gave error.
    res.json(note);
});

// -------------------------------------------------------------------
// SOLUTION TO PAIN POINT 5: HANDLING 404s (NOT FOUND)
// -------------------------------------------------------------------
// If a user visits a route we didn't define (like the homepage '/'), 
// Express has a default way to handle it, but we can easily define our own.
// app.use() without a specific path acts as a "catch-all" for any unmatched routes.
app.use((req, res) => {
  res.status(404).json({ error: "Route not found!" });
});

// 3. Start the server. Notice we call app.listen() instead of server.listen().
app.listen(PORT, () => {
  console.log(`Express server is running smoothly on http://localhost:${PORT}`);
});

//console.log(await loadNotes());
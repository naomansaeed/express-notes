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
app.use(express.json());
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
    // check if data does not exist
    if (!note) {
        return res.status(404).json({error: "Item not found"});
    }
    // parse the output as JSON
    //return JSON.parse(note.text); // I used the old way by mistake. It gave error.
    res.json(note);
});

// route for POST
app.post('/notes', async (req, res) => {
    // load notes from the file
    const notes = await loadNotes();
    //extract data from request body
    const entry = req.body.text;
    //Following code is for creating reasonable unique / maximum value ID
    //extract existing ids into a new array
    const ids = notes.map(note => note.id);
    // find the highest number in the array. if empty, assign 0
    const maxId = ids.length > 0 ? Math.max(...ids) : 0 ;
    //new id is highest value + 1
    //const newId = maxId + 1;
    // create newNote object
    const newNote = {
        id: maxId + 1,
        text: entry
    };
    //push newNote to the notes array
    notes.push(newNote);
    // save back to the external file
    await writeFile(dataFilePath, JSON.stringify(notes, null, 2));
    //sending status code for confirmation
    res.status(201).json({message:'note created', note:newNote});
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
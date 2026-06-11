// express-server.js
import {readFile, writeFile} from 'node:fs/promises';
import { body, validationResult } from 'express-validator';
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
import { text } from 'node:stream/consumers';

// 2. We initialize Express. This 'app' object is our new steering wheel.
const app = express();
app.use(express.json());
const PORT = 3000;

// Defining an array of validation rules
const validateNoteCreation = [
    body('text')
    .isString().withMessage('text field must be a string')
    .notEmpty().withMessage('text field cannot be empty')
]

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
app.post('/notes', validateNoteCreation, async (req, res) => {
    // extracting any errors in validation results
    const errors = validationResult(req);
    // if any errors occured, the array will not be empty
    if (!errors.isEmpty()) {
        // if error found, we send 400.
        return res.status(400).json({ errors: errors.array() });
    }

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

// The route for DELETE request
app.delete('/notes/:id', async(req,res) => {
    // Load the notes from the file
    const notes = await loadNotes();
    // get total size of the existing array
    const originalCount = notes.length;
    // get id from req.params and parse into int
    const id = parseInt(req.params.id);

    // extracting existing ids into new array
    //const ids = notes.map(note => note.id);

    // filter out the specified id and keep only the remaing ones.
    const filtered = notes.filter(note => note.id !== id);
    // if the note didn't originally exist, array length hasn't changed.
    if (filtered.length === originalCount) {
        // if this statement is true, that means nothing was removed because the not wasn't found.
        return res.status(404).json({ error: "Note not found" });
    }
    // save the new filtered array back to the file
    await writeFile(dataFilePath, JSON.stringify(filtered, null, 2));
    // send response code and message
    res.status(200).json({message:'Deletion successful!'});
});

// The route for PUT request to edit a record by id
app.put('/notes/:id', async (req, res) => {
    //Loading the notes from file
    const notes = await loadNotes();
    // Getting id value from request params and parsing it into int
    const noteId = parseInt(req.params.id);
    // storing note text from req.body to update the existing text
    const entry = req.body.text;
    // Using find() to locate the specific note in the array
    let targetNote = notes.find(note => note.id === noteId);
    // if target note is not found, give 404 error
    if (!targetNote) {
        return res.status(404).json({error: "Item not found"});
    } 
    // if found, update the text of the targetNote
    targetNote.text = entry; // alternate method: targetNote.text = req.body.text also works.
    // save the updated note back to the file
    await writeFile(dataFilePath, JSON.stringify(notes, null, 2));
    // sending response message and code
    res.status(200).json({message:'Note edited successfully.', data: targetNote});
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
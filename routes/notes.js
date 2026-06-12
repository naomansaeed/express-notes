//importing necessary modules
import express from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';


// Creating a new router instance
const router = express.Router();
// creating universals
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname (__filename);
// Path to data storage file
const dataFilePath = join(__dirname, '../notes.json');
//load the notes in one place and call this function from anywhere.
async function loadNotes() {
    try {
        const content = await readFile (dataFilePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.log(error);
        return [];
    }
}

router.get('/', async (req, res) => {
  
  const notes = await loadNotes();

  //extract serach from query
  const searchTerm = req.query.search;
  //checking if searchTerm was sent in the url
  if (searchTerm) {
     // filter notes without case sensitivity
     const filteredNotes = notes.filter(note => note.text.toLowerCase().includes(searchTerm.toLowerCase()));
     //note.text.includes(searchTerm));  //notes.text.toLowerCase().includes(searchTerm.toLowerCase())); this didn't work at all
     // send response with json
     return res.status(200).json(filteredNotes);
   }

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

// Exporting router so the main file can use it.
export default router;
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;


const db = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "book_notes",
    password: "1234",
    port: 5432,
});





app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.removeHeader("X-Content-Type-Options");
    next();
});


app.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM books');
        res.render('index', { books: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/books', async (req, res) => {
    const { title, author, isbn, notes, rating, read_date } = req.body;
    const cover_url = await getBookCover(isbn);

    try {
        await db.query(
            'INSERT INTO books (title, author, cover_url, notes, rating, read_date) VALUES ($1, $2, $3, $4, $5, $6)',
            [title, author, cover_url, notes, rating, read_date]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

async function getBookCover(isbn) {
    try {
        const response = await axios.get(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`);
        if (response.status === 200) {
            return response.config.url;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching book cover:', error);
        return null;
    }
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

import 'dotenv/config';
import { MongoClient } from 'mongodb';
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;
const uri = process.env.DB_URI;
let db; 

MongoClient.connect(uri)
  .then((client) => {
    db = client.db('atsiskaitymas');
    console.log('Connected to MongoDB');
  })
  .catch((error) => console.error('Error connecting to MongoDB:', error));

app.use(cors());
app.use(express.json());

app.get('/api/books', async (req, res) => {
  const filter = {};
  const { title, author, startYear, endYear, genres, available, page = 1, limit = 10, sortOrder = 'asc', sortBy = 'publishDate' } = req.query;
  
  const parsedLimit = parseInt(limit, 10);
  const skip = (page - 1) * parsedLimit;
  
  
  const sortOptions = {
    publishDate: { publishDate: sortOrder === 'asc' ? 1 : -1 },
    rating: { rating: sortOrder === 'asc' ? 1 : -1 },
    pages: { pages: sortOrder === 'asc' ? 1 : -1 }
  };
  const sort = sortOptions[sortBy] || { publishDate: 1 }; 

  if (title) filter.title = { $regex: title, $options: 'i' }; 

  if (author) filter.author = { $regex: author, $options: 'i' }; 

  if (startYear) filter.publishDate = { ...filter.publishDate, $gte: new Date(startYear) };

  if (endYear) filter.publishDate = { ...filter.publishDate, $lte: new Date(endYear) };

  if (genres) filter.genres = { $all: genres.split(',').map(g => g.trim()) }; 

  if (available === 'true') filter.amountOfCopies = { $gt: 0 }; 

  try {
    const coll = db.collection('books');
    
    const totalBooks = await coll.countDocuments(filter);

    const books = await coll.find(filter).sort(sort).skip(skip).limit(parsedLimit).toArray();
  
    const totalPages = Math.ceil(totalBooks / parsedLimit);

    res.status(200).json({
      books,
      totalPages,
      currentPage: parseInt(page),
      totalBooks
    });
    
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const coll = db.collection('books');
    const book = await coll.findOne({ _id: id });

    if (!book) {
      res.status(404).json({ message: 'Book not found' });
    } else {
      res.status(200).json(book);
    }
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
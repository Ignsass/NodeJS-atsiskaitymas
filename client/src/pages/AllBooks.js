import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AllBooks() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genres, setGenres] = useState([]);
  const [available, setAvailable] = useState(false);
  const [sortBy, setSortBy] = useState('publishDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedBook, setSelectedBook] = useState(null); // State to track the selected book for the modal
  const availableGenres = ["Fiction", "Non-Fiction", "Fantasy", "Science", "Mystery"];

  useEffect(() => {
    fetchBooks();
  }, [page, limit, title, author, genres, available, sortBy, sortOrder]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/books', {
        params: {
          page,
          limit,
          title,
          author,
          genres: genres.join(','),
          available,
          sortBy,
          sortOrder,
        },
      });
      setBooks(response.data.books);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handlePageClick = (pageNumber) => {
    setPage(pageNumber);
  };

  const openModal = (book) => {
    setSelectedBook(book); // Open modal with the selected book details
  };

  const closeModal = () => {
    setSelectedBook(null); // Close the modal
  };

  const renderPagination = () => {
    const pages = [];
    const maxDisplayPages = 2;
    if (totalPages <= 1) return null;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - maxDisplayPages && i <= page + maxDisplayPages)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={i === page ? 'active-page' : ''}
            style={i === page ? { color: 'white', backgroundColor: 'blue' } : {}}
          >
            {i}
          </button>
        );
      } else if (i === page - maxDisplayPages - 1 || i === page + maxDisplayPages + 1) {
        pages.push(<span key={i}>...</span>);
      }
    }

    return pages;
  };

  const handleGenreChange = (genre) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter((g) => g !== genre));
    } else {
      setGenres([...genres, genre]);
    }
  };

  return (
    <div className="all-books">
      <h1>All Books</h1>

      {/* Filtering UI */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
          />
          Available Only
        </label>
        <div className="genres">
          {availableGenres.map((genre) => (
            <label key={genre}>
              <input
                type="checkbox"
                value={genre}
                checked={genres.includes(genre)}
                onChange={() => handleGenreChange(genre)}
              />
              {genre}
            </label>
          ))}
        </div>
        <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
          <option value="publishDate">Publish Date</option>
          <option value="rating">Rating</option>
          <option value="pages">Pages</option>
        </select>
        <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Books List */}
      <div className="books">
        {books.map((book) => (
          <div key={book._id} className="book-card">
            <img src={book.imageUrl} alt={book.title} />
            <h3>{book.title}</h3>
            <p>Author: {book.author}</p>
            <p>Rating: {book.rating}</p>
            <button onClick={() => openModal(book)}>Read More</button> {/* Open modal */}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => handlePageClick(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        {renderPagination()}
        <button
          onClick={() => handlePageClick(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      {/* Modal for detailed book information */}
      {selectedBook && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>
              &times;
            </button>
            <img src={selectedBook.imageUrl} alt={selectedBook.title} />
            <h2>{selectedBook.title}</h2>
            <p><strong>Author:</strong> {selectedBook.author}</p>
            <p><strong>Genres:</strong> {selectedBook.genres.join(', ')}</p>
            <p><strong>Pages:</strong> {selectedBook.pages}</p>
            <p><strong>Publish Date:</strong> {new Date(selectedBook.publishDate).toLocaleDateString()}</p>
            <p><strong>Rating:</strong> {selectedBook.rating}</p>
            <p><strong>Description:</strong> {selectedBook.description}</p>
            <p><strong>Copies Available:</strong> {selectedBook.amountOfCopies}</p>
          </div>
        </div>
      )}

    </div>
  );
}

export default AllBooks;

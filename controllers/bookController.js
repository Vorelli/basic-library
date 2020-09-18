var mongoose = require('mongoose');
var Book = mongoose.model('Book');
var Author = mongoose.model('Author');
var Genre = mongoose.model('Genre');
var BookInstance = mongoose.model('BookInstance');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.index = function (req, res) {
  var counts = {
    book_count: function (cb) {
      Book.countDocuments({}, cb);
    },
    book_instance_count: function (cb) {
      BookInstance.countDocuments({}, cb);
    },
    book_instance_available_count: function (cb) {
      BookInstance.countDocuments({ status: 'Available' }, cb);
    },
    author_count: function (cb) {
      Author.countDocuments({}, cb);
    },
    genre_count: function (cb) {
      Genre.countDocuments({}, cb);
    }
  };

  var success = function (err, results) {
    res.render('index', {
      title: 'Basic Library Home',
      error: err,
      data: results
    });
  };

  async.parallel(counts, success);
};

// Display list of all books.
exports.book_list = function (req, res) {
  Book.find({}, 'title author')
    .populate('author')
    .exec(function (err, list_books) {
      if (err) return next(err);
      res.render('book_list', { title: 'Book List', book_list: list_books });
    });
};

// Display detail page for a specific book.
exports.book_detail = function (req, res, next) {
  var book_and_bookinstances_by_id = {
    book: function (cb) {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(cb);
    },
    book_instance: function (cb) {
      BookInstance.find({ book: req.params.id }).exec(cb);
    }
  };

  var get_done = function (err, results) {
    if (err) return next(err);
    if (results.book == null) {
      var err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    res.render('book_detail', {
      title: results.book.title,
      book: results.book,
      book_instances: results.book_instance
    });
  };

  async.parallel(book_and_bookinstances_by_id, get_done);
};

// Display book create form on GET.
exports.book_create_get = function (req, res, next) {
  async.parallel(
    {
      authors: function (cb) {
        Author.find(cb);
      },
      genres: function (cb) {
        Genre.find(cb);
      }
    },
    function (err, results) {
      if (err) return next(err);
      res.render('book_form', {
        title: 'Create Book',
        authors: results.authors,
        genres: results.genres
      });
    }
  );
};

// Handle book create on POST.
exports.book_create_post = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  sanitizeBody('*').escape(),

  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1 }),
  body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
  body('isbn', 'ISBN must not be empty.').trim().isLength({ min: 1 }),

  (req, res, next) => {
    const errors = validationResult(req);

    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre
    });
    if (!errors.isEmpty()) {
      async.parallel(
        {
          authors: function (callback) {
            Author.find(callback);
          },
          genres: function (callback) {
            Genre.find(callback);
          }
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = 'true';
            }
          }
          res.render('book_form', {
            title: 'Create Book',
            authors: results.authors,
            genres: results.genres,
            book: book,
            errors: errors.array()
          });
        }
      );
    } else {
      book.save(function (err) {
        if (err) return next(err);
        res.redirect(book.url);
      });
    }
  }
];

// Display book delete form on GET.
exports.book_delete_get = function (req, res, next) {
  const getBookAndBookInstances = {
    book: function (cb) {
      Book.findById(req.params.id).exec(cb);
    },
    bookInstances: function (cb) {
      BookInstance.find({ book: req.params.id }).exec(cb);
    }
  };

  const afterGet = function (err, results) {
    if (err) return next(err);
    if (results.book == null) {
      res.redirect('/catalog/books');
    }
    res.render('book_delete', {
      title: 'Delete Book',
      book: results.book,
      bookInstances: results.bookInstances
    });
  };

  async.parallel(getBookAndBookInstances, afterGet);
};

// Handle book delete on POST.
exports.book_delete_post = function (req, res, next) {
  const getBookAndBookInstances = {
    book: function (cb) {
      Book.findById(req.body.bookid).exec(cb);
    },
    bookInstances: function (cb) {
      BookInstance.find({ book: req.body.bookid }).exec(cb);
    }
  };

  const afterGet = function (err, results) {
    if (err) return next(err);
    if (results.book == null) res.redirect('/catalog/books');
    if (results.bookInstances.length === 0) {
      Book.findByIdAndRemove(req.body.bookid, function (err) {
        if (err) return next(err);
        res.redirect('/catalog/books');
      });
    }
    res.render('book_delete', {
      title: 'Delete Book',
      book: results.book,
      bookInstances: results.bookInstances
    });
  };

  async.parallel(getBookAndBookInstances, afterGet);
};

// Display book update form on GET.
exports.book_update_get = function (req, res, next) {
  const getBookAuthorsAndGenres = {
    book: function (cb) {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(cb);
    },
    authors: function (cb) {
      Author.find(cb);
    },
    genres: function (cb) {
      Genre.find(cb);
    }
  };

  const afterGet = function (err, results) {
    if (err) return next(err);
    if (results.book == null) {
      err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    for (let i = 0; i < results.genres.length; i++) {
      for (let j = 0; j < results.book.genre.length; j++) {
        if (
          results.genres[i]._id.toString() ===
          results.book.genre[j]._id.toString()
        ) {
          results.genres[i].checked = 'true';
        }
      }
    }
    res.render('book_form', {
      title: 'Update Book',
      authors: results.authors,
      genres: results.genres,
      book: results.book
    });
  };

  async.parallel(getBookAuthorsAndGenres, afterGet);
};

// Handle book update on POST.
exports.book_update_post = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      req.body.genre =
        typeof req.body.genre === 'undefined' ? [] : new Array(req.body.genre);
    }
    next();
  },

  sanitizeBody('title').escape(),
  sanitizeBody('author').escape(),
  sanitizeBody('summary').escape(),
  sanitizeBody('isbn').escape(),
  sanitizeBody('genre.*').escape(),

  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1 }),
  body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }),

  (req, res, next) => {
    const errors = validationResult(req);

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      const getAuthorsAndGenres = {
        authors: function (cb) {
          Author.find(cb);
        },
        genres: function (cb) {
          Genre.find(cb);
        }
      };

      const afterGet = function (err, results) {
        if (err) return next(err);
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = 'true';
          }
        }
        res.render('book_form', {
          title: 'Update Book',
          authors: results.authors,
          genres: results.genres,
          book: book,
          errors: errors.array()
        });
      };

      async.parallel(getAuthorsAndGenres, afterGet);
    } else {
      Book.findByIdAndUpdate(req.params.id, book, {}, function (err, theBook) {
        if (err) return next(err);
        res.redirect(theBook.url);
      });
    }
  }
];

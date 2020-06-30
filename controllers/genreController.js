var mongoose = require('mongoose');
var Genre = mongoose.model('Genre');
var Book = mongoose.model('Book');
var async = require('async');
const validator = require('express-validator');

// Display list of all Genre.
exports.genre_list = function (req, res) {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_genres) {
      res.render('genre_list', {
        title: 'Genre List',
        genre_list: list_genres
      });
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res, next) {
  var genre_and_books_by_id = {
    genre: function (cb) {
      Genre.findById(req.params.id).exec(cb);
    },
    genre_books: function (cb) {
      Book.find({ genre: req.params.id }).exec(cb);
    }
  };

  var afterGet = function (err, results) {
    if (err) return next(err);
    if (results.genre == null) {
      console.log(results);
      var err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    res.render('genre_detail', {
      title: 'Genre Detail',
      genre: results.genre,
      genre_books: results.genre_books
    });
  };

  async.parallel(genre_and_books_by_id, afterGet);
};

// Display Genre create form on GET.
exports.genre_create_get = function (req, res) {
  res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  validator.sanitizeBody('name').escape(),

  validator.body('name', 'Genre name required').trim().isLength({ min: 1 }),

  (req, res, next) => {
    const errors = validator.validationResult(req);

    var genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array()
      });
    } else {
      Genre.findOne({ name: req.body.name }).exec(function (err, foundGenre) {
        if (err) return next(err);

        if (foundGenre) res.redirect(foundGenre.url);
        else {
          genre.save(function (err) {
            if (err) return next(err);
            res.redirect(genre.url);
          });
        }
      });
    }
  }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre update POST');
};

var mongoose = require('mongoose');
var Genre = mongoose.model('Genre');
var Book = mongoose.model('Book');
var async = require('async');
const validator = require('express-validator');

// Display list of all Genre.
exports.genre_list = function (req, res, next) {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_genres) {
      if (err) return next(err);
      res.render('genre_list', {
        title: 'Genre List',
        genre_list: list_genres
      });
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res, next) {
  var getGenreAndBooks = {
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
      err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    res.render('genre_detail', {
      title: 'Genre Detail',
      genre: results.genre,
      genre_books: results.genre_books
    });
  };

  async.parallel(getGenreAndBooks, afterGet);
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
exports.genre_delete_get = function (req, res, next) {
  const getGenreAndBooks = {
    genre: function (cb) {
      Genre.findById(req.params.id).exec(cb);
    },
    genresBooks: function (cb) {
      Book.find({ genre: req.params.id }).exec(cb);
    }
  };

  const afterGet = function (err, results) {
    if (err) return next(err);
    if (results.genre == null) res.redirect('/catalog/genres');
    res.render('genre_delete', {
      title: 'Delete Genre',
      genre: results.genre,
      genresBooks: results.genresBooks
    });
  };

  async.parallel(getGenreAndBooks, afterGet);
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res, next) {
  const getGenreAndBooks = {
    genre: function (cb) {
      Genre.findById(req.body.genreid).exec(cb);
    },
    genresBooks: function (cb) {
      Book.find({ genre: req.body.genreid }).exec(cb);
    }
  };

  const afterGet = function (err, results) {
    if (err) return next(err);
    if (results.genre == null) res.redirect('/catalog/genres');
    if (results.genresBooks.length > 0) res.redirect('/catalog/genres');
    Genre.findByIdAndRemove(req.body.genreid, function (err) {
      if (err) return next(err);

      res.redirect('/catalog/genres');
    });
  };

  async.parallel(getGenreAndBooks, afterGet);
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res, next) {
  const getGenre = {
    genre: function (cb) {
      Genre.findById(req.params.id).exec(cb);
    }
  };

  const afterGet = function (err, results) {
    if (err) return next(err);
    if (results.genre == null) {
      err = new Error('Genre not found.');
      err.status = 404;
      return next(err);
    }
    res.render('genre_form', { title: 'Update Genre', genre: results.genre });
  };

  async.parallel(getGenre, afterGet);
};

// Handle Genre update on POST.
exports.genre_update_post = [
  validator.sanitizeBody('name').escape(),

  validator.body('name', 'Genre name required').trim().isLength({ min: 1 }),

  (req, res, next) => {
    const errors = validator.validationResult(req);

    var genre = new Genre({ name: req.body.name, _id: req.params.id });

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
          Genre.findByIdAndUpdate(req.params.id, genre, {}, function (
            err,
            theGenre
          ) {
            if (err) return next(err);
            res.redirect(theGenre.url);
          });
        }
      });
    }
  }
];

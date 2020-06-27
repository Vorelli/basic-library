var express = require('express');
var router = express.Router();

var book_controller = require('../controllers/bookController');
var author_controller = require('../controllers/authorController');
var genre_controller = require('../controllers/genreController');
var book_instance_controller = require('../controllers/bookinstanceController');

/*
 *  BOOK ROUTES
 */

// home page
router.get('/', book_controller.index);

// get creating book
router.get('/book/create', book_controller.book_create_get);

// post creating book
router.post('/book/create', book_controller.book_create_post);

// get delete book
router.get('/book/:id/delete', book_controller.book_delete_get);

// post delete book
router.post('/book/:id/delete', book_controller.book_delete_post);

// get update book
router.get('/book/:id/update', book_controller.book_update_get);

// post update book
router.post('/book/:id/update', book_controller.book_update_post);

// get request 1 book
router.get('/book/:id', book_controller.book_detail);

// post request 1 book
router.get('/books', book_controller.book_list);

/*
 *  AUTHOR ROUTES
 */

// get create author
router.get('/author/create', author_controller.author_create_get);

// post create author
router.post('/author/create', author_controller.author_create_post);

// get delete author
router.get('/author/:id/delete', author_controller.author_delete_get);

// post delete author
router.post('/author/:id/delete', author_controller.author_delete_post);

// get update author
router.get('/author/:id/update', author_controller.author_update_get);

// post update author
router.post('/author/:id/update', author_controller.author_update_post);

// get request 1 author
router.get('/author/:id', author_controller.author_detail);

// get request all authors
router.get('/authors', author_controller.author_list);

/*
 *  AUTHOR ROUTES
 */

// get create genre
router.get('/genre/create', genre_controller.genre_create_get);

// post create genre
router.post('/genre/create', genre_controller.genre_create_post);

// get delete genre
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

// post delete genre
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

// get update genre
router.get('/genre/:id/update', genre_controller.genre_update_get);

// post update genre
router.post('/genre/:id/update', genre_controller.genre_update_post);

// get request 1 genre
router.get('/genre/:id', genre_controller.genre_detail);

// get request all genres
router.get('/genres', genre_controller.genre_list);

/*
 *  BOOKINSTANCE ROUTES
 */

// get create a bookinstance
router.get(
  '/bookinstance/create',
  book_instance_controller.bookinstance_create_get
);

// post create bookinstance
router.post(
  '/bookinstance/create',
  book_instance_controller.bookinstance_create_post
);

// get delete bookinstance
router.get(
  '/bookinstance/:id/delete',
  book_instance_controller.bookinstance_delete_get
);

// post delete bookinstance
router.post(
  '/bookinstance/:id/delete',
  book_instance_controller.bookinstance_delete_post
);

// get update bookinstance
router.get(
  '/bookinstance/:id/update',
  book_instance_controller.bookinstance_update_get
);

// post update bookinstance
router.post(
  '/bookinstance/:id/update',
  book_instance_controller.bookinstance_update_post
);

// get request 1 bookinstance
router.get('/bookinstance/:id', book_instance_controller.bookinstance_detail);

// get request all bookinstances
router.get('/bookinstances', book_instance_controller.bookinstance_list);

module.exports = router;

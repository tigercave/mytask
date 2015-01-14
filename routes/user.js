var express = require('express');
var conns = require('../model/connections');
var User = require('../model/user');

var router = express.Router();

// Get all users
router.get('/all', function(req, res) {
	User.getUsers(conns, 0, -1, function(err, users) {
		if (err) res.status(500).send(err);
		res.json(users);
	});
});

// get user with id
router.get('/:id', function(req, res) {
	User.getById(conns, req.params.id, function(err, user) {
		if (err) return res.send(404);
		res.json(user);
	});
});

// Delete user with id
router.delete('/:id', function(req, res) {
	User.getById(conns, req.params.id, function(err, obj) {
		if (err) return res.send(404);
		var task = new User(obj);
		task.remove(conns, function(err) {
			if (err) return res.status(500).send(err);
			res.send(204);
		});
	});
});

// create user - validate name required
router.post('/', function(req, res) {
	var data = req.body;

	// validate user submitted.
	if (!data.name) return res.status(402).send('Forbidden: name is required');
	var user = new User(data);
	
	user.save(conns, function(err, user) {
		if (err) return res.status(500).send(err);
		console.info('User added successfully.');
		res.status(201).json(user);
	});
});

module.exports = router;

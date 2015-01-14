var express = require('express');
var conns = require('../model/connections');
var Task = require('../model/task');
var User = require('../model/user');

var router = express.Router();

router.get('/all', function(req, res) {
	Task.getTasks(conns, 0, -1, function(err, tasks) {
		if (err) res.status(404).send(err);
		res.json(tasks);
	});
});

router.get('/:id', function(req, res) {
	var taskId = req.params.id;
	Task.getById(conns, taskId, function(err, task) {
		if (err) return res.status(404).send(err);
		res.json(task);
	});
});

router.delete('/:id', function(req, res) {
	Task.getById(conns, req.params.id, function(err, obj) {
		if (err) return res.status(404).send(err);
		var task = new Task(obj);
		task.remove(conns, function(err) {
			if (err) return res.status(500).send(err);
			res.send(204);
		});
	});
});

router.post('/', function(req, res) {
	var data = req.body;

	// validate task submitted.
	if (!data.title) return res.status(402).send('title is required');
	if (!data.user) return res.status(402).send('user is required');

	var task = new Task(data);
	console.log(task);
	// check user exists on system ?
	User.getById(conns, data.user, function(err, user) {
		if (err) return res.send(402).send('user does not exitst on system');

		// save task
		task.save(conns, function(err, task) {
			if (err) return res.status(500).send(err);
			res.status(201).json(task);
		});
	});
});

module.exports = router;

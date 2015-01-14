var Task = require('./task');
var conns = require('./connections');

var task = new Task({
	name: 'Nguyen Trong Cuong',
	pass: 'thanhlong',
	job: 'Developer'
});

// task.save(conns, function(err) {
// 	if (err) throw err;
// 	console.log("success");
// });

// Task.getById(conns, 'task:4', function(err, task) {
// 	console.log(task);
// 	process.exit(0);
// });
Task.getTasks(conns, 0, -1, function(errs, tasks) {
	console.log(tasks);
});


var Entity = require('./entity');

var Task = Entity.extend();

Task.prototype.sequence = "task:ids";
Task.prototype.id_prefix = "task:";
Task.prototype.list_name = "tasks";

// save task to db
Task.prototype.persist = function(conns, fn) {
	var task = this;
	task.parent.persist.call(task, conns, function(err, task) {
		if (err) return fn(err);
		// add task id to list 'user:id:tasks' on redis.
		if (task.user) {
			var listName = task.user + ':tasks';
			conns.redis.lpush(listName, task.id, function(err) {
				if (err) return fn(err);
				fn(null, task);
			});
		}
	});
};

Task.getTasks = function(conns, from, to, fn) {
	Entity.getEntities(conns, Task.prototype.list_name, from, to, fn);
};

Task.getTasksByUserId = function(conns, userId, from, to, fn) {
	// get list entity ids from redis server.
	var listName = userId + ':tasks';
	conns.redis.lrange(listName, from, to, function(err, taskIds) {
		if (err) return fn(err);

		// get documents from couchbase server with ids
		conns.couchbase.getMulti(taskIds, function(err, res) {
			if (err) return fn(err);
			var tasks = [];
			for (var index in res) {
				tasks.push(res[index].value);
			}
			fn(null, entities);
		});	
	});
};

module.exports = Task;
module.exports = Entity;

function Entity() {
}

/**
 * Public propeties
 */

Entity.prototype.sequence = "entity:ids";
Entity.prototype.id_prefix = "entity:";
Entity.prototype.list_name = "entities";

/**
 * Public method.
 */

// save document to db
Entity.prototype.save = function(conns,fn) {
	var entity = this;
	if (entity.id) { // check if entity already exists then update 
		entity.update(conns, fn);
	} else { // add new
		entity.persist(conns, fn);
	}
};

Entity.prototype.persist = function(conns, fn) {
	// create document key by increase one key on redis.
	conns.redis.incr(entity.sequence, function(err, id) { // increase sequense
		if (err) return fn(err);

		var entityId = entity.id_prefix + id;
		entity.id = entityId;
		// persist document on couchbase
		conns.couchbase.insert(entityId, entity, function(err, res) {
			if (err) return fn(err);

			// push document id to redis 'entities' list.
			conns.redis.lpush(entity.list_name, entityId, function(err) {
				if (err) return fn(err);
				fn(null, entity);	
			});
		});
	});
};

// update/merge document in db
Entity.prototype.update = function(conns, fn) {
	var entity = this;
	conn.couchbase.update(entity.id, entity, function(err, res) {
		if (err) return fn(err);
		fn();
	});
};

// remove entity from db
Entity.prototype.remove = function(conns, fn) {
	var entity = this;
	if (!entity.id) return fn(new Error('Unknown Entity id'));
	// remove document from couchbase
	conns.couchbase.remove(entity.id, function(err, res) {
		if (err) return fn(err);
		// remove document key in redis.
		conns.redis.lrem(entity.list_name, 0, entity.id, function(err) {
			console.log('Remove entity list_name: %s with id=%s and err=%s', entity.list_name, entity.id, err);
			if (err) return fn(err);
			fn();
		});
	});
};

/**
 * Static methods.
 */

// get entity by id
Entity.getById = function(conns, entityId, fn) {
	// get entity from couchbase server
	conns.couchbase.get(entityId, function(err, res) {
		if (err) return fn(err);
		fn(null, res.value);
	});
};

// Query entities from db
Entity.getEntities = function(conns, list_name, from, to, fn) {
	// get list entity ids from redis server.
	conns.redis.lrange(list_name, from, to, function(err, entityIds) {
		if (err) return fn(err);

		// get documents from couchbase server with ids
		conns.couchbase.getMulti(entityIds, function(err, res) {
			if (err) return fn(err);
			var entities = [];
			for (var index in res) {
				entities.push(res[index].value);
			}
			fn(null, entities);
		});	
	});
};

// create class that inherite Entity
Entity.extend = function() {
	var func = function(obj) {
		for (var index in obj) {
			this[index] = obj[index];
		}
	};

	func.prototype = new Entity();
	func.prototype.contructor = func;
	func.prototype.parent = Entity.prototype;

	for(var index in Entity) {
		if (index != 'extend') {
			func[index] = Entity[index];
		}
	}

	return func;
};
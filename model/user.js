var Entity = require('./entity');

var User = Entity.extend();

User.prototype.sequence = "user:ids";
User.prototype.id_prefix = "user:";
User.prototype.list_name = "users";

User.getUsers = function(conns, from, to, fn) {
	Entity.getEntities(conns, User.prototype.list_name, from, to, fn);
};

module.exports = User;
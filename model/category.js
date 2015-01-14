var Entity = require('./entity');

var Categories = Entity.extend();

Categories.prototype.sequence = "category:ids";
Categories.prototype.id_prefix = "category:";
Categories.prototype.list_name = "categories";

Categories.getTasks = function(conns, from, to, fn) {
	Entity.getEntities(conns, Categories.prototype.list_name, from, to, fn);
};

module.exports = Categories;
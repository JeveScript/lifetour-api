var config = require('./../config.js');
var knex = require('knex')(config.mysql);

class basicModel {
  constructor(props) {
    this.table = props;
  }

  knex() {
    return knex(this.table)
  }

  where(params) {
    return knex(this.table).where(params);
  }

  all() {
    return knex(this.table).select();
  }

  insert (params) {
    return knex(this.table).insert(params);
  }

  show(params) {
    return knex(this.table).where(params).select();
  }

  update(id,params) {
    return knex(this.table).where('id', '=', id).update(params);
  }

  sortDelete (id) {
    return knex(this.table).where('id', '=', id).update({ is_deleted: 1})
  }

  sortAll () {
    return knex(this.table).whereNull('is_deleted').select();
  }

  count(params, dateFilter={}) {
    if(dateFilter.column) {
      return knex(this.table).where(params)
        .whereBetween(dateFilter.column,[`${dateFilter.startAt} 00:00`, `${dateFilter.endAt} 23:59`])
        .count('id as total');
    }else{
      return knex(this.table).where(params).count('id as total');
    }
  }

  pagination (pageSize = 20, currentPage = 1, params={}, dateFilter={}) {
    let offset = (currentPage - 1) * pageSize;
    if(dateFilter.column) {
      return knex(this.table)
        .where(params)
        .offset(offset)
        .limit(pageSize)
        .whereBetween(dateFilter.column,[`${dateFilter.startAt} 00:00`, `${dateFilter.endAt} 23:59`])
        .select()

    }else{
      return knex(this.table)
        .where(params)
        .offset(offset)
        .limit(pageSize)
        .select()
    }
  }
}

module.exports = basicModel;

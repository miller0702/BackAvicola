const db = require('../config/configPg.js');

const Event = {};

Event.getAll = () => {
  const sql = 'SELECT * FROM events;';
  return db.manyOrNone(sql);
};

Event.findById = (id) => {
  const sql = 'SELECT * FROM events WHERE id=$1';
  return db.oneOrNone(sql, id);
};

Event.create = (event) => {
  const sql = `
    INSERT INTO events(title, description, start_date, end_date, created_at, updated_at)
    VALUES($1, $2, $3, $4, $5, $6) RETURNING id
  `;
  return db.oneOrNone(sql, [event.title, event.description, event.start_date, event.end_date, new Date(), new Date()]);
};

Event.update = (event) => {
  const sql = `
    UPDATE events
    SET title=$1, description=$2, start_date=$3, end_date=$4, updated_at=$5
    WHERE id=$6
  `;
  return db.none(sql, [event.title, event.description, event.start_date, event.end_date, new Date(), event.id]);
};

Event.delete = (id) => {
  const sql = 'DELETE FROM events WHERE id=$1';
  return db.none(sql, id);
};

module.exports = Event;

/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");

/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  set numGuests(val) {
    if (val < 1) throw new Error("Number of quest should be more 1");
    this._numGuests = val;
  }

  get numGuests() {
    return this._numGuests;
  }

  set customerId(val) {
    if (this._customerId !== undefined) {
      throw new Error("customer id cannot be changed");
    }
    this._customerId = val;
  }
  get customerId() {
    return this._customerId;
  }

  set startAt(val) {
    if (val instanceof Date && !isNaN(val)) {
      this._startAt = val;
    } else {
      throw Error("Date type required");
    }
  }

  get startAt() {
    return this._startAt;
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format("MMMM Do YYYY, h:mm a");
  }
  getFormattedNormal() {
    return moment(this.startAt).format("YYYY-MM-DD hh:mm a");
}

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
      [customerId]
    );

    return results.rows.map((row) => new Reservation(row));
  }
  static async getReservationByID(resId) {
    const results = await db.query(
      `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE id = $1`,
      [resId]
    );

    return new Reservation(results.rows[0]);
  }

  async save() {
    const result = await db.query(
      `INSERT INTO reservations (customer_id,start_at,num_guests,notes)
      VALUES ($1,$2,$3,$4) RETURNING id`,
      [this.customerId, this.startAt, this.numGuests, this.notes]
    );
    this.id = result.rows[0].id;
  }
}

module.exports = Reservation;

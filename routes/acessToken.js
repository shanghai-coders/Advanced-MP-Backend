const moment = require('moment');
const fs = require('fs');

class AccessToken {
  constructor(options = {
    filename: './cache.json',
    persistant: true
  }) {
    if (options.persistant === true && !options.filename) {
      console.error('Please provide a filename for the cache to work.');
      return;
    }

    this._data = {};
    this._fileName = options.filename;
    this._persistant = options.persistant;

    if (this._persistant === true) {
      try {
        this._data = JSON.parse(fs.readFileSync(this._fileName));
      } catch (e) {
        console.log(e);
      }
    }
  }

  query(key) {
    console.log('====================\ncache.query\n====================');
    if (!this._data[key]) {
      console.log('no access token found');
      return undefined;
    }

    const { expiration_date } = this._data[key];

    const now = moment();
    if (now.isBefore(expiration_date)) {
      console.log(`using cached token, expiration_date: ${expiration_date}`);
      return this._data[key].value;
    }
    console.log('access token expired');
    return undefined;
  }

  insert(key, value) {
    console.log('====================\ncache.insert\n====================');
    const data = {};
    data.value = value;

    const now = moment();
    data.expiration_date = now.add(7200, 's').toDate();

    this._data[key] = data;

    if (this._persistant === true) {
      fs.writeFileSync(this._fileName, JSON.stringify(this._data));
    }

    return value;
  }
}

module.exports = AccessToken;
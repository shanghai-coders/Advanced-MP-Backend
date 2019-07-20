// const db = require('./db.json');
const fs = require('fs');
const dbJSONPath = __dirname + '/db.json';

const getDB = () => {
    return JSON.parse(fs.readFileSync(dbJSONPath, 'utf8'));
};

const updateDB = (data) => {
    return fs.writeFileSync(dbJSONPath, JSON.stringify(data));
}

exports.getAll = (model) => {
    const db = getDB();
    if(db[model]) {
        return db[model];
    }
    return [];
}

exports.getById = (model, id) => {
    const db = getDB();
    if(db[model]) {
        
        const dataFound = db[model].filter((data) => String(data.id) === String(id));
        if(dataFound[0]) {
            return dataFound[0];
        }
    }
    return {};
}

exports.create = (model, data) => {
    const db = getDB();
    if(db[model]) {
        data.id = db[model].length + 1;
        db[model].push(data);
        
        updateDB(db);
    }
    return [];
}

exports.update = (model, id, data) => {
    const db = getDB();
    if(db[model]) {
        db[model].forEach((d) => {
            if(String(d.id) === String(id)) {
                if(data.id) {
                    delete data.id
                }
                d = Object.assign(d, data);
            }
        });
        updateDB(db);
    }
    return [];
}
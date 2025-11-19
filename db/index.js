// db/index.js – MongoDB Version with .env
require('dotenv').config();
const { MongoClient } = require("mongodb");

// Load connection string from environment variable
const uri = process.env.MONGODB_URI;

let db;
let collection;

// Connect to MongoDB (only once)
async function connectDB() {
  if (!db) {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db("NodeVaultDB");
    collection = db.collection("records");
    console.log(' Connected to MongoDB');
  }
}

// Add Record
async function addRecord({ name, value }) {
  await connectDB();
  const record = {
    id: Date.now(),
    name,
    value,
    createdAt: new Date()
  };
  await collection.insertOne(record);
  return record;
}

// List Records
async function listRecords() {
  await connectDB();
  return await collection.find().toArray();
}

// Update Record
async function updateRecord(id, name, value) {
  await connectDB();
  const result = await collection.updateOne(
    { id: id },
    { $set: { name, value } }
  );
  return result.modifiedCount > 0;
}

// Delete Record
async function deleteRecord(id) {
  await connectDB();
  const result = await collection.deleteOne({ id: id });
  return result.deletedCount > 0;
}

module.exports = {
  addRecord,
  listRecords,
  updateRecord,
  deleteRecord
};
/*const fileDB = require('./file');
const recordUtils = require('./record');
const vaultEvents = require('../events');

function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });
  const data = fileDB.readDB();
  const newRecord = { id: recordUtils.generateId(), name, value };
  data.push(newRecord);
  fileDB.writeDB(data);
  vaultEvents.emit('recordAdded', newRecord);
  return newRecord;
}

function listRecords() {
  return fileDB.readDB();
}

function updateRecord(id, newName, newValue) {
  const data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  record.name = newName;
  record.value = newValue;
  fileDB.writeDB(data);
  vaultEvents.emit('recordUpdated', record);
  return record;
}

function deleteRecord(id) {
  let data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  data = data.filter(r => r.id !== id);
  fileDB.writeDB(data);
  vaultEvents.emit('recordDeleted', record);
  return record;
}

module.exports = { addRecord, listRecords, updateRecord, deleteRecord };*/

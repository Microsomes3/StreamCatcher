const mongoose = require('mongoose');




const CronSchema = new mongoose.Schema({
  requestid: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  hour: {
    type: String,
    required: true
  },
  minute: {
    type: String,
    required: true,
    default: '00' // Add a default value to the minute field
  },
  created: {
    type: Date,
    default: Date.now
  }
});

const CronModel = mongoose.model('crons', CronSchema);

async function disconnect() {
  try {
    await mongoose.disconnect();
    console.log('disconnected');
  } catch (error) {
    console.log(error);
    throw error;
  }
}





async function addCronItem(requestid, date, hour, minute) {
  try {
    const newItem = new CronModel({ requestid, date, hour, minute });
    const result = await newItem.save();
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}


async function getAllItemsOnDateAndRequest(requestid, date) {
  console.log(date, requestid);
  try {
    const result = await CronModel.find({ requestid, date }).sort({ _id: 1 });
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}


module.exports = {
  addCronItem,
  getAllItemsOnDateAndRequest,
  disconnect,
  CronModel
};
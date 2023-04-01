const { deleteAllScheduledTasks } = require('./helpers/databaseHelper');




module.exports.handler = async (event) => {
    await deleteAllScheduledTasks();
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Success",
        }),
    }
}
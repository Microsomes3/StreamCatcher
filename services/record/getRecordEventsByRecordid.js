
const {
    getRecordEventByRecordId
} = require('./helpers/recordhelper')

module.exports.handler = async (event) => {

    const id = event.pathParameters.id;

    const events= await getRecordEventByRecordId({id:id})

    return {
        statusCode: 200,
        body: JSON.stringify({
            id: id,
            events:events
        }),
    }
}
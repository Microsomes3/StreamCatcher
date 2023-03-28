
const { getSocketConnections, sendSocketMessage } = require('./helpers/sendMessageToSocket')


module.exports.handler = async (event) => {

    const action = JSON.parse(event.body).action
    
    if(action !== "stop" && action !== "kill"){
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "Invalid action"
            })
        }
    }

    const id = event.pathParameters.id

    const details = await getSocketConnections(id)

    if(details!=null){
        await sendSocketMessage(details.connectionId,action)
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            action:action,
            id:id,
            details:details
        }),
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        }
    }
}
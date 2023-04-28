"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const recordHelper_1 = require("./helpers/recordHelper");
module.exports.handler = async (event) => {
    const id = event.pathParameters.id;
    const events = await (0, recordHelper_1.getRecordEventByRecordId)({ id: id });
    return {
        statusCode: 200,
        body: JSON.stringify({
            id: id,
            events: events
        }),
    };
};

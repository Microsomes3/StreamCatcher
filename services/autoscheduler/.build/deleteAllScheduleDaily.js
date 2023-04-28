"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databasehelperv2_1 = require("./helpers/databasehelperv2");
module.exports.handler = async (event) => {
    await (0, databasehelperv2_1.deleteAllScheduledTasks)();
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Success",
        }),
    };
};

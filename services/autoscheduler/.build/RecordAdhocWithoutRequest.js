"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: "Hello World"
        })
    };
};

function convertTimeoutTOMS(timeout) {

    //example input 60s or 60m or 60h

    const time = timeout.substring(0, timeout.length - 1);
    const unit = timeout.substring(timeout.length - 1);

    if (unit === "s") {
        return time * 1000;
    }

    if (unit === "m") {
        return time * 1000 * 60;
    }

    if (unit === "h") {
        return time * 1000 * 60 * 60;
    }

}


module.exports = {
    convertTimeoutTOMS
}
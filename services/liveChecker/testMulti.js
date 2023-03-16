const { checkMultiLive } = require("./helpers/checkLive")


module.exports.checkMultiLive= async (event)=>{

    const all = await checkMultiLive([
        "@griffingaming",
        "@LofiGirl",
        "@abaointokyo",
        "@WingsofRedemption",
        "@CreepsMcPasta"
    ])

    return {
        statusCode:200,
        body:JSON.stringify({
            message:"hello",
            all:all
        })
    }
}
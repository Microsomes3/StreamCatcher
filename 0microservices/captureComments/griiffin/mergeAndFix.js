

const fs = require("fs");


const allComments = {
    startTime: "",
    endTime:"",
    durationSeconds:0,
    durationHours:0,
    averageTimeBetweenComments:0,
    totalComments: 0,
    allComments:[],
    difference:[],
}


const c1 = JSON.parse(fs.readFileSync("comments3.json", "utf8")).allComments
const c1scrapetime = JSON.parse(fs.readFileSync("comments3.json", "utf8")).scrapeTime
const c2 = JSON.parse(fs.readFileSync("comments4.json", "utf8")).allComments
allComments.startTime = c1scrapetime;


//merge c1 and c2

for (let i = 0; i < c1.length; i++) {
    allComments.allComments.push(c1[i])
}

for (let i = 0; i < c2.length; i++) {
    allComments.allComments.push(c2[i])
}

//sort by curtime

allComments.allComments.sort((a, b) => {
    return a.curtime - b.curtime
})

allComments.totalComments = allComments.allComments.length

//endtime is last comment curtime

allComments.endTime = allComments.allComments[allComments.totalComments - 1].curtime

allComments.durationSeconds = allComments.endTime - allComments.startTime
allComments.durationHours = Math.ceil(allComments.durationSeconds / 3600)



const timeBetweenCommentsSeconds = []

for (let i = 0; i < allComments.totalComments - 1; i++) {
    timeBetweenCommentsSeconds.push({
        time: allComments.allComments[i + 1].curtime - allComments.allComments[i].curtime,
        currentComment: allComments.allComments[i].comment,
        nextComment: allComments.allComments[i + 1].comment,
    })
}

fs.writeFileSync("timeBetweenComments.json", JSON.stringify(timeBetweenCommentsSeconds, null, 2), "utf8")

const averageTimeBetweenComments = timeBetweenCommentsSeconds.reduce((a, b) => a + b, 0) / timeBetweenCommentsSeconds.length

console.log("averageTimeBetweenComments", averageTimeBetweenComments)

const totalSeonds = timeBetweenCommentsSeconds.reduce((a, b) => a + b, 0)

console.log("totalSeonds", totalSeonds)



allComments.averageTimeBetweenComments = averageTimeBetweenComments

allComments.difference = timeBetweenCommentsSeconds

fs.writeFileSync("allComments.json", JSON.stringify(allComments, null, 2), "utf8")


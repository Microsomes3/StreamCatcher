const aws = require('aws-sdk');
const bcrypt = require("bcryptjs");
const { Entity } = require("dynamodb-toolbox");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const User =  new Entity({
    name:"User",
    attributes:{
        pk: { partitionKey: true, type: "string"},
        sk: { sortKey: true, type: "string", hidden: true},
        id: { type: "string" },
        passwordHash: { type: "string" },
        createdAt: { type: "string" }
    },
    table: "userstable",
})

aws.config.update({
    region: "us-east-1",
});

const documentClient = new aws.DynamoDB.DocumentClient();

const createDbUser = async (props) => {
    const dbhash = await bcrypt.hash(props.password, 8);
    delete props.password;

    const params = {
        TableName: "userstable",
        Item: {
            ...props,
            balance:0,
            totalRequests:0,
            id: uuidv4(),
            passwordHash: dbhash,
            createdAt: new Date().toISOString(),
            type: "user",
        }
    }

    const result = await documentClient.put(params).promise();

    return result.$response;
};


const getUser = async (id) => {
    const params = {
        TableName: "userstable",
        Key: {
            pk: id,
            sk: "user",
        }
    }

    const result = await documentClient.get(params).promise();


    return User.parse(result.Item);
}


const signInUser = async (email,password)=>{
    const user =await getUser(email);

    if (!user) {
        throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);


    if(!isMatch){
        throw new Error("Password is incorrect");
    }
    
    if(isMatch){
        //token
        const token = jwt.sign({id:user.id,email:email},process.env.JWT_SECRET || "test",{
            expiresIn:"7 days"
        });

        return token;
    }


}


const getUserFromToken = async (token)=>{

    const secret = process.env.JWT_SECRET || "test";
    const decoded = jwt.verify(token.replace("Bearer ", ""),"eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY4MjcxMDE3NywiaWF0IjoxNjgyNzEwMTc3fQ.Ma_AytXHo_gb8AJpqQ6wb37YxpTGyc9MkmSgMJ1c8tg");

    return decoded;

}




module.exports = {
    createDbUser,
    getUser,
    signInUser,
    getUserFromToken
}
const jwt = require("jsonwebtoken");

function generateAuthResponse(principalId, effect, methodArn) {
    const policyDocument = generatePolicyDocument(effect, methodArn);
    return {
      principalId,
      policyDocument
    };
}

function generatePolicyDocument(effect, methodArn) {
    if (!effect || !methodArn) return null;

    const policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: methodArn
        }
      ]
    };

    return policyDocument;
}


module.exports.handler = (event, context, callback) => {
    console.log(event.authorizationToken);
    const token = event.authorizationToken.replace("Bearer ", "");
    const methodArn = event.methodArn;

     console.log(token, event);

     console.log(methodArn);

    if (!token) return callback(null, "Unauthorized");

    try{

    const secret = process.env.JWT_SECRET

    // // verifies token
    const decoded = jwt.verify(token, secret);
    


    if (decoded && decoded.id) {
      return callback(null, generateAuthResponse(decoded.id, "Allow", methodArn));
    } else {
      return callback(null, generateAuthResponse("00", "Deny", methodArn));
    }
}catch(e){
  console.log(e);
    return callback(null, generateAuthResponse("00", "Deny", methodArn));

}
  };
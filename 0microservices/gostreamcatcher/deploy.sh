echo $R2_ACCESS_KEY
echo $R2_SECRET_KEY

echo "is destroy? (y/n)"
read destroy

t=gorecordserver11

if [ $destroy = "y" ]; then
    aws cloudformation delete-stack --stack-name $t
    exit 0
fi

aws cloudformation create-stack --stack-name $t --template-body file://deploy.yml --parameters ParameterKey=R2AccessKey,ParameterValue=$R2_ACCESS_KEY ParameterKey=R2SecretKey,ParameterValue=$R2_SECRET_KEY --capabilities CAPABILITY_IAM


sleep 60
aws cloudformation describe-stacks --stack-name $t



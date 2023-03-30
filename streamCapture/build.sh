docker build -t streamcatcher .

aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/m8l7i2c5

docker tag streamcatcher:latest public.ecr.aws/m8l7i2c5/streamcatcher:latest

docker push public.ecr.aws/m8l7i2c5/streamcatcher:latest
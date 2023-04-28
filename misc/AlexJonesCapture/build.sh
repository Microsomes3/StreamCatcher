

docker build -t alexjonescatcher .
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/m8l7i2c5
docker tag alexjonescatcher:latest public.ecr.aws/m8l7i2c5/alexjonescatcher:latest
docker push public.ecr.aws/m8l7i2c5/alexjonescatcher:latest
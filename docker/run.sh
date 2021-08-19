docker build -t chatfrontimage .

docker stop chat-front

docker rm chat-front

docker run -it -d --name chat-front -p9998:80 chatfrontimage

docker exec -it chat-front bash

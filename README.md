apt update

apt install redis-server

edit /etc/redis/redis.conf

Search for supervised
Change no to systemd

sudo systemctl restart redis.service

sudo systemctl status redis

run application using 

node app.js

Now hit localhost:9000 from browser


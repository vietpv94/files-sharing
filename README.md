Files Sharing is a open source project that express how Distributed system things go!!!!!!! =))

# **INSTALLATION** #

## * Clone the repository##

```
#!git

git clone https://github.com/vietpv94/files-sharing.git NAME_WORK_SPACE
```
## * Install and configurate MongoDB ##

You must install mongoDB. follow the link below

https://docs.mongodb.com/manual/tutorial/install-mongodb-enterprise-on-ubuntu/

## * Install node.js  ##
We highly recommend that you use nvm to install a specific version of node.

Check out https://nodejs.org/en/download/package-manager/ to get more details
## * Install gulp globally ##

```
#!
npm install --global gulp-cli

```
## * Install the npm dependencies (as an administrator) ##

```
#!

npm install -g bower
```
## * Go into the project directory and install project dependencies (not as an administrator) ##

```
#!

npm install
```

## Start system ##

You need at least 2 machines installed webserver

Start webserver on each machine

* Install nginx on one of them then start config nginx to load blancing


```
#!shell

upstream node_servers {

    server ip_web1:3000;
    server ip_web2:3000 backup;
    keepalive 8;
}

server {
    listen 80;
    server_name localhost;
    location / {

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_redirect off;
        proxy_buffering off;
        proxy_pass http://node_servers;
    }
}

```

* start Nginx and access to port 80.

* Replica Set and data synchronous

* Set up mongodb on 3 machines, 1 primary(master), 2 secondary(slaves)

* start mongo by using this comand

```
#!shell

sudo mongod bind_ip ip_machine --port 27017 --dbpath /absolute/path/to/db --logpath /absolute/path/to/log logappend=true nojournal = true --replSet "james" --smallfiles --oplogSize 50
```

* on machine you chosen to be master, access to mongodb 
```
#!shell
mongo –host ip_of_the_machine

>rs.initiate()

>rs.add(“ip_of_secondary_node_1”)

>rs.add(“ip_of_secondary_node_2”)
```
* final access to slaves and access to mongodb


```
#!shell

>rs.slaveOK()
```

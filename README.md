Files Sharing is a open source project that express how Distributed system things go!!!!!!! =))

# **INSTALLATION...** #

1. Clone the repository

```
#!git

git clone https://viet_pham@bitbucket.org/sugoiiiteam/files-sharing.git NAME_WORK_SPACE
```
2. Install and configurate MongoDB

You must install mongoDB. We suggest you to use mongoDB version 2.6.5.
```
echo 'deb http://downloads-distro.mongodb.org/repo/debian-sysvinit dist 10gen' | tee /etc/apt/sources.list.d/mongodb.list
apt-get install -y mongodb-org=2.6.5 mongodb-org-server=2.6.5 mongodb-org-shell=2.6.5 mongodb-org-mongos=2.6.5 mongodb-org-tools=2.6.5
service mongod start
```
3. Install node.js 
We highly recommend that you use nvm to install a specific version of node.

Check out https://nodejs.org/en/download/package-manager/ to get more details
4. Install gulp globally

```
#!
npm install --global gulp-cli

```
5. Install the npm dependencies (as an administrator)

```
#!

npm install -g bower
```
6. Go into the project directory and install project dependencies (not as an administrator)


```
#!

npm install
```


 
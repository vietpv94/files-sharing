FROM node:6.5.0

WORKDIR /home/vietpham/schoolProjects/files-sharing/

RUN npm install -g gulp-cli
RUN npm install -g bower

ADD package.json /home/vietpham/schoolProjects/files-sharing/package.json
RUN npm install

ADD .bowerrc /home/vietpham/schoolProjects/files-sharing/.bowerrc
ADD bower.json /home/vietpham/schoolProjects/files-sharing/bower.json
RUN bower install --allow-root

ADD /docker/start.sh /home/vietpham/schoolProjects/files-sharing/start.sh

ADD . /home/vietpham/schoolProjects/files-sharing

EXPOSE 3000

CMD ["sh", "start.sh"]

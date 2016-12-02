#!/bin/bash

echo 'Starting Mongo'
docker run -p 27017:27017 -d --name db_dsp_docker mongo

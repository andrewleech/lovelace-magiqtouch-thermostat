#!/bin/bash
docker run -t --rm -v$(pwd):/repo -w/repo ludeeus/container:monster \
  bash -c 'npm install; npm run-script build'

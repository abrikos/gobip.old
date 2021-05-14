#!/bin/sh
git pull
npm run build
pm2 restart all
tail -f logs/server.log
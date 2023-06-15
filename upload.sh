#!/bin/bash

# Solutions to restart after server reboot
# 1. systemd configuration for this bot (might call run.sh)
# 2. crontab which periodically checks to see if the bot is running, and if not it starts it

rsync -av -e ssh --exclude='node_modules' --exclude='.env' ./* root@140.82.48.120:/root/bot-client/
ssh root@140.82.48.120 'echo hi ; cd bot-client && pkill -9 run.sh ; tmux new-session -d ./run.sh; echo bye'
# ssh root@140.82.48.120 systemctl restart bot
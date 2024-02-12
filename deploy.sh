#!/bin/bash

# Solutions to restart after server reboot
# 1. systemd configuration for this bot (might call run.sh)
# 2. crontab which periodically checks to see if the bot is running, and if not it starts it

rsync -av -e ssh --exclude='node_modules' --exclude='.env' ./* andrewhamacher@140.82.48.120:/var/projects/bot-client/

# ssh andrewhamacher@140.82.48.120 'cd /var/projects/bot-client && pkill -9 run.sh ; tmux new-session -d ./run.sh'
# ssh root@140.82.48.120 systemctl restart bot
#!/bin/bash
if [ "${TRAVIS_EVENT_TYPE}" == "cron" ]
  then
    echo "Starting translation sync"
    set -ev
    git checkout develop
    # update translations, and test any updated messages
    npm run translate
    npm run translate:update
    npm run test:messages
    # stage any changes in the msg directory
    git add ./msg
    git commit -m '[skip ci] Update translations from transifex'
    # add remote, make sure that API token doesn't end up in the log
    git remote add origin-translation https://${GH_TOKEN}@github.com/LLK/scratch-blocks.git > /dev/null 2>&1
    git push --set-upstream origin-translation develop
fi

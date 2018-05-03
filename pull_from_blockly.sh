#!/bin/bash

# Pull from Blockly into Scratch Blocks and do basic cleanup.
# Rachel Fenichel (fenichel@google.com)

BOLD='\e[1m'
NOBOLD='\e[21m'

# Formatting helper.
empty_lines() { printf '\n\n'; }
bold_echo() {
  echo -e "${BOLD}$1${NOBOLD}"
}

stop_on_fail() {
  # Fail if any command fails.
  set -e
  # Even if you're piping the output.
  set -o pipefail
}

# Undo the effects of start_failing.
continue_on_fail() {
  set +e
  set +o pipefail
}

# Prompt for y/n and put the result in $prompt_result
# The first argument specifies the text to use in the prompt.
# The second argument specifies which value to use if we're skipping prompts.
prompt() {
  if [ $with_prompts ]
    then
      if [ $2 = true ]
        then
          paren_text="(Y/n)"
      else
        paren_text="(y/N)"
      fi
      # Prompt the user and retry if they try any funny business.
      while true; do
        read -p "$1 $paren_text > " yn
        case $yn in
            [Yy]* ) prompt_result=true; break;;
            [Nn]* ) prompt_result=false; break;;
            * ) echo "Please answer yes or no.";;
        esac
      done
  else
    # Running without prompts.  Use the default value.
    prompt_result=$2;
  fi
}


# Ask the user for confirmation, then pull from Blockly's develop branch.
# The default is to do the pull.
pull_from_develop_fn() {
  empty_lines
  prompt "Do you want to pull from develop?" true
  if [ $prompt_result = false ]
    then
      bold_echo "You don't want to pull from develop.  Why are you running this script?"
      exit
  fi

  bold_echo "Pulling from Blockly's develop branch"
  sleep .5
  # This pull will likely fail with merge conflicts, but that's okay.
  # However, this means that we won't fail on errors other than merge conflicts.
  continue_on_fail
  git pull https://github.com/google/blockly.git develop
  stop_on_fail
}

# Ask the user for confirmation, then run cleanup.
# The default is to run cleanup.
run_cleanup_fn() {
  empty_lines
  prompt "Ready to run cleanup.sh.  Continue?" true
  if [ $prompt_result = false ]
    then
      bold_echo "Skipping cleanup.sh"
      prompt_for_merge_abort
      empty_lines
      bold_echo "Done"
      exit
  fi

  bold_echo "Running cleanup.sh"
  sleep .5
  # Cleanup.sh resolves common conflicts.
  ./cleanup.sh
}

# Ask the user for confirmation, then possibly abort the merge.
# The default is to *not* abort the merge.
# Used to clean up the repo instead of leaving it in a bad state.
prompt_for_merge_abort() {
  empty_lines
  prompt "Do you want to abort this merge?" false
  if [ $prompt_result = false ]
    then
      bold_echo "Continuing with merge..."
  else
    bold_echo "Running git merge --abort"
    git merge --abort
    display_status_fn
    bold_echo "Done"
    exit
  fi
}

# Ask the user for confirmation, then show the current repo status.
# The default to to show status.
display_status_fn() {
  empty_lines
  prompt "Do you want to display the current status?" true
  if [ $prompt_result = true ]
    then
      # Tell the user the current state.
      bold_echo "Current status"
      sleep .5
      git status
  else
    bold_echo "Skipping status display."
  fi
}

# Give the user one more chance to abort the merge, then tell them what their
# next steps should be.
finish_fn() {
  prompt_for_merge_abort
  bold_echo "Done.  You may need to manually resolve conflicts."
  # Helpful tips about what to do next.
  empty_lines
  sleep .5
  echo "Fix conflicts and run 'git commit'."
  echo "Use 'git add <file>' to mark resolution."
  echo "Use 'git merge --abort' to abort this merge."
}

# Check whether we're running with prompts.  If unset, we'll skip all prompts.
with_prompts=$1

# Here we go!
stop_on_fail
pull_from_develop_fn
run_cleanup_fn
display_status_fn
finish_fn

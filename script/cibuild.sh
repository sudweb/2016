#!/usr/bin/env bash
set -e # halt script on error

bundle exec htmlproof ./_site --href-ignore "#"

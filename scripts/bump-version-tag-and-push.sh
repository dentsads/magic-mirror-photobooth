#!/bin/bash

THIS_NAME="$(basename "${0}")"
THIS_PATH="$(readlink -e "${0}")"
THIS_DIR="$(dirname "${THIS_PATH}")"
DEST=${THIS_DIR}/../bin
DIR_ROOT="$(dirname "${THIS_DIR}")"

export PATH=$PATH:${DEST}

fnBumpVersion() {
	local newVersion="${1}"

	# change version in package.json
	npm version ${newVersion} --no-git-tag-version

	return $?
}

fnCommitChangeInGit() {
	local newVersion="${1}"

	# commit change
	git commit -a -m "[$newVersion] Bump version numbers"

	return $?
}

fnTagReleaseInGit() {
	local newVersion="$1"
	local tagMessage="$2"

	# tag release in git
	git tag -a $newVersion -m "$tagMessage"

	return $?
}

fnPushTagInGit() {
	local tagToPush="$1"

	# push tag in Git
	git push origin "$tagToPush"

	return $?
}

fnPushToOriginBranchWithTagsInGit() {
	local targetOriginBranch="$1"

	# push to target origin branch with tags in Git
	git push origin "$targetOriginBranch" --follow-tags

	return $?
}

fnUsage() {
	local msg="$1"

	if [ -n "$msg" ] ; then
		echo
		echo "$msg"
	fi

	fnExit 1 "Usage: ${THIS_NAME} <release-version>"
}

fnExit() {
	local exitVal="$1"
	local exitMsg="$2"

	## exit
	[ -z "$exitVal" ] && exitVal=1

	if [ -n "$exitMsg" ] ; then
		echo
		echo "$exitMsg"
		echo
	fi

	exit $exitVal
}

##
## CHECK PREREQUISITES
##

[ $# -lt 1 ] && fnUsage

command -v git >/dev/null 2>&1 || {
	fnExit 1 "ERROR: Git could not be found! You have to add the git executable to your system's PATH environment"
}

command -v npm >/dev/null 2>&1 || {
	fnExit 1 "ERROR: NPM could not be found! You have to add the npm executable to your system's PATH environment"
}

VERSION="$1"
CURRENT_BRANCH="$(git symbolic-ref --short HEAD)"

##
## CREATE RELEASE
##

fnBumpVersion "$VERSION" || fnExit 1 "ERROR: Failed to bump version!"

fnCommitChangeInGit "$VERSION" || fnExit 1 "ERROR: Failed to commit the bump change with Git"

fnTagReleaseInGit "$VERSION" "tagged for release" || fnExit 1 "ERROR: Failed to tag in Git. Are you sure this release wasn't created earlier already? You can roll back the last commit with 'git reset --hard HEAD~1'"

fnPushTagInGit "$VERSION" || fnExit 1 "ERROR: Failed to create tag in Git"

fnPushToOriginBranchWithTagsInGit "$CURRENT_BRANCH" || fnExit 1 "ERROR: Failed to push to origin branch in Git"

fnExit 0


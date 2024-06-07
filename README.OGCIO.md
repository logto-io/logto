[comment]: <> (This file has been added on OGCIO fork)

# LogTo per OGCIO

## Get started

If you want to run it locally, you just have to run
```
make build run
```

And, once the process ended, you're ready to open `http://localhost:3302` on your browser to navigate on your LogTo instance!

## Sync with main repository

To sync with the main repository, once a new version is released, follow the following steps:
- add the main repository remote, if it is not set in your git configuration, `git remote add upstream git@github.com:logto-io/logto.git`
- run `git fetch --tags upstream` to fetch all the tags from the main repository
- check if the tag you want to sync with exists `git tag -v YOUR_TAG`, e.g. `git tag -v v1.17.0`
- checkout a new branch, starting by `dev`, locally, naming it `feature/YOUR_TAG`, 
e.g. `git checkout dev && git pull && git checkout -b feature/v1.17.0`
- merge the main repository tag accepting incoming updates using `git merge YOUR_TAG --strategy-option theirs`, 
e.g. `git merge v1.17.0 --strategy-option theirs`
- given that across releases they do a lot of commits, you will probably have to resolve some conflicts, check what did you change since the last sync and fix them!
- run `pnpm run dev` from the root directory and check for errors. What I suggest to do is to open a GitHub page with the tag from the main repository you are syncing with, then one with the latest OGCIO `dev` branch and check for differences between them
- commit the changes with `git commit -a` to end the merge and let git write the correct message
- push and open your PR!

jira
====

jira api client CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/jira.svg)](https://npmjs.org/package/jira)
[![Downloads/week](https://img.shields.io/npm/dw/jira.svg)](https://npmjs.org/package/jira)
[![License](https://img.shields.io/npm/l/jira.svg)](https://github.com/script/jira/blob/master/package.json)

<!-- toc -->
* [Config](#config)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Config
1. Replace the variabled in .env-sample and rename it to .env
2. Fill and replace the config file in /src/config/project-config.sample.ts and rename it to .project-config.ts

# Usage
<!-- usage -->
```sh-session
$ npm install -g jira
$ jira COMMAND
running command...
$ jira (-v|--version|version)
jira/1.0.0 win32-x64 node-v10.14.1
$ jira --help [COMMAND]
USAGE
  $ jira COMMAND
...
```
<!-- usagestop -->

# Commands
<!-- commands -->
* [`jira add`](#jira-add)
* [`jira help [COMMAND]`](#jira-help-command)
* [`jira import`](#jira-import)
* [`jira list`](#jira-list)

## `jira add`

```
USAGE
  $ jira add
```

_See code: [src\commands\add.ts](https://github.com/script/jira/blob/v1.0.0/src\commands\add.ts)_

## `jira help [COMMAND]`

display help for jira

```
USAGE
  $ jira help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.1/src\commands\help.ts)_

## `jira import`

```
USAGE
  $ jira import

OPTIONS
  -d, --delimiter=delimiter                [default: ,] delimiter to split each field value with
  -f, --file=file                          (required) csv file path to import
  -h, --help                               show CLI help
  -n, --newLineDelimiter=newLineDelimiter  [default: \] field value new line delimiter
  -r, --rowDelimiter=rowDelimiter          [default: ,] csv fields delimiter
```

_See code: [src\commands\import.ts](https://github.com/script/jira/blob/v1.0.0/src\commands\import.ts)_

## `jira list`

```
USAGE
  $ jira list
```

_See code: [src\commands\list.ts](https://github.com/script/jira/blob/v1.0.0/src\commands\list.ts)_
<!-- commandsstop -->

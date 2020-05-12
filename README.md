jira
====

jira api client CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/jira.svg)](https://npmjs.org/package/jira)
[![Downloads/week](https://img.shields.io/npm/dw/jira.svg)](https://npmjs.org/package/jira)
[![License](https://img.shields.io/npm/l/jira.svg)](https://github.com/script/jira/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
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
```sh-session
$ npm install -g jira
$ jira COMMAND
running command...
$ jira (-v|--version|version)
jira/3.0.0 win32-x64 node-v8.2.1
$ jira --help [COMMAND]
USAGE
  $ jira COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`jira help [COMMAND]`](#jira-help-command)
* [`jira import`](#jira-import)
* [`jira jira-command`](#jira-jira-command)
* [`jira task`](#jira-task)

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

import tasks from csv

```
USAGE
  $ jira import

OPTIONS
  -d, --delimiter=delimiter        [default: ;] inside field value delimiter
  -f, --file=file                  (required) csv file path to import
  -h, --help                       show CLI help
  -r, --rowDelimiter=rowDelimiter  [default: ,] csv fields delimiter
```

_See code: [src\commands\import.ts](https://github.com/script/jira/blob/v1.0.0/src\commands\import.ts)_

## `jira jira-command`

```
USAGE
  $ jira jira-command

OPTIONS
  -b, --boardIndex=boardIndex  (required)
```

_See code: [src\commands\jira-command.ts](https://github.com/script/jira/blob/v1.0.0/src\commands\jira-command.ts)_

## `jira task`

task creation

```
USAGE
  $ jira task

OPTIONS
  -a, --assignee=assignee        [default: 8] task assignee
  -b, --backend                  includes backend
  -c, --component=component      component name

  -d, --description=description  [default: h2. TODO,* See subtasks] task description (lines are splitted using the
                                 delimiter flag)

  -e, --epic=epic                epic key

  -f, --frontend                 includes frontend

  -h, --help                     show CLI help

  -l, --delimiter=delimiter      [default: ,] delimiter to split with

  -o, --automation               includes UATs

  -r, --requirements             includes requirements

  -s, --summary=summary          (required) task summary

  -t, --tests                    includes SDT tests update

  -v, --versions=versions        [default: 1.2.0] version

DESCRIPTION
  People flag description
  0 => Samuel Ferreira 
  ,1 => Andre Veiga 
  ,2 => Joana Dias 
  ,3 => David Nascimento 
  ,4 => Nuno Rodrigues 
  ,5 => David Morais 
  ,6 => Pedro Rainho 
  ,7 => Victor Pinheiro 
  ,8 => Nuno Campelo 
  ,9 => Miguel Oliveira 
  ,10 => Telmo Francisco 
  ,11 => Thales Santos 
  ,12 => Josenildo Neves 
  ,13 => David Raposo 
  ,14 => Ivone Leite 
  ,15 => Diogo Prata
```

_See code: [src\commands\task.ts](https://github.com/script/jira/blob/v1.0.0/src\commands\task.ts)_
<!-- commandsstop -->
* [`jira comment`](#jira-comment)
* [`jira fix SPRINT`](#jira-fix-sprint)
* [`jira help [COMMAND]`](#jira-help-command)
* [`jira import`](#jira-import)
* [`jira list`](#jira-list)
* [`jira logs [FILE]`](#jira-logs-file)
* [`jira move SPRINT`](#jira-move-sprint)
* [`jira prog`](#jira-prog)
* [`jira snap`](#jira-snap)
* [`jira task`](#jira-task)

## `jira comment`

manage comments

```
USAGE
  $ jira comment

OPTIONS
  -h, --help         show CLI help
  -i, --issue=issue  (required) issue number
  -t, --text=text    (required) text
```

_See code: [src\commands\comment.ts](https://github.com/script/jira/blob/v3.0.0/src\commands\comment.ts)_

## `jira fix SPRINT`

fix tasks in an inconsistent state

```
USAGE
  $ jira fix SPRINT

OPTIONS
  -h, --help  show CLI help
```

_See code: [src\commands\fix.ts](https://github.com/script/jira/blob/v3.0.0/src\commands\fix.ts)_

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

import tasks from csv

```
USAGE
  $ jira import

OPTIONS
  -d, --delimiter=delimiter        [default: ,] field delimiter
  -f, --file=file                  (required) csv file path to import
  -h, --help                       show CLI help
  -r, --rowDelimiter=rowDelimiter  [default: ;] csv row delimiter
```

_See code: [src\commands\import.ts](https://github.com/script/jira/blob/v3.0.0/src\commands\import.ts)_

## `jira list`

search for issues by filters

```
USAGE
  $ jira list

OPTIONS
  -a, --all               not only open sprints
  -h, --help              show CLI help
  -p, --people=people     assignee
  -s, --status=0|1|2|3|4  task status
  -w, --work=work         sprint name

DESCRIPTION
  People flag description
  0 => Samuel Ferreira 
  ,1 => Andre Veiga 
  ,2 => Joana Dias 
  ,3 => David Nascimento 
  ,4 => Nuno Rodrigues 
  ,5 => David Morais 
  ,6 => Pedro Rainho 
  ,7 => Victor Pinheiro 
  ,8 => Nuno Campelo 
  ,9 => Miguel Oliveira 
  ,10 => Telmo Francisco 
  ,11 => Thales Santos 
  ,12 => Josenildo Neves 
  ,13 => David Raposo 
  ,14 => Ivone Leite 
  ,15 => Diogo Prata 

  Status flag description
  0 => StartedWork 
  ,1 => Solved 
  ,2 => Verified 
  ,3 => Closed 
  ,4 => Rejected
```

_See code: [src\commands\list.ts](https://github.com/script/jira/blob/v3.0.0/src\commands\list.ts)_

## `jira logs [FILE]`

logged team hours

```
USAGE
  $ jira logs [FILE]

OPTIONS
  -b, --begin=begin       (required) [default: 6] number of days ago to begin (max 6 days)
  -h, --help              show CLI help
  -p, --people=people     assignees
  -s, --status=0|1|2|3|4  task status
  -w, --weekend           include weekend days

DESCRIPTION
  People flag description
  0 => Samuel Ferreira 
  ,1 => Andre Veiga 
  ,2 => Joana Dias 
  ,3 => David Nascimento 
  ,4 => Nuno Rodrigues 
  ,5 => David Morais 
  ,6 => Pedro Rainho 
  ,7 => Victor Pinheiro 
  ,8 => Nuno Campelo 
  ,9 => Miguel Oliveira 
  ,10 => Telmo Francisco 
  ,11 => Thales Santos 
  ,12 => Josenildo Neves 
  ,13 => David Raposo 
  ,14 => Ivone Leite 
  ,15 => Diogo Prata 

  Status flag description
  0 => StartedWork 
  ,1 => Solved 
  ,2 => Verified 
  ,3 => Closed 
  ,4 => Rejected
```

_See code: [src\commands\logs.ts](https://github.com/script/jira/blob/v3.0.0/src\commands\logs.ts)_

## `jira move SPRINT`

move issues from one sprint to another

```
USAGE
  $ jira move SPRINT

OPTIONS
  -h, --help  show CLI help
```

_See code: [src\commands\move.ts](https://github.com/script/jira/blob/v3.0.0/src\commands\move.ts)_

## `jira prog`

describe team's current work

```
USAGE
  $ jira prog

OPTIONS
  -h, --help           show CLI help
  -p, --people=people  assignees

DESCRIPTION
  People flag description
  0 => Samuel Ferreira 
  ,1 => Andre Veiga 
  ,2 => Joana Dias 
  ,3 => David Nascimento 
  ,4 => Nuno Rodrigues 
  ,5 => David Morais 
  ,6 => Pedro Rainho 
  ,7 => Victor Pinheiro 
  ,8 => Nuno Campelo 
  ,9 => Miguel Oliveira 
  ,10 => Telmo Francisco 
  ,11 => Thales Santos 
  ,12 => Josenildo Neves 
  ,13 => David Raposo 
  ,14 => Ivone Leite 
  ,15 => Diogo Prata
```

_See code: [src\commands\prog.ts](https://github.com/script/jira/blob/v3.0.0/src\commands\prog.ts)_

## `jira snap`

sprint snapshot

```
USAGE
  $ jira snap

OPTIONS
  -f, --future               include future sprints
  -h, --help                 show CLI help
  -p, --people=people        assignees
  -r, --remaining=remaining  (required) remaining available sprint time (in hours)
  -w, --work=work            sprint name

DESCRIPTION
  People flag description
  0 => Samuel Ferreira 
  ,1 => Andre Veiga 
  ,2 => Joana Dias 
  ,3 => David Nascimento 
  ,4 => Nuno Rodrigues 
  ,5 => David Morais 
  ,6 => Pedro Rainho 
  ,7 => Victor Pinheiro 
  ,8 => Nuno Campelo 
  ,9 => Miguel Oliveira 
  ,10 => Telmo Francisco 
  ,11 => Thales Santos 
  ,12 => Josenildo Neves 
  ,13 => David Raposo 
  ,14 => Ivone Leite 
  ,15 => Diogo Prata
```

_See code: [src\commands\snap.ts](https://github.com/script/jira/blob/v3.0.0/src\commands\snap.ts)_

## `jira task`

task creation

```
USAGE
  $ jira task

OPTIONS
  -a, --assignee=assignee        [default: 8] task assignee
  -b, --backend                  includes backend
  -c, --component=component      component name
  -d, --description=description  [default: h2. TODO,* See subtasks] task description
  -e, --epic=epic                epic key
  -f, --frontend                 includes frontend
  -h, --help                     show CLI help
  -l, --delimiter=delimiter      [default: ,] delimiter to split with
  -o, --automation               includes UATs
  -r, --requirements             includes requirements
  -s, --summary=summary          (required) task summary
  -t, --tests                    includes SDT tests update
  -v, --versions=versions        [default: 1.2.0] version

DESCRIPTION
  People flag description
  0 => Samuel Ferreira 
  ,1 => Andre Veiga 
  ,2 => Joana Dias 
  ,3 => David Nascimento 
  ,4 => Nuno Rodrigues 
  ,5 => David Morais 
  ,6 => Pedro Rainho 
  ,7 => Victor Pinheiro 
  ,8 => Nuno Campelo 
  ,9 => Miguel Oliveira 
  ,10 => Telmo Francisco 
  ,11 => Thales Santos 
  ,12 => Josenildo Neves 
  ,13 => David Raposo 
  ,14 => Ivone Leite 
  ,15 => Diogo Prata
```

_See code: [src\commands\task.ts](https://github.com/script/jira/blob/v3.0.0/src\commands\task.ts)_
<!-- commandsstop -->

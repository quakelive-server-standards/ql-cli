# Quake Live decidacted server Rcon client

This is a client for the Quake Live dedicated server rcon and stats services. You can either connect to one of them or to both of them at the same time.

## Install

Clone this Git repository. Nothing more is needed. The compiled JavaScript file and `node_modules` directory are included for your convenience.

## Usage

If you want to connect to rcon, specify the rcon port and the rcon password if needed. If you want to connect to stats, specify the stats port and the stats password if needed. If you want to connect to both, specify both.

```sh
./ql.sh 127.0.0.1 --rcon-port 28960 --rcon-password rconadmin --stats-port 27960 --stats-password statsadmin
```
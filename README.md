# Project Title

Api Teste Símios - Mercado Livre - Sergio Mufalo Jr <sergiojrm02@gmail.com>

---
## Requirements

For development, you will only need Node.js a node global package (NPM) and database MySQL

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt update
      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v12.12.0

    $ npm --version
    6.11.3

---

### MySQL

- #### MySQL installation on Windows
    Just go on [official MySQL website](https://dev.mysql.com/downloads/installer/) and download the installer.

- #### Node installation on Ubuntu

  Install the MySQL server by using the Ubuntu operating system package manager, just run the following commands.

      $ sudo apt update
      $ sudo apt-get install mysql-server
---

## Install Project

    $ git clone   https://github.com/sergiojrm02/teste-mercado-livre.git PROJECT_TITLE
    $ cd PROJECT_TITLE
    $ npm install

## Configure app

Open `PROJECT_TITLE/index.js` then edit it with your settings. You will need:

Config variable DB:

- HOST_DB
- USER_DB
- PASS_DB
- NAME_DB
- PORT_DB

Config variable Server:

- PORT
- HOST

## Running the project

    $ npm start

## Running tests

    $ npm test
    
## SQL - Script MySQL

```sql
/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`node_db` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `node_db`;

/*Table structure for table `simio` */

DROP TABLE IF EXISTS `simio`;

CREATE TABLE `simio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `simio` text CHARACTER SET latin1,
  `issimio` tinyint(1) unsigned DEFAULT '0',
  `post` text,
  `hash` varchar(255) CHARACTER SET latin1 DEFAULT '',
  `created_dt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_dt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
```

## Test [Postman](https://www.postman.com/downloads/)
   ###Routes

    [GET]   localhost:8080/stats
    [POST]  localhost:8080/simian
    
   ###Schema Postman

```json
{
	"info": {
		"_postman_id": "7014582c-f948-4046-acc2-283931d0d68f",
		"name": "Projetos",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
	},
	"item": [
		{
			"name": "Teste ML Simios",
			"item": [
				{
					"name": "localhost:8080/stats",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "localhost:8080/stats",
							"host": [
								"localhost"
							],
							"port": "8080",
							"path": [
								"stats"
							]
						}
					},
					"response": []
				},
				{
					"name": "localhost:8080/simian",
					"request": {
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"dna\": [\n        \"ATGAAT\",\n        \"CAGTGT\",\n        \"TTATGT\",\n        \"AGCCGT\",\n        \"AGACGT\",\n        \"AGATTT\"\n    ]\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "localhost:8080/simian",
							"host": [
								"localhost"
							],
							"port": "8080",
							"path": [
								"simian"
							]
						}
					},
					"response": []
				}
			],
			"protocolProfileBehavior": {}
		}
	],
	"protocolProfileBehavior": {}
} 
``` 
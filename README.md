# Hestia

Hestia, is a system for aggregating and displaying data for rental places.

</br>

# Architecture overview

![](https://i.ibb.co/5rPHR1N/architecture-Diagram.png)

</br>

# Install

There are various ways of installing Hestia.

## Docker

We provide a docker-compose file to speed up your deployment. 

You can launch it with

```
docker-compose up -d
```

The frontend will now be available at http://localhost:3000, and the api at http://localhost:8000.

## Building from source

To build Hestia from source code, You need:
* python [version 3.6 or greater](https://www.python.org/).
* npm [version 5.6 or greater](https://www.npmjs.com/).
* node [version 14 or greater](https://nodejs.org/).
* mongodb [version 5 or greater](https://www.mongodb.com/).

_Note: While older versions may work. They have not been tested and are not recommended._

The python dependencies can be found in [/api/requirements.txt](/api/requirements.txt).

The npm dependencies can be found in [frontend/package.json](/frontend/package.json) folder.

Upload [database/properties_cleaned.json](database/properties_cleaned.json) to the mongodb database.

Building from source is not recommended outside of development purposes.

</br>

# Configuration

## Different database

Hestia comes with the scraped data of 2019 by default. If you want to use updated data you can run
```
python preprocessing.py --input <FILE>
```
from the [database](database) directory, to update [database/properties_cleaned.json](database/properties_cleaned.json). You can then start up the application. Or if you already have an instance of mongodb. Run the following when the container is up:
```
docker exec -it webeng-mongo bash docker-entrypoint-initdb.d/init.sh
```

</br>

## TLS

HTTPS is not currently builtin to Hestia. We recommend running a proxy for SSL-termination in front of Hestia if encrypted traffic is a requirement.

</br>

# Documentation

- API endpoint documentation: http://localhost:8000/redoc

</br>

# Roadmap
- More freedom in deployment from source code
  - Run server from python application rather than python application from server
  - Specify port as command line flag
- Only load properties in the coordinate grid on screen on the map
- NGINX docker image for encrypted traffic in the docker network
- Let user specify logging level

</br>

# Contributions

Refer to [CONTRIBUTIONS.md](CONTRIBUTIONS.md)

</br>

# License

GNU General Public License v3.0, see [LICENSE](https://github.com/WebEng-RUG/2021-Group41/blob/main/LICENSE).

# PoS system for Software design course

## Prerequisites

- Java 21+
- PostgreSQL 15+ (Either installed locally or via Docker)

## Starting the Application

Start a postgres instance. The script "run-postgres.sh" can be used to start
a postgres instance using Docker.

### If using the provided script

Create a .env file (can be copied from .env.sample) to configure
the database connection.  By running ./run-postgres.sh --startdb a docker
instance with postgres will be started.  ./run-postgres.sh --stopdb will
stop the instance.

### Building and Running

The application can be built and started by running ./mvnw spring-boot:run
in the project root directory.

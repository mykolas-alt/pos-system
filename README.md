# PoS system for Software design course

## Prerequisites

- Java 21+
- PostgreSQL 15+ (Either installed locally or via Docker)

## Starting the Application

Start a postgres instance.

### If using the provided script

The script "run-postgres.sh" can be used to start a postgres instance
using Docker.

Before using the script create a .env file (can be copied from .env.sample)
to configure the database connection.  By running ./run-postgres.sh --startdb
a docker instance with postgres will be started.  ./run-postgres.sh --stopdb
will stop the instance.

### Building and Running

In a linux environment, the application can be built and started by running
./mvnw spring-boot:run in the project root directory.

If starting the application in a Windows environment, use mvnw.cmd instead
of ./mvnw.

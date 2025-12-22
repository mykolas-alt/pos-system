# PoS system for Software design course
## Requirements
- Java 21+
- PostgreSQL 15+ (Either installed locally or via Docker)
- Node.js
- Vite

## Building and launching
### Repository Location
There is two ways to download repository that application would run properly.

**First method (Linux & Windows):**
Clone repository to Linux environment. There will be made all work.
- **Windows:** Use **WSL** and place repository inside it. If you place repo in windows environment using **WSL** then it won't work.
- **Linux:** Place repo anywhere.

**Secont method (Windows only):**
For this method you need to use both Windows and WSL. In both WSL and Windows make clone of repo, but on **WSL** repo is needed only to launch PostgreSQL database.

### PostgreSQL Database
To create and launch database could be used **provided script "run-postgres.sh"** inside **/backend** folder and **Docker**. 
Might need to run command do delete return symbol : **sed -i 's/\r$//' run-postgres.sh**

**Before** using the script create **.env** file to configure the database connection. **Sample** file **".env.sample"** could be found in **/backend** folder.

**How to use script:**
- **Command "./run-postgres.sh --startdb"** will start **Docker instance** with **PostgreSQL**.
- **Command "./run-postgres.sh --stopdb"** will stop **Docker instance**.

### Java Backend
To **build and launch** backend go to **/backend** folder and use command.

**Depending** on the environment that is used command will have slight changes:
- **Windows:** ./mvnw.cmd spring-boot:run
- **Linux:** ./mvnw spring-boot:run

To **stop** backend use key combination **CTRL + C**

### React Frontend
To **build and launch** frontend go to **/frontend** folder. If you try to launch it for the first time then use command "npm install" to install all dependencies needed. Use command "npm run dev" to start React frontend. To **stop** frontend use key combination **CTRL + C**

Frontend will start on this link: **localhost:5173**
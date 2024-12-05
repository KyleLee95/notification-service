# Notification Service

## Quick start

Clone the repo and then run the following:

### Building the Project

```bash
cd path/to/this/repo

npm install # or pnpm install

npm run dev # to start in dev mode

npm run start # to start the server in production mode
```

The server should start on `localhost:4001`.

**To build in a docker container run the following command from the root
directory of this repository:**

```bash

# without docker compose
docker build -t notification-service:latest .
docker run -p 4001:4001 notification-service:latest .

# with docker compose
docker compose up --build
```

The docker compose command will build this project _AND_ containers it depends
on (_rabbitmq_)

You'll also want to **seed the database** with some test data.
Do this by running `npm run seed` in the **root** directory of this repository.

### Setting Environment Variables

You'll also need to set the environment variables in a `.env` file in the root directory.
You can check the `.env.example` file for a list of environment variables. Of
note, you'll need:

```bash
export PORT=4001
export ADMIN_USERID="c1bba5c0-b001-7085-7a2e-e74d5399c3d1" # this is just a placeholder ID that has been used for testing. It's simply a aws cognito user uuid

#these are generated for the aws organization.
export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY_ID=

# set to the region you're running your AWS services in
export AWS_REGION="us-east-2"
export AWS_COGNITO_USERPOOL_ID="" # based on aws cognito credentials

export SENDER_EMAIL="" # based on verified SES email

# the name of the rabbitmq docker container, assuming you're running this in the
# docker network
export RABBITMQ_HOST="rabbitmq"
```

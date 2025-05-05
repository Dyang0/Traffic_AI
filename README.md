# Developer's Manual

*Access training/prediction data through the "new-project-data" zip

## Opening Terminals
A new terminal must be opened when running each framework: MongoDB, FastAPI, and Next.js.

To access the "add admin user page", you need a root admin user. To add a root admin user, follow the steps under [Adding an Admin User](#adding-an-admin-user).

## Setting Up MongoDB

Execute the following command in the MongoDB directory:

```bash
mkdir -p data/db
```

## Setting Up FastAPI

1. Navigate to the FastAPI directory:

    ```bash
    cd FastAPI
    ```

2. Create a virtual environment:
    - **For Mac:**
        ```bash
        python3.10 -m venv venv
        ```
    - **For Windows:**
        ```bash
        python -m venv ./venv
        ```

3. Activate the virtual environment:
    - **For Mac:**
        ```bash
        source ./venv/bin/activate
        ```
    - **For Windows:**
        ```bash
        ./venv/Scripts/Activate.ps1
        ```

4. Install required dependencies:

    ```bash
    pip3 install -r requirements.txt
    ```

## Setting Up Next.js

Ensure you are in the `traffic-ai` root directory, then install dependencies:

```bash
npm install
```

## Running Next.js

Start the frontend website with:

```bash
npm run dev
```

## Running MongoDB

Ensure you are in the MongoDB directory:

```bash
cd MongoDB
```

Then start it with:

```bash
docker compose up
```

## Running FastAPI

Start the FastAPI server with:

```bash
uvicorn app:app --reload
```

## Adding an Admin User

1. Navigate to the MongoDB directory:

    ```bash
    cd MongoDB
    ```

2. Check running containers:

    ```bash
    docker ps
    ```

3. Access the MongoDB shell:

    ```bash
    docker exec -it mongodb mongosh
    ```
    *(The container name "mongodb" may differ based on the output of `docker ps`.)*

4. List databases:

    ```bash
    show dbs
    ```

5. Switch to the `trafficai` database:

    ```bash
    use trafficai
    ```

6. List collections:

    ```bash
    show collections
    ```

7. View users:

    ```bash
    db.users.find()
    ```

8. Update a user's role to admin:

    ```bash
    db.users.updateOne({username:"yourUsername"}, {$set: {role:"admin"}});
    ```

    **Example:**

    ```bash
    db.users.updateOne({username:"dyang"}, {$set:{role:"admin"}});
    ```

## Accessing the Website

Once all three frameworks are running, access the website at:

```
http://localhost:3000
```
**Troublshooting**
- If Next.js is outdated, run the following command in the root directory to update the packages:
- npm i next@latest (https://nextjs.org/docs/messages/version-staleness)

![image](https://github.com/user-attachments/assets/12037ae8-9527-466b-9b5b-844143fa6157)
- Error has been fixed

Running the python notebook
- python3.11 -m jupyter notebook [python notebook]

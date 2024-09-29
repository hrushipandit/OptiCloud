from pymongo import MongoClient
from urllib.parse import quote_plus


def get_database():
    # Connect to your MongoDB server
    username = 'user1'
    password = quote_plus('user1@OptiCloud')
    cluster_dns = 'cluster0.mg0hq.mongodb.net'
    db_name = 'OptiCloud_DB'  # specify your database name here

    connection_uri = f"mongodb+srv://{username}:{password}@{cluster_dns}/{db_name}?retryWrites=true&w=majority&appName=Cluster0"

    client = MongoClient(connection_uri)
    db = client[db_name]
    return db


def insert_user_data(user_data):
    db = get_database()  # Assuming get_database() gives the correct DB connection
    collection = db['test_collection']  # A specific collection for users
    
    # Check if the user already exists by a unique field, e.g., 'email'
    existing_user = collection.find_one({"email": user_data.get("email")})
    
    if existing_user:
        # If the user exists, return the existing user's ObjectId
        return existing_user["_id"]
    else:
        # If the user does not exist, insert the new user data
        result = collection.insert_one(user_data)
        return result.inserted_id  # Return the ObjectId of the inserted document


# def insert_data():
#     db = get_database()
#     collection = db['test_collection']
#     # Inserting a new document into the collection
#     collection.insert_one({'name': 'John Doe', 'age': 30})
#     return "Data inserted"

# def get_data():
#     db = get_database()
#     collection = db['test_collection']
#     # Retrieving a document from the collection
#     data = collection.find_one({'name': 'John Doe'})
#     return data

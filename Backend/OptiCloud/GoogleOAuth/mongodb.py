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
    db = get_database()
    collection = db['test_collection']  # A specific collection for users
    result = collection.insert_one(user_data)  # Insert user data into MongoDB
    return result.inserted_id  # Return the ObjectId of the inserted document

def insert_data():
    db = get_database()
    collection = db['test_collection']
    # Inserting a new document into the collection
    collection.insert_one({'name': 'John Doe', 'age': 30})
    return "Data inserted"

def get_data():
    db = get_database()
    collection = db['test_collection']
    # Retrieving a document from the collection
    data = collection.find_one({'name': 'John Doe'})
    return data

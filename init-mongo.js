// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('africapharmacy');

// Create a user for the application
db.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [
    {
      role: 'readWrite',
      db: 'africapharmacy'
    }
  ]
});

// Create initial collections if needed
db.createCollection('users');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('categories');

print('MongoDB initialization completed');
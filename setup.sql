DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS profiles;

CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      first VARCHAR(255) NOT NULL,
      last VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

  CREATE TABLE signatures(
      id SERIAL PRIMARY KEY,
      -- get rid of first and last!
      signImg TEXT NOT NULL,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

 CREATE TABLE profiles(
      id SERIAL PRIMARY KEY,
      age INTEGER, 
      city VARCHAR(255), 
      url VARCHAR(255), 
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );


INSERT INTO profiles (age, city, url, user_id) 
VALUES ('33', '', '', '1');


INSERT INTO users (first, last, email, password) 
VALUES ('Yuliya', 'Vasenina', 'a@a.com', '123');




INSERT INTO signatures (signImg, user_id) 
VALUES ('smth', '1');

SELECT password FROM users WHERE email = 'a@a.com';

SELECT * FROM users;

SELECT * FROM signatures;

SELECT COUNT(first) FROM users;

SELECT signImg FROM signatures WHERE id = 1;




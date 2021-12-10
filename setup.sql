DROP TABLE IF EXISTS signatures;

   CREATE TABLE signatures (
       id SERIAL PRIMARY KEY,
       first VARCHAR NOT NULL CHECK (first != ''),
       last VARCHAR NOT NULL CHECK (last != ''),
       signId VARCHAR NOT NULL CHECK (signId != '')
   );


INSERT INTO signatures (first, last, signId) 
VALUES ('Yuliya', 'Vasenina', 'smth');




SELECT * FROM signatures;

SELECT COUNT(first) FROM signatures;




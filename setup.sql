DROP TABLE IF EXISTS signatures;

   CREATE TABLE signatures (
       id SERIAL PRIMARY KEY,
       first VARCHAR NOT NULL CHECK (first != ''),
       last VARCHAR NOT NULL CHECK (last != ''),
       signImg VARCHAR NOT NULL CHECK (signImg != '')
   );


INSERT INTO signatures (first, last, signImg) 
VALUES ('Yuliya', 'Vasenina', 'smth');




SELECT * FROM signatures;

SELECT COUNT(first) FROM signatures;

SELECT signImg FROM signatures WHERE id = 1;




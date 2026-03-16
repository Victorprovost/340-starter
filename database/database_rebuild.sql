-- *********************************************
-- 340-starter Database Rebuild File
-- *********************************************

-- Drop tables if they already exist
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS classification;
DROP TABLE IF EXISTS account;


-- *********************************************
-- Create classification table
-- *********************************************

CREATE TABLE classification (
  classification_id SERIAL PRIMARY KEY,
  classification_name VARCHAR(50) NOT NULL
);


-- *********************************************
-- Create inventory table
-- *********************************************

CREATE TABLE inventory (
  inv_id SERIAL PRIMARY KEY,
  inv_make VARCHAR(50) NOT NULL,
  inv_model VARCHAR(50) NOT NULL,
  inv_year INT NOT NULL,
  inv_description TEXT NOT NULL,
  inv_image VARCHAR(100) NOT NULL,
  inv_thumbnail VARCHAR(100) NOT NULL,
  inv_price NUMERIC(10,2) NOT NULL,
  inv_miles INT NOT NULL,
  inv_color VARCHAR(30) NOT NULL,
  classification_id INT NOT NULL,
  CONSTRAINT fk_classification
    FOREIGN KEY (classification_id)
    REFERENCES classification(classification_id)
);


-- *********************************************
-- Create account table
-- *********************************************

CREATE TABLE account (
  account_id SERIAL PRIMARY KEY,
  account_firstname VARCHAR(30) NOT NULL,
  account_lastname VARCHAR(30) NOT NULL,
  account_email VARCHAR(100) NOT NULL UNIQUE,
  account_password VARCHAR(255) NOT NULL,
  account_type VARCHAR(10) DEFAULT 'Client'
);


-- *********************************************
-- Insert classification data
-- *********************************************

INSERT INTO classification (classification_name)
VALUES
('Custom'),
('Sedan'),
('SUV'),
('Truck'),
('Sport');


-- *********************************************
-- Insert inventory sample data
-- *********************************************

INSERT INTO inventory (
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color,
  classification_id
) VALUES
('Chevy','Camaro',2018,'Sporty coupe with powerful engine','/images/camaro.jpg','/images/camaro-tn.jpg',25000,15000,'Red',5),
('Ford','Mustang',2020,'Classic American sports car','/images/mustang.jpg','/images/mustang-tn.jpg',32000,10000,'Blue',5),
('GM','Hummer',2000,'small interiors but powerful off-road capability','/images/hummer.jpg','/images/hummer-tn.jpg',30000,20000,'Black',4),
('Toyota','Corolla',2019,'Reliable sedan with excellent fuel economy','/images/corolla.jpg','/images/corolla-tn.jpg',18000,12000,'White',2),
('Jeep','Wrangler',2021,'Rugged SUV built for adventure','/images/wrangler.jpg','/images/wrangler-tn.jpg',35000,8000,'Green',3);


-- *********************************************
-- Insert sample account
-- *********************************************

INSERT INTO account (
  account_firstname,
  account_lastname,
  account_email,
  account_password
)
VALUES
('Admin','User','admin@test.com','password123');


-- Query 4
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Query 6
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
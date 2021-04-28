DROP TABLE IF EXISTS fav_foods;
DROP TABLE IF EXISTS fav_drinks;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS foods;
DROP TABLE IF EXISTS drinks;


CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL);

CREATE TABLE IF NOT EXISTS foods (
    -- ID from the API 
    id INT PRIMARY KEY, 
    name VARCHAR(200) NOT NULL,
    ingredients TEXT NOT NULL,
    steps TEXT NOT NULL,
    img_url VARCHAR(300),
    vid_url VARCHAR(300),
    area VARCHAR(100),
    category VARCHAR (100));
CREATE TABLE IF NOT EXISTS drinks (
    id INT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    ingredients TEXT NOT NULL,
    steps TEXT,
    img_url VARCHAR(300),
    vid_url VARCHAR(300),
    category VARCHAR (100)   
);
CREATE TABLE IF NOT EXISTS fav_foods (
    user_id INT ,
    food_id INT , 
    PRIMARY KEY(user_id, food_id),
    CONSTRAINT fk_food FOREIGN KEY(food_id) REFERENCES foods(id),
    CONSTRAINT fk_user_food FOREIGN KEY(user_id) REFERENCES users(id)  
);
CREATE TABLE IF NOT EXISTS fav_drinks (
    user_id INT ,
    drink_id INT ,
    PRIMARY KEY(user_id, drink_id),
    CONSTRAINT fk_drink FOREIGN KEY(drink_id) REFERENCES drinks(id),
    CONSTRAINT fk_user_drink FOREIGN KEY(user_id) REFERENCES users(id)
);
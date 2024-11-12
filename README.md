##Setup Instructions
To get started with the application, you need to install the required packages and set up your server. Please follow the steps below:
  ##1)
  Initialize the Project: Open your terminal or command prompt and navigate to the project directory. Run the following command to create a package.json file with default settings:
  
          npm init -y
  ##2)
  Install Required Packages: Next, you need to install the necessary packages for the application. Run the following command:
  
          npm install express mysql2 express-session ejs
          
  This command will install:
    -Express: A web framework for Node.js.
    -MySQL2: A MySQL client for Node.js.
    -Express-Session: Middleware for managing sessions in Express.
    -EJS: A templating engine for rendering HTML.
    
  ##3)
  Install Additional Packages: Additionally, you need to install multer for handling file uploads and bcrypt for password hashing. Run the following commands:
  
          npm install multer
          npm install bcrypt

  ##4)
  Start the Server: After installing the packages, you can start your server. Make sure you have a server file (e.g., server.js or app.js) in your project directory. You can start the server by running:

          node server.js
  (Replace server.js with the name of your main server file if you change it.)
    
  ##5)
  Access the Application: Once the server is running, you can access the application by opening your web browser and navigating to http://localhost:3001 (or the port you have configured or change the default port that i setup).
  
  ##Sql
and also this is mysql code that you need to create your database:

          CREATE TABLE users (
          id int NOT NULL AUTO_INCREMENT,
          username varchar(50) NOT NULL,
          password varchar(255) NOT NULL,
          PRIMARY KEY (id),
          UNIQUE KEY username (username)
          f_name text NOT NULL
          s_name text NOT NULL
        );
        
        CREATE TABLE places (
          id int NOT NULL AUTO_INCREMENT,
          name varchar(255) NOT NULL,
          description text,
          image1 mediumblob,
          image2 mediumblob,
          image3 mediumblob,
          image4 mediumblob,
          PRIMARY KEY (id)
        ) ;
        
        CREATE TABLE reviews (
          id int NOT NULL AUTO_INCREMENT,
          place_id int NOT NULL,
          user_id int NOT NULL,
          text text NOT NULL,
          created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          image longblob,
          PRIMARY KEY (id),
          KEY place_id (place_id),
          KEY user_id (user_id),
          CONSTRAINT reviews_ibfk_1 FOREIGN KEY (place_id) REFERENCES places (id),
          CONSTRAINT reviews_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id)
        );

but don't forgot to create you schema first tho

##good luck 💚

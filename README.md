Setup Instructions
To get started with the application, you need to install the required packages and set up your server. Please follow the steps below:

  1)Initialize the Project: Open your terminal or command prompt and navigate to the project directory. Run the following command to create a package.json file with default settings:
  
          npm init -y
  2)Install Required Packages: Next, you need to install the necessary packages for the application. Run the following command:
  
          npm install express mysql2 express-session ejs
       This command will install:
          Express: A web framework for Node.js.
          MySQL2: A MySQL client for Node.js.
          Express-Session: Middleware for managing sessions in Express.
          EJS: A templating engine for rendering HTML.
  3)Install Additional Packages: Additionally, you need to install multer for handling file uploads and bcrypt for password hashing. Run the following commands:
  
          npm install multer
          npm install bcrypt

  4)Start the Server: After installing the packages, you can start your server. Make sure you have a server file (e.g., server.js or app.js) in your project directory. You can start the server by running:

          node server.js
    (Replace server.js with the name of your main server file if you change it.)
    
  5)Access the Application: Once the server is running, you can access the application by opening your web browser and navigating to http://localhost:3001 (or the port you have configured or change the default port that i setup).

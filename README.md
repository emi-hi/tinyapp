# tinyapp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product
!["screenshot of urls index page"](https://github.com/emi-hi/tinyapp/blob/master/docs/urlsIndex.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Open a browser (ie chrome) and navigate to http://localhost:8080/. It will redirect you to a login page--click "register" in the upper right hand corner and fill in the form with your email address and password. If you miss either of those, or use an invalid email address, you will be prompted to try again.

### registration page
!["screenshot of registration page"](https://github.com/emi-hi/tinyapp/blob/master/docs/register.png)

### registration error page (user tried to enter an email that already exists, or didn't fill out either email or password fields)
!["screenshot of registration error page"](https://github.com/emi-hi/tinyapp/blob/master/docs/registerError.png)

### you can log out and log in again with the email address that you registered, as long as the server hasn't been reset. 
!["screenshot of login page"](https://github.com/emi-hi/tinyapp/blob/master/docs/login.png)

### login error page (user entered invalid email/password)
!["screenshot of login error page"](https://github.com/emi-hi/tinyapp/blob/master/docs/loginError.png)

### once you've logged in, you can start adding urls by clicking "Create New Url"
!["screenshot of create new short url page"](https://github.com/emi-hi/tinyapp/blob/master/docs/urlsCreate.png)

### now that you have added a url, you can see your url list on the index!
!["screenshot of urls index page"](https://github.com/emi-hi/tinyapp/blob/master/docs/urlsIndex.png)

### if you want to edit a long url, click "edit". It will take you to that url's individual page. The individual page also contains analytics such as views, unique views, timestamps of views, and date created. All are reset when url is edited.
!["screenshot of url edit page"](https://github.com/emi-hi/tinyapp/blob/master/docs/urlsEdit.png)

### users cannot access the individual pages for short urls that are not associated with their accounts. 
!["screenshot of wrong url/no access to url error page"](https://github.com/emi-hi/tinyapp/blob/master/docs/urlsError.png)

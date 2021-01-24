# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Login Page"](https://github.com/nicholasrwx/tinyapp/blob/master/docs/LoginPage.png?raw=true)



!["url page"](https://github.com/nicholasrwx/tinyapp/blob/master/docs/URLpage.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command, or `npm start` command.

- If the following errors occur while trying to run the app:

return process.dlopen(module, path.toNamespacedPath(filename));
Error: libnode.so.64: cannot open shared object file: No such file or directory

- The following command should fix the issue:
`npm rebuild bcrypt --build-from-source`



# Collection Of Links

## Live Demo

To see the app in action, go to [https://collection-of-links.herokuapp.com/](https://collection-of-links.herokuapp.com/)
username: test
password: 1234

## Features

- Authentication:

  - User login with username and password

  - Admin sign-up with admin code

  - Need to have invite code inorder to sign in

- Authorization:

  - Only the user be able to see their own link

  - One cannot edit or delete links created by other users

  - Admin can manage all links

- Manage Links posts with basic functionalities:

  - Create, edit and delete links

  - If you do not included the picture, it will goes to that link and screenshot the website for you.

  - You be able to upload your own photos.

- Manage user account with basic functionalities:

  - User be able to signup for website

- Flash messages responding to users' interaction with the app

- Responsive web design

### Custom Enhancements

- Update link photos when editing Link

- Improve image load time using Cloudinary

## Getting Started

> This app contains API secrets and passwords that have been hidden deliberately, so the app cannot be run with its features on your local machine. However, feel free to clone this repository if necessary.

### Install dependencies

```sh
npm install
```

or

```sh
yarn install
```

## Built with

### Front-end

- [ejs](http://ejs.co/)
- [Google Maps APIs](https://developers.google.com/maps/)
- [Bootstrap](https://getbootstrap.com/docs/3.3/)

### Back-end

- [express](https://expressjs.com/)
- [mongoDB](https://www.mongodb.com/)
- [mongoose](http://mongoosejs.com/)
- [async](http://caolan.github.io/async/)
- [passport](http://www.passportjs.org/)
- [passport-local](https://github.com/jaredhanson/passport-local#passport-local)
- [express-session](https://github.com/expressjs/session#express-session)
- [method-override](https://github.com/expressjs/method-override#method-override)
- [moment](https://momentjs.com/)
- [cloudinary](https://cloudinary.com/)
- [connect-flash](https://github.com/jaredhanson/connect-flash#connect-flash)

### Platforms

- [Cloudinary](https://cloudinary.com/)
- [Heroku](https://www.heroku.com/)

## License

#### [MIT](./LICENSE)

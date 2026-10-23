<div align="center">

# 🇪🇹 EthioFlow AI 🌿

### Smart Business Management for Ethiopian Businesses

A modern, full-stack business management platform designed to simplify business workflows with a clean interface, secure authentication, and intelligent digital tools.

Built with the MERN stack, EthioFlow AI aims to make business management simpler, smarter, and more accessible.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

**🚀 Live Demo:** Coming Soon

**📡 Backend API:** Coming Soon

</div>

---

## ✨ Features

| Feature                     | Description                                                     |
| --------------------------- | --------------------------------------------------------------- |
| 🔐 **Authentication**       | Login, email verification, and password recovery                |
| 🏢 **Business Management**  | Business data models and backend infrastructure                 |
| 🛡️ **Admin Dashboard**      | Platform administration and contact message management          |
| 📩 **Contact System**       | Submit inquiries and receive email confirmations                |
| ✉️ **Email Communication**  | SMTP-based verification, recovery, and reply emails             |
| 🎨 **Modern UI**            | Responsive interface with forest-green, gold, and cream styling |
| 🔄 **API Integration**      | Centralized Axios configuration for frontend requests           |
| 🌐 **Internationalization** | i18next integration for localization support                    |
| 📊 **Data Visualization**   | Charting support with Recharts                                  |
| ⚠️ **Error Handling**       | Frontend error boundaries and backend error handling            |

---

## 🖥️ Preview

<div align="center">

<img src="./screenshots/Home-page.jpg" alt="EthioFlow AI Home Page" width="85%">
<img src="./screenshots/landing-page.jpg" alt="EthioFlow AI Landing Page" width="85%">

_EthioFlow AI — Landing and Home Page_

<img src="./screenshots/admin-dashboard.jpg" alt="EthioFlow AI Admin Dashboard" width="85%">

_EthioFlow AI — Admin Dashboard_

</div>

---

## 🌐 Live Demo

| Service            | Link                                              |
| ------------------ | ------------------------------------------------- |
| 🌍 **Frontend**    | Coming Soon                                       |
| ⚙️ **Backend API** | Coming Soon                                       |
| 💻 **Source Code** | [GitHub Repository](https://github.com/Seid-Star) |

Deployment links will be added once the application is published.

---

## 🛠️ Tech Stack

### Frontend

- **React 19** — Component-based user interface
- **Vite 8** — Development server and production build
- **Tailwind CSS 4** — Responsive styling
- **React Router 7** — Client-side routing
- **Axios** — HTTP communication
- **Zustand** — State management
- **Recharts** — Data visualization
- **Lucide React** — Icon library
- **i18next** — Internationalization
- **GSAP** — Animations
- **jsPDF** — PDF generation
- **html5-qrcode** — QR code scanning
- **IndexedDB (idb)** — Client-side data storage support

### Backend

- **Node.js** — JavaScript runtime
- **Express 5** — REST API framework
- **MongoDB** — NoSQL database
- **Mongoose 9** — Database modeling
- **JWT** — Token-based authentication
- **bcryptjs** — Password hashing
- **Nodemailer** — Email delivery
- **Express Validator** — Request validation
- **Helmet** — Security headers
- **Express Rate Limit** — Request rate limiting
- **Multer** — File upload handling
- **Google GenAI SDK** — Generative AI integration
- **Cookie Parser** — Cookie parsing
- **CORS** — Cross-origin request configuration
- **Morgan** — HTTP request logging

### Development Tools

- **Git & GitHub** — Version control
- **npm** — Package management
- **Nodemon** — Automatic backend restarts
- **ESLint** — Code quality and linting

---

## 📁 Project Structure

```text
ethioflow-ai/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── landing/
│   │   │   └── layout/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── screenshots/
│   ├── landing-page.png
│   └── admin-dashboard.png
│
├── .gitignore
└── README.md
```

---

## 🏗️ Architecture

EthioFlow AI follows a client-server architecture.

- **Frontend:** React provides the user interface and communicates with the backend through Axios.
- **Backend:** Express handles API requests, authentication, validation, and business logic.
- **Database:** MongoDB stores application data through Mongoose models.
- **Authentication:** JWT-based authentication and protected administrative routes.
- **Email Service:** Nodemailer supports verification, password recovery, and contact replies through SMTP.
- **AI Integration:** The backend includes the Google GenAI SDK for generative AI functionality.

---

## ☁️ Deployment

EthioFlow AI is being prepared for production deployment.

| Component      | Deployment URL                                |
| -------------- | --------------------------------------------- |
| 🌍 Frontend    | _Coming Soon_                                 |
| ⚙️ Backend API | _Coming Soon_                                 |
| 🗄️ Database    | MongoDB Atlas or configured database provider |

### Production Checklist

- [ ] Deploy the frontend.
- [ ] Deploy the backend API.
- [ ] Configure production environment variables.
- [ ] Connect the production database.
- [ ] Configure the frontend API URL.
- [ ] Configure CORS for the deployed frontend.
- [ ] Configure SMTP email delivery.
- [ ] Test registration, login, and email verification.
- [ ] Test password recovery.
- [ ] Test contact submissions and administrative replies.
- [ ] Verify HTTPS and security configuration.
- [ ] Add live links and screenshots to this README.

---

## 🛣️ Roadmap

- [ ] Complete production deployment.
- [ ] Publish the live frontend and API URLs.
- [ ] Add real application screenshots.
- [ ] Expand business management capabilities.
- [ ] Improve analytics and reporting.
- [ ] Expand localization for Ethiopian users.
- [ ] Add automated testing and continuous integration.
- [ ] Improve production monitoring and error tracking.

---

## 🔒 Security

EthioFlow AI incorporates security-related technologies and practices, including:

- Password hashing with bcryptjs.
- JWT-based authentication.
- Protected administrative endpoints.
- Request validation and rate limiting.
- Security headers through Helmet.
- Environment-based configuration for secrets.

**Important security practices:**

- Never commit real `.env` files.
- Never expose SMTP app passwords or database credentials.
- Never publish JWT secrets or private API keys.
- Use strong production secrets.
- Configure CORS for trusted origins.
- Review authentication and authorization before deployment.

---

## 🧪 Development Scripts

### Frontend

Run these commands from the `client/` directory.

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite development server    |
| `npm run build`   | Build the frontend for production    |
| `npm run lint`    | Run ESLint                           |
| `npm run preview` | Preview the production build locally |

### Backend

Run these commands from the `server/` directory.

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `npm run dev`  | Start the backend with Nodemon           |
| `npm start`    | Start the backend with Node.js           |
| `npm run seed` | Run the configured demo-data seed script |

---

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes.
4. Test the affected functionality.
5. Commit your changes with a descriptive message.
6. Open a pull request describing your contribution.

Please ensure that your changes do not introduce credentials, break existing functionality, or expose sensitive application data.

---

## 📬 Contact

<div align="center">

### Seid Jemal

**Software Engineering Student | Full-Stack Developer**

📧 **Email:** [sjrd02911@gmail.com](mailto:sjrd02911@gmail.com)

💻 **GitHub:** [Seid-Star](https://github.com/Seid-Star)

🔗 **LinkedIn:** [Seid Jemal](https://linkedin.com/in/seid-jemal-6267a5421)

</div>

---

## 📄 License

The backend package specifies the ISC license. Confirm the intended license for the complete project and add a root-level `LICENSE` file before distributing it publicly.

<div align="center">

### 🌿 EthioFlow AI

**Smarter workflows. Better business.**

Made with dedication in Ethiopia 🇪🇹

</div>

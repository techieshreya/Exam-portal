# Exam Portal

![Logo](/public/logo.svg)

A modern, secure, and user-friendly online exam portal built with React, TypeScript, and Vite. This application provides a seamless experience for both students taking exams and administrators managing them.

## Features

### For Students

*   **Secure Authentication:** Students can securely log in to access their exams.
*   **Dashboard:** A personalized dashboard displaying upcoming and past exams.
*   **Exam Interface:** A clean and intuitive interface for taking exams.
*   **Real-time Timer:** A timer to keep track of the remaining time during an exam.
*   **Instant Results:** View results immediately after completing an exam.

### For Administrators

*   **Secure Admin Login:** Separate and secure login for administrators.
*   **Admin Dashboard:** A comprehensive dashboard to manage exams, users, and results.
*   **Exam Management:** Create, update, and delete exams with ease.
*   **User Management:** View, create, and manage user accounts.
*   **Result Tracking:** Monitor and analyze exam results.
*   **Bulk User Creation:** Easily create multiple user accounts at once.

## Tech Stack

*   **Frontend:** React, TypeScript, Vite
*   **Styling:** CSS, Tailwind CSS (or other styling library if used)
*   **State Management:** Zustand
*   **Routing:** React Router
*   **API Client:** Axios
*   **Linting:** ESLint
*   **Package Manager:** npm / bun

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or higher)
*   npm or bun

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username/exam-portal.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
    or
    ```sh
    bun install
    ```
3.  Start the development server
    ```sh
    npm run dev
    ```
    or
    ```sh
    bun run dev
    ```

## Project Structure

```
/
├── public/
│   ├── examconfig.seb
│   ├── logo.svg
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── auth/
│   │   ├── layouts/
│   │   └── ui/
│   ├── hooks/
│   ├── pages/
│   │   └── admin/
│   ├── services/
│   ├── store/
│   └── types/
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.ts
```

## API Endpoints

The application interacts with a backend API for data and authentication. The base URL for the API is configured in `src/services/api.ts`.

### Auth Endpoints

*   `POST /api/auth/login`: User login
*   `POST /api/auth/admin/login`: Admin login

### Exam Endpoints

*   `GET /api/exams`: Get all exams
*   `GET /api/exams/:id`: Get a specific exam
*   `POST /api/exams/:id/submit`: Submit exam answers

### Admin Endpoints

*   `GET /api/admin/exams`: Get all exams (admin)
*   `POST /api/admin/exams`: Create a new exam
*   `GET /api/admin/users`: Get all users
*   `POST /api/admin/users/bulk`: Bulk create users

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
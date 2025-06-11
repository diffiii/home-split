# HomeSplit - Household Management App

HomeSplit is a web application designed to simplify household managemnt by enabling users to track expenses, manage tasks, share responsibilities, and create shopping lists with other members.

## Features
TODO: ...

## Technologies Used

### Backend
- **Django**: Python web framework
- **Django REST Framework**: Toolkit for building Web APIs
- **SQLite**: Lightweight database for development
- **JWT Authentication**: Secure user authentication

### Frontend
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Superset of JavaScript for type safety
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Axios**: Promise-based HTTP client for making API requests
- **React Router**: Declarative routing for React applications
- **Vite**: Build tool for modern web projects

## Project Structure

```
home-split/
├── backend/               # Django backend
│   ├── api/               # API application
│   │   ├── models/        # Database models
│   │   ├── serializers/   # API serializers
│   │   ├── views/         # API views
│   │   └── migrations/    # Database migrations
│   ├── algorithms/        # Business logic (settlements)
│   ├── backend/           # Django project settings
│   └── manage.py          # Django management script
└── frontend/              # React frontend
    ├── src/               # Frontend source code
    │   ├── components/    # Reusable UI components
    │   ├── pages/         # Page components
    │   ├── context/       # React context providers
    │   ├── services/      # API service layer
    │   └── types/         # TypeScript type definitions
    └── package.json       # Frontend dependencies
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2. Create a virtual environment:
    ```bash
    python -m venv env
    ```

3. Activate the virtual environment:
    - On Windows:
        ```bash
        .\env\Scripts\activate
        ```
    - On macOS/Linux:
        ```bash
        source env/bin/activate
        ```

4. Install backend dependencies:
    ```bash
    pip install -r requirements.txt
    ```

5. Apply migrations to set up the database:
    ```bash
    python manage.py migrate
    ```

6. Start the Django development server:
    ```bash
    python manage.py runserver
    ```

The backend API will be available at `http://localhost:8000/api/`.

### Frontend Setup

1. Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2. Install frontend dependencies:
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```
    or
    ```bash
    yarn dev
    ```

The frontend will be available at `http://localhost:3000/`.

### API Endpoints

The list of available API endpoints can be found at `http://localhost:8000/api/docs/` once the backend server is running. This includes endpoints for user authentication, expense tracking, task management, and more.

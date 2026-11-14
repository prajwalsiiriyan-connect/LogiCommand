# LogiCommand
### Real-Time Supply Chain Command Center

LogiCommand is a full-stack logistics and supply chain management application designed to bring operational information into one place. The project combines a React frontend with a Node.js and Express backend, MongoDB for data storage, and Socket.IO for real-time communication.

The goal is to develop a centralized interface for monitoring logistics operations, managing supply chain activities, and improving operational visibility.

## Project Status

**LogiCommand is currently under active development.**

The existing full-stack foundation is in place. The current development phase focuses on improving the user experience and refining the application module by module.

### Current Progress
- Welcome and login interface redesign completed.
- Existing React frontend and Express backend structure retained.
- MongoDB database integration established.
- Dashboard and logistics modules are being reviewed and refined.
- Interface consistency and responsive improvements are ongoing.
- Testing, performance improvements, and deployment preparation are pending.

The current redesign is limited to the entry experience. Other application modules will be updated and verified as development progresses.

## Application Scope

The project is being developed around the following areas:

| Module | Purpose |
|---|---|
| Dashboard | Centralized overview of logistics operations and key metrics |
| Shipments | Shipment information and tracking |
| Inventory | Inventory and stock visibility |
| Orders | Order information and lifecycle management |
| Suppliers | Supplier information and performance overview |
| Route Management | Logistics routes and network visibility |
| Reports | Operational data and reporting |
| Alerts | Operational notifications and status updates |

These describe the intended application scope. Individual modules are still subject to refinement and verification.

## Technology Stack

### Frontend
- React 18
- Vite
- JavaScript
- CSS
- Recharts
- Framer Motion
- Axios
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JSON Web Token (JWT)
- bcryptjs

### Development Tools
- Git
- GitHub
- Visual Studio Code
- npm

## Project Structure

```text
LogiCommand/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── seed/
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

Make sure you have installed:

- Node.js and npm
- MongoDB locally or a MongoDB Atlas database
- Git (optional)

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

Move into the project directory:

```bash
cd LogiCommand
```

### 2. Set Up the Backend

Open a terminal inside the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Replace the placeholder values with your own configuration. Keep this file private and never commit it to GitHub.

Start the backend:

```bash
npm run dev
```

The backend development server uses port `5000` by default.

### 3. Set Up the Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the local address displayed by Vite. The default development address is:

```text
http://localhost:5173
```

### 4. Available Scripts

**Backend**

| Command | Description |
|---|---|
| `npm run dev` | Start backend with Nodemon |
| `npm start` | Start backend normally |
| `npm run seed` | Run the database seed script |

**Frontend**

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |

## Development Roadmap

The project will continue through the following stages:

1. **Interface refinement:** Improve the dashboard and existing logistics modules.
2. **Functional review:** Review application flows, API integration, authentication, and real-time communication.
3. **Responsive improvements:** Refine layouts across desktop and mobile screens.
4. **Testing and optimization:** Identify issues and improve application performance.
5. **Deployment:** Prepare and deploy the frontend and backend with the required environment configuration.

## Important Notes

- This project is under active development and is not yet presented as a production-ready application.
- Some functionality and interfaces may change during development.
- Keep environment variables, database credentials, and authentication secrets out of the repository.
- Verify application modules and integrations before treating them as completed features.

## License

A license has not yet been specified for this project.
# Lead Management System

A full-stack lead management application built with Node.js, Express, MongoDB, and React.

## 🚀 Features

- **Authentication System**
  - User registration and login
  - JWT-based authentication with httpOnly cookies
  - Protected routes and middleware

- **Lead Management**
  - Create, read, update, and delete leads
  - Advanced filtering and search capabilities
  - Pagination support
  - Lead scoring and qualification tracking

- **Advanced Filtering**
  - Status, source, and qualification filters
  - Score and value range filters
  - Date range filtering
  - Real-time search

- **Modern UI/UX**
  - Responsive design with TailwindCSS
  - AG Grid for data display
  - Intuitive forms and navigation
  - Mobile-friendly interface

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **AG Grid** - Data grid component
- **React Router** - Client-side routing
- **Axios** - HTTP client

## 📁 Project Structure

```
lead-management-system/
├── backend/                 # Backend API
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── scripts/            # Database scripts
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── main.jsx        # App entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
└── package.json            # Root package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or yarn

### 1. Clone and Install

```bash
git clone <repository-url>
cd lead-management-system
npm run install:all
```

### 2. Environment Setup

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp env.example .env
```

Edit `.env` with your configuration:

```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/lead-management
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Seed the Database

```bash
npm run seed
```

This will create:
- 150 sample leads
- Demo user: `demo@example.com` / `demo123`

### 4. Start Development Servers

```bash
# Start both backend and frontend
npm run dev

# Or start them separately
npm run dev:backend    # Backend on port 5000
npm run dev:frontend   # Frontend on port 5173
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Demo Login**: demo@example.com / demo123

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Leads
- `GET /api/leads` - List leads with pagination & filters
- `POST /api/leads` - Create new lead
- `GET /api/leads/:id` - Get single lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Query Parameters for GET /api/leads
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Text search across name, email, company, city, state
- `status` - Filter by status (new, contacted, qualified, lost, won)
- `source` - Filter by source (website, facebook_ads, google_ads, referral, events, other)
- `is_qualified` - Filter by qualification (true, false)
- `score_min`, `score_max` - Score range (0-100)
- `value_min`, `value_max` - Lead value range
- `date_from`, `date_to` - Created date range

## 🚀 Deployment

### Backend (Render/Railway)

1. **Render**
   - Connect your GitHub repository
   - Set environment variables
   - Build command: `cd backend && npm install && npm run build`
   - Start command: `cd backend && npm start`

2. **Railway**
   - Connect your GitHub repository
   - Set environment variables
   - Deploy automatically

### Frontend (Vercel)

1. **Vercel**
   - Connect your GitHub repository
   - Set build command: `cd frontend && npm install && npm run build`
   - Set output directory: `frontend/dist`
   - Set environment variables for API URL

### Environment Variables for Production

```env
# Backend
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/lead-management
JWT_SECRET=your_production_jwt_secret
PORT=5000
CLIENT_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production

# Frontend
VITE_API_URL=https://your-backend-domain.onrender.com
```

## 🔒 Security Features

- JWT tokens stored in httpOnly cookies
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Helmet security headers
- Protected API routes

## 📱 Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interface
- Optimized for all screen sizes

## 🧪 Testing

The application includes comprehensive error handling and validation:

- Frontend form validation
- Backend API validation
- Error boundaries and user feedback
- Loading states and error messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

## 🎯 Roadmap

- [ ] Email notifications
- [ ] Lead analytics dashboard
- [ ] Bulk operations
- [ ] Export functionality
- [ ] Advanced reporting
- [ ] Integration with CRM systems
- [ ] Mobile app
- [ ] Multi-tenant support

---


# Byzand Email Client - Backend Server

A comprehensive Gmail-like email client backend built with Express.js, TypeScript, and MongoDB. This server provides a complete email management system with enterprise-level architecture and modern features.

## 🚀 Features

### Core Email Features
- ✅ **Inbox Management**: Primary inbox with conversation threading
- ✅ **Email Composition**: Rich text editor with full formatting options
- ✅ **Email Actions**: Mark as read/unread, star, archive, delete
- ✅ **File Attachments**: Drag-and-drop file uploads with size validation
- ✅ **Email Search**: Advanced search with Gmail-style operators
- ✅ **Folder Organization**: Inbox, Sent, Drafts, Trash, Spam, Archive
- ✅ **Email Statistics**: Analytics and storage usage tracking
- ✅ **Bulk Operations**: Mass email management

### Authentication & Security
- ✅ **User Registration & Login**: Secure authentication system
- ✅ **JWT Tokens**: Stateless authentication with configurable expiration
- ✅ **Password Hashing**: Secure password storage with bcrypt
- ✅ **Rate Limiting**: Protection against abuse and DDoS
- ✅ **CORS Configuration**: Cross-origin resource sharing
- ✅ **Security Headers**: Helmet.js for enhanced security
- ✅ **Input Validation**: Comprehensive data validation and sanitization

### Advanced Features
- ✅ **Spam Detection**: Basic spam filtering and marking
- ✅ **Email Labeling**: Custom labels with color coding
- ✅ **Email Threading**: Conversation grouping and management
- ✅ **User Quotas**: Storage quota management and tracking
- ✅ **Admin Management**: User administration and quota management
- ✅ **Real-time Updates**: Ready for WebSocket integration

## 🏗️ Architecture

The backend follows a strict layered architecture with clear separation of concerns:

```
src/
├── constants/     # Application-wide constants
├── configs/       # Configuration management
├── types/         # TypeScript type definitions
├── utils/         # Core utility functions
├── helpers/       # Helper functions and middleware
├── services/      # Business logic layer
├── controllers/   # Request/response handling
├── routes/        # HTTP endpoint definitions
├── middleware/    # Custom middleware
└── uploads/       # File upload handling
```

### Layer Responsibilities

#### **Routes Layer** (`/routes`)
- Handle all HTTP endpoints and request routing
- Define API endpoints for authentication, emails, and user management
- Implement proper HTTP methods (GET, POST, PUT, DELETE, PATCH)

#### **Controllers Layer** (`/controllers`)
- Handle request/response logic and validation
- Parse incoming requests and validate data
- Call appropriate services
- Format responses with proper HTTP status codes
- Handle error responses consistently

#### **Services Layer** (`/services`)
- Implement core business logic
- Email processing and management
- User authentication and authorization
- Email threading and conversation management
- Search functionality with advanced operators
- Spam and security filtering

#### **Helpers Layer** (`/helpers`)
- Provide utility functions for common operations
- Email parsing and formatting
- Data validation and sanitization
- Response formatting and standardization
- Pagination and sorting utilities
- Error handling and logging

#### **Utils Layer** (`/utils`)
- Core utility functions and shared logic
- Password hashing and comparison
- JWT token generation and verification
- Email validation and spam detection
- File handling and validation
- Date formatting and manipulation

#### **Configs Layer** (`/configs`)
- Manage all application configurations
- Database connection settings
- Email server configurations
- Authentication and JWT settings
- File upload and storage settings
- Security and CORS policies

#### **Constants Layer** (`/constants`)
- Define application-wide constants
- Email folder types and statuses
- User permission levels and roles
- Validation rules and constraints
- Error messages and codes
- Success messages and responses

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (for production)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd email-client/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # Database Configuration (for production)
   MONGODB_URI=mongodb://localhost:27017/byzand-email
   
   # Email Server Configuration
   SMTP_HOST=your-smtp-server.com
   SMTP_PORT=587
   SMTP_USER=your-email@domain.com
   SMTP_PASS=your-password
   
   # File Upload Configuration
   UPLOAD_PATH=./src/uploads
   MAX_FILE_SIZE=10485760
   MAX_FILES=10
   ```

4. **Start the server**
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/stats` - Get user statistics

### Email Routes
- `GET /api/emails` - Get emails with pagination and filters
- `GET /api/emails/:id` - Get single email
- `POST /api/emails/send` - Send email with attachments
- `PATCH /api/emails/:id` - Update email (read, star, labels)
- `DELETE /api/emails/:id` - Delete email (move to trash)
- `DELETE /api/emails/:id/permanent` - Permanently delete email
- `GET /api/emails/stats` - Get email statistics
- `GET /api/emails/search` - Search emails
- `GET /api/emails/folder/:folder` - Get emails by folder
- `POST /api/emails/:id/spam` - Mark email as spam/not spam
- `PUT /api/emails/:id/labels` - Update email labels
- `PATCH /api/emails/bulk/update` - Bulk update emails
- `DELETE /api/emails/bulk/delete` - Bulk delete emails

### Admin Routes (Admin only)
- `GET /api/auth/users` - Get all users
- `PUT /api/auth/users/quota` - Update user quota
- `PUT /api/auth/users/:userId/deactivate` - Deactivate user
- `PUT /api/auth/users/:userId/activate` - Activate user

## 🧪 Testing

### Run Comprehensive API Tests
```bash
node test-complete-api.js
```

### Test Individual Endpoints
```bash
# Health check
curl http://localhost:3000/health

# API information
curl http://localhost:3000/api

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123","firstName":"Test","lastName":"User"}'
```

## 🔒 Security Features

### Authentication
- JWT-based stateless authentication
- Secure password hashing with bcrypt
- Configurable token expiration
- Rate limiting on all endpoints

### Data Protection
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet.js
- File upload validation and restrictions
- SQL injection prevention (when using database)

### File Upload Security
- File type validation
- File size limits
- Secure file naming
- Virus scanning ready (can be integrated)

## 📊 Database Schema (MongoDB)

### User Schema
```typescript
interface IUser {
  id: string;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isAdmin: boolean;
  emailQuota: number;
  usedQuota: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Email Schema
```typescript
interface IEmail {
  id: string;
  messageId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments: IAttachment[];
  isRead: boolean;
  isStarred: boolean;
  isSpam: boolean;
  isTrash: boolean;
  labels: string[];
  folder: string;
  receivedAt: Date;
  sentAt?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure MongoDB connection
3. Set up email server credentials
4. Configure SSL/TLS certificates
5. Set up reverse proxy (nginx)

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Performance Optimization
- Enable Redis caching
- Implement database indexing
- Use CDN for static assets
- Enable compression
- Implement connection pooling

## 🔧 Configuration

### Server Configuration
- **PORT**: Server port (default: 3000)
- **NODE_ENV**: Environment (development/production)
- **CORS_ORIGIN**: Allowed origins for CORS

### JWT Configuration
- **JWT_SECRET**: Secret key for token signing
- **JWT_EXPIRES_IN**: Token expiration time

### Email Configuration
- **SMTP_HOST**: SMTP server hostname
- **SMTP_PORT**: SMTP server port
- **SMTP_USER**: SMTP username
- **SMTP_PASS**: SMTP password

### Upload Configuration
- **UPLOAD_PATH**: File upload directory
- **MAX_FILE_SIZE**: Maximum file size in bytes
- **MAX_FILES**: Maximum files per upload
- **ALLOWED_TYPES**: Allowed file MIME types

## 📈 Monitoring & Logging

### Built-in Logging
- Request logging with timestamps
- Error logging with stack traces
- Performance metrics
- Security event logging

### Health Checks
- Server health endpoint: `/health`
- API information endpoint: `/api`
- Database connectivity checks
- Email server connectivity checks

## 🔄 Future Enhancements

### Planned Features
- [ ] Real-time email synchronization (WebSocket)
- [ ] Advanced spam filtering (AI-based)
- [ ] Email encryption (PGP/GPG)
- [ ] Calendar integration
- [ ] Contact management
- [ ] Email templates
- [ ] Vacation auto-responder
- [ ] Email forwarding rules
- [ ] Two-factor authentication (2FA)
- [ ] Email delegation
- [ ] Advanced search operators
- [ ] Email scheduling
- [ ] Undo send functionality
- [ ] Confidential mode
- [ ] Self-destructing emails

### Technical Improvements
- [ ] Redis caching implementation
- [ ] Database connection pooling
- [ ] Background job processing
- [ ] Email indexing for fast search
- [ ] Attachment streaming
- [ ] Image optimization
- [ ] PDF generation
- [ ] Email backup and restore
- [ ] Multi-language support
- [ ] API rate limiting per user

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the test files for usage examples

---

**Byzand Email Client** - A modern, secure, and feature-rich email management system built with enterprise-level architecture.

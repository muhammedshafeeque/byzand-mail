# Email Client Frontend

A modern React-based email client frontend built with Vite, TypeScript, Tailwind CSS, and React Router.

## Features

- 🔐 **Authentication**: Login and registration with JWT tokens
- 📧 **Email Management**: View, send, reply, forward emails
- 📁 **Folder Organization**: Inbox, Sent, Drafts, Spam, Trash
- 🔍 **Search**: Full-text search across emails
- 📎 **Attachments**: Support for file attachments
- ⭐ **Starring**: Mark important emails
- 🏷️ **Labels**: Organize emails with labels
- 📱 **Responsive**: Mobile-friendly design
- 🎨 **Modern UI**: Clean, intuitive interface

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Heroicons** - Icon library

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend server running (see server README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
echo "VITE_API_URL=http://localhost:3000/api" > .env
```

3. Start development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with sidebar
│   └── LoadingSpinner.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Dashboard.tsx   # Email list
│   ├── EmailView.tsx   # Individual email view
│   └── ComposeEmail.tsx # Compose new email
├── services/           # API services
│   └── api.ts         # API client and types
├── App.tsx            # Main app component
└── main.tsx          # Entry point
```

## API Integration

The frontend communicates with the backend API through the `api.ts` service:

- **Authentication**: Login, register, profile management
- **Emails**: CRUD operations, search, filtering
- **File Uploads**: Attachment handling
- **Real-time Updates**: Automatic token refresh

## Features in Detail

### Authentication
- JWT-based authentication
- Automatic token refresh
- Protected routes
- Persistent login state

### Email Management
- View email list with pagination
- Read individual emails
- Compose new emails
- Reply and forward
- Delete and move to folders
- Mark as read/unread
- Star important emails

### Search & Filtering
- Full-text search
- Filter by folder
- Filter by read status
- Filter by starred status
- Sort by date, sender, subject

### Responsive Design
- Mobile-first approach
- Collapsible sidebar
- Touch-friendly interface
- Optimized for all screen sizes

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- Tailwind CSS for styling
- Functional components with hooks
- Proper error handling
- Loading states

## Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your web server

3. Ensure the backend API is accessible from the frontend domain

4. Update the `VITE_API_URL` environment variable for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

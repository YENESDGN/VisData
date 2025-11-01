# VisData - AI-Powered Data Visualization Platform

A modern, full-stack web application for uploading, analyzing, and visualizing CSV and Excel data files with AI-powered chart recommendations.

## 🌟 Features

- **File Upload & Management**: Upload CSV and Excel files, manage your data files
- **AI-Powered Analysis**: Automatic file analysis with OpenAI to recommend the best chart types and axis selections
- **Interactive Visualizations**: Create beautiful charts (Bar, Line, Pie, Scatter, Area, Table)
- **AI Chatbot**: Intelligent assistant that can analyze your files and provide recommendations in English
- **User Authentication**: Secure sign up and sign in system
- **Library System**: Save your visualizations for future access
- **Toast Notifications**: User-friendly notifications for actions
- **Responsive Design**: Modern glassmorphism UI with dark theme

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Lucide React** for icons
- Custom glassmorphism design

### Backend
- **FastAPI** (Python) - Modern async web framework
- **SQLAlchemy** - ORM for database management
- **Pandas** - Data processing
- **OpenAI API** - AI-powered analysis
- **JWT Authentication** - Secure token-based auth
- **Argon2** - Password hashing

## 📋 Prerequisites

- Python 3.8+
- Node.js 18+
- OpenAI API Key (optional, for AI features)

## 🚀 Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file in the `backend` directory (you can copy from `ENV_EXAMPLE.txt`):
```env
database_url=sqlite:///./visdata.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
openai_api_key=your-openai-api-key-here
```

   Or copy the example file:
   ```bash
   # Windows
   copy ENV_EXAMPLE.txt .env
   
   # Linux/Mac
   cp ENV_EXAMPLE.txt .env
   ```

6. Run the backend server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults to localhost:8000):
```env
VITE_API_BASE_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
VisData/
├── backend/
│   ├── core/           # Configuration and security
│   ├── database/        # Database models and connection
│   ├── routers/        # API endpoints
│   ├── schemas/        # Pydantic schemas
│   ├── uploaded_files/ # User uploaded files
│   └── main.py         # FastAPI application
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── contexts/   # React contexts
│   │   ├── lib/        # API client
│   │   └── App.tsx     # Main app component
│   └── package.json
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /auth/token` - Login
- `GET /users/me` - Get current user

### Files
- `GET /files/` - List user's files
- `POST /files/upload` - Upload a file
- `DELETE /files/{file_id}` - Delete a file

### Visualization
- `GET /visualize/{file_id}/data` - Get file data for visualization

### AI
- `POST /ai/chat` - Chat with AI assistant
- `GET /ai/analyze_file/{file_id}` - Analyze file for chart recommendations

## 🤖 AI Features

The application uses OpenAI's GPT models to:
- Analyze uploaded data files
- Recommend optimal chart types (bar, line, pie, scatter, area, table)
- Suggest best X and Y axis column selections
- Provide interactive chatbot assistance in English

## 📝 Usage

1. **Sign Up/Sign In**: Create an account or log in
2. **Upload File**: Upload a CSV or Excel file
3. **Auto Analysis**: The AI will automatically analyze your file and suggest optimal visualization settings
4. **Customize**: Adjust chart type, X/Y axes, and other settings
5. **Save**: Save visualizations to your library
6. **Chat**: Ask the AI assistant about your files and get recommendations

## 🎨 Features in Detail

### Toast Notifications
- Success messages for sign in, sign up, and file saves
- Auto-dismiss after 5 seconds
- Beautiful glassmorphism design

### Recent Files Sidebar
- Quick access to recently uploaded files
- Click any file to open it in visualization mode

### AI Chatbot
- Access your uploaded files
- Ask questions about your data
- Get file-specific analysis and recommendations
- All responses in English

## 🔒 Security

- JWT-based authentication
- Argon2 password hashing
- User-specific file access
- CORS protection
- Environment variables for sensitive data
See LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


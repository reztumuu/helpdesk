## 1. Architecture Design

```mermaid
graph TD
    A[Visitor Browser] --> B[Widget Script]
    C[Admin Browser] --> D[Next.js Admin Dashboard]
    B --> E[Socket.io Client]
    D --> F[Socket.io Server]
    F --> G[Prisma ORM]
    G --> H[MySQL Database]
    D --> I[Next.js API Routes]
    I --> G
    E --> F
    
    subgraph "Frontend Layer"
        D
        B
    end
    
    subgraph "Application Layer"
        I
        F
    end
    
    subgraph "Data Layer"
        G
        H
    end
```

## 2. Technology Description

- **Frontend**: Next.js@14 (App Router) + React@18 + TailwindCSS@3
- **Backend**: Next.js API Routes (built-in)
- **Database**: MySQL@8 + Prisma@5 ORM
- **Real-time**: Socket.io@4
- **Authentication**: JWT with next-auth@4
- **Initialization Tool**: create-next-app
- **Additional Dependencies**: 
  - @prisma/client for database access
  - socket.io-client for real-time communication
  - jsonwebtoken for authentication
  - bcrypt for password hashing
  - multer for file uploads
  - sharp for image processing

## 3. Route Definitions

| Route | Purpose |
|-------|---------|
| /admin/login | Admin authentication page |
| /admin/dashboard | Main dashboard with overview statistics |
| /admin/websites | Website management interface |
| /admin/websites/[id] | Individual website settings and analytics |
| /admin/chats | Active chat management interface |
| /admin/chats/[id] | Individual chat conversation |
| /admin/analytics | Analytics dashboard with charts |
| /admin/admins | Admin user management |
| /api/auth/login | JWT authentication endpoint |
| /api/websites | CRUD operations for websites |
| /api/chats | Chat management endpoints |
| /api/messages | Message sending/receiving |
| /api/analytics | Analytics data endpoints |
| /api/widget/config | Widget configuration endpoint |
| /widget.js | Embeddable widget script |

## 4. API Definitions

### 4.1 Authentication API

**Login**
```
POST /api/auth/login
```

Request:
| Param Name | Param Type | isRequired | Description |
|------------|------------|------------|-------------|
| email | string | true | Admin email address |
| password | string | true | Admin password |

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| token | string | JWT access token |
| user | object | User data (id, email, role) |
| expiresIn | number | Token expiration time (seconds) |

### 4.2 Website Management API

**Create Website**
```
POST /api/websites
```

Request:
| Param Name | Param Type | isRequired | Description |
|------------|------------|------------|-------------|
| name | string | true | Website name |
| domain | string | true | Website domain |
| description | string | false | Website description |

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| id | string | Website ID |
| apiKey | string | Generated API key |
| embedCode | string | Widget embed script |

### 4.3 Chat Management API

**Send Message**
```
POST /api/messages
```

Request:
| Param Name | Param Type | isRequired | Description |
|------------|------------|-------------|
| chatId | string | true | Chat session ID |
| content | string | true | Message content |
| type | string | true | Message type (text/file) |
| sender | string | true | Sender type (admin/visitor) |

### 4.4 Widget API

**Get Widget Configuration**
```
GET /api/widget/config?apiKey={apiKey}
```

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| primaryColor | string | Widget primary color |
| position | string | Widget position |
| welcomeMessage | string | Welcome message text |
| businessHours | object | Business hours configuration |
| offlineMessage | string | Offline auto-reply |

## 5. Server Architecture Diagram

```mermaid
graph TD
    A[Client Request] --> B[Next.js API Route]
    B --> C[Middleware Layer]
    C --> D[Validation Layer]
    D --> E[Service Layer]
    E --> F[Prisma Client]
    F --> G[MySQL Database]
    
    E --> H[Socket.io Service]
    H --> I[Real-time Clients]
    
    subgraph "Next.js Server"
        B
        C
        D
        E
        F
        H
    end
    
    subgraph "External Services"
        G
        I
    end
```

## 6. Data Model

### 6.1 Data Model Definition

```mermaid
erDiagram
    USERS ||--o{ WEBSITES : manages
    USERS ||--o{ CHATS : handles
    WEBSITES ||--o{ VISITORS : tracks
    WEBSITES ||--o{ CHATS : hosts
    WEBSITES ||--|| WIDGET_SETTINGS : has
    VISITORS ||--o{ CHATS : initiates
    CHATS ||--o{ MESSAGES : contains
    USERS ||--o{ ACTIVITY_LOGS : generates

    USERS {
        string id PK
        string email UK
        string password_hash
        string name
        string role
        boolean is_active
        datetime created_at
        datetime updated_at
    }
    
    ROLES {
        string id PK
        string name UK
        json permissions
        datetime created_at
    }
    
    WEBSITES {
        string id PK
        string user_id FK
        string name
        string domain
        string api_key UK
        boolean is_active
        datetime created_at
        datetime updated_at
    }
    
    VISITORS {
        string id PK
        string website_id FK
        string session_id UK
        string ip_address
        string user_agent
        string country
        datetime last_seen
        datetime created_at
    }
    
    CHATS {
        string id PK
        string website_id FK
        string visitor_id FK
        string assigned_to FK
        string status
        string resolution
        datetime started_at
        datetime ended_at
        datetime created_at
        datetime updated_at
    }
    
    MESSAGES {
        string id PK
        string chat_id FK
        string sender_type
        string sender_id
        string content
        string type
        json metadata
        datetime created_at
    }
    
    WIDGET_SETTINGS {
        string id PK
        string website_id FK
        string primary_color
        string position
        string welcome_message
        json business_hours
        string offline_message
        string custom_css
        string widget_size
        datetime created_at
        datetime updated_at
    }
    
    ACTIVITY_LOGS {
        string id PK
        string user_id FK
        string action
        string resource_type
        string resource_id
        json metadata
        string ip_address
        datetime created_at
    }
```

### 6.2 Data Definition Language

**Users Table**
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'admin', 'agent') DEFAULT 'agent',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);
```

**Websites Table**
```sql
CREATE TABLE websites (
    id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_api_key (api_key),
    INDEX idx_domain (domain)
);
```

**Visitors Table**
```sql
CREATE TABLE visitors (
    id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
    website_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(64) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    country VARCHAR(2),
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_website_last_seen (website_id, last_seen)
);
```

**Chats Table**
```sql
CREATE TABLE chats (
    id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
    website_id VARCHAR(36) NOT NULL,
    visitor_id VARCHAR(36) NOT NULL,
    assigned_to VARCHAR(36),
    status ENUM('waiting', 'ongoing', 'closed', 'resolved') DEFAULT 'waiting',
    resolution TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
    FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_website_status (website_id, status),
    INDEX idx_assigned_to (assigned_to)
);
```

**Messages Table**
```sql
CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
    chat_id VARCHAR(36) NOT NULL,
    sender_type ENUM('admin', 'visitor', 'system') NOT NULL,
    sender_id VARCHAR(36),
    content TEXT NOT NULL,
    type ENUM('text', 'file', 'image') DEFAULT 'text',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    INDEX idx_chat_created (chat_id, created_at),
    INDEX idx_sender (sender_type, sender_id)
);
```

**Widget Settings Table**
```sql
CREATE TABLE widget_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
    website_id VARCHAR(36) UNIQUE NOT NULL,
    primary_color VARCHAR(7) DEFAULT '#2563eb',
    position ENUM('bottom-right', 'bottom-left') DEFAULT 'bottom-right',
    welcome_message VARCHAR(500) DEFAULT 'Hello! How can we help you today?',
    business_hours JSON,
    offline_message VARCHAR(500) DEFAULT 'We are currently offline. Leave a message and we will get back to you.',
    custom_css TEXT,
    widget_size ENUM('compact', 'normal') DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);
```

## 7. Socket.io Implementation

### Server-side Socket Events
```javascript
// Connection handling
io.on('connection', (socket) => {
  socket.on('join-website', (data) => {
    // Join website room for targeted messaging
  });
  
  socket.on('chat-message', (data) => {
    // Broadcast message to relevant users
    io.to(`website-${data.websiteId}`).emit('new-message', data);
  });
  
  socket.on('typing-start', (data) => {
    io.to(`chat-${data.chatId}`).emit('user-typing', data);
  });
  
  socket.on('typing-stop', (data) => {
    io.to(`chat-${data.chatId}`).emit('user-stopped-typing', data);
  });
});
```

### Client-side Widget Script
```javascript
// Widget loader script
(function() {
  const script = document.currentScript;
  const apiKey = script.getAttribute('data-key');
  
  // Load widget configuration
  fetch(`${API_BASE}/api/widget/config?apiKey=${apiKey}`)
    .then(response => response.json())
    .then(config => {
      initializeWidget(config);
    });
    
  function initializeWidget(config) {
    // Create widget container
    const widget = document.createElement('div');
    widget.id = 'helpdesk-widget';
    widget.innerHTML = generateWidgetHTML(config);
    
    // Initialize Socket.io connection
    const socket = io(API_BASE);
    socket.emit('join-website', { apiKey });
    
    // Handle real-time events
    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleTypingIndicator);
  }
})();
```

## 8. Security Implementation

### API Key Validation
```javascript
// Middleware for API key validation
const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  const website = await prisma.websites.findUnique({
    where: { api_key: apiKey, is_active: true }
  });
  
  if (!website) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  req.website = website;
  next();
};
```

### Domain Validation
```javascript
// Domain whitelist validation
const validateDomain = (req, res, next) => {
  const origin = req.headers.origin || req.headers.referer;
  const allowedDomains = req.website.domain.split(',');
  
  if (!origin || !allowedDomains.some(domain => origin.includes(domain.trim()))) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }
  
  next();
};
```

### Rate Limiting
```javascript
// Rate limiting configuration
const rateLimit = require('express-rate-limit');

const widgetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 messages per minute
  skipSuccessfulRequests: true
});
```

## 9. Folder Structure

```
helpdesk-system/
├── app/
│   ├── admin/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── websites/
│   │   ├── chats/
│   │   └── analytics/
│   ├── api/
│   │   ├── auth/
│   │   ├── websites/
│   │   ├── chats/
│   │   ├── messages/
│   │   └── widget/
│   └── layout.tsx
├── components/
│   ├── admin/
│   ├── widget/
│   └── shared/
├── lib/
│   ├── prisma.ts
│   ├── socket.ts
│   ├── auth.ts
│   └── utils.ts
├── public/
│   └── widget.js
├── prisma/
│   └── schema.prisma
├── middleware.ts
├── next.config.js
└── package.json
```

## 10. Production Deployment Considerations

### Environment Variables
```bash
# Database
DATABASE_URL="mysql://user:password@localhost:3306/helpdesk"

# Authentication
JWT_SECRET="your-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-nextauth-secret"

# Socket.io
SOCKET_IO_PORT=3001
REDIS_URL="redis://localhost:6379"

# Security
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
CORS_ORIGIN="https://yourdomain.com"
```

### Performance Optimization
- Implement Redis for Socket.io scaling across multiple servers
- Use CDN for widget script delivery
- Enable database connection pooling
- Implement message queuing for high-volume chat scenarios
- Add database indexes for frequently queried fields
- Implement caching for widget configurations
- Use lazy loading for analytics data

# Chat app Backend — Nest.js + Prisma + PostgreSQL

#Technologies Used

Nest.js – Backend framework

Prisma ORM – Database access

PostgreSQL – Database

Passport.js – Authentication

JWT – Token-based auth

Socket.io Gateway – Real-time messaging

TypeScript – Strong typing

bcrypt – Password hashing

# Features

✔ User signup & login  
✔ JWT Authentication  
✔ Direct chat (1-to-1)  
✔ Group chat with participant management  
✔ Edit/delete messages  
✔ View conversation messages  
✔ Search conversations  
✔ Leave group feature  
✔ Prisma ORM with PostgreSQL  
✔ Socket.io Gateway for real-time communication  

---

# Getting Started

## Clone the repository

```bash
git clone <your-repo-url>
cd backend
```

## Install dependencies
```bash
npm install
```

## Create `.env` file

```
DATABASE_URL="postgresql://username:password@localhost:5432/chatdb?schema=public"
JWT_SECRET="mysecret"
JWT_EXPIRES_IN="7d"
```

## Setup PostgreSQL + Prisma

Run migrations:
```bash
npx prisma migrate dev
```

Generate client:
```bash
npx prisma generate
```

## Start the development server
```bash
npm run start:dev
```

URL:
```
http://localhost:5000
```

---

# AUTH ENDPOINTS (`/auth`)

### **POST /auth/signup**
**Body:**
```json
{
  "email": "test@example.com",
  "username": "john",
  "password": "123456"
}
```

### **POST /auth/login**
**Body:**
```json
{
  "username": "john",
  "password": "123456"
}
```

---

# USER ENDPOINTS (`/users`)

### **GET /users**
List all users except logged-in user.

### **GET /users/:id**
Get user by ID.

---

# CHAT ENDPOINTS (`/chat`)

## Conversations

### **GET /chat/conversations**
Get all conversations for logged-in user.

### **POST /chat/conversations/direct**
**Body:**
```json
{ "otherUserId": "abc123" }
```

### **POST /chat/conversations/group**
**Body:**
```json
{ "name": "Group Name", "participantIds": ["u1", "u2"] }
```

### **POST /chat/conversations/:id/participants**
Add users to a group.

### **POST /chat/conversations/:id/leave**
Leave group.

### **GET /chat/conversations/search?q=term**
Search conversations by name.

---

## Messages

### **GET /chat/conversations/:id/messages**
Get messages of a conversation.

### **POST /chat/messages**
**Body:**
```json
{ "conversationId": "conv123", "content": "Hello" }
```

### **PATCH /chat/messages/:id**
**Body:**
```json
{ "content": "Updated text" }
```

### **DELETE /chat/messages/:id**
Deletes a message.


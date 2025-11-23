
## Features

### Authentication

-   User login
-   User signup
-   Token-based authentication using JWT
-   Persistent session using `localStorage`

### Conversations

-   List all conversations (direct + group)
-   Search conversations by name
-   Create direct conversations
-   Create group conversations with multiple participants
-   Leave group conversations
-   Auto-update UI after creation/removal

### Messaging

-   Send messages instantly
-   Receive real-time updates without refreshing (Socket.IO)
-   Automatic room joining when opening a conversation
-   Live message updates:
    -   New messages
    -   Edited messages
    -   Deleted messages

### Message Editing & Deleting

-   Right-click a message to open edit/delete menu
-   Edit modal with live preview
-   Delete with instant UI update

###  User Management

-   Fetch all users
-   Search users inside group creation modal
-   Select/deselect users
-   Smooth UI animations/products

### Clean UI & Modern Design

-   Built with TailwindCSS
-   Responsive layout
-   Beautiful dark theme
-   Glass effects, smooth transitions & rounded elements

------------------------------------------------------------------------

## Technologies Used

### **Core**

-   Next.js 14 / 16 (App Router)
-   React 18+
-   TypeScript

### **UI / Styling**

-   TailwindCSS
-   clsx
-   Custom UI components (Button, Input, Spinner)

### **Networking**

-   Axios (API client)
-   SWR (data fetching)
-   Socket.IO client

### **State / Context**

-   React Context API (`AuthContext`)
-   Local Storage token handling

------------------------------------------------------------------------

## Running the Frontend (Local Setup)

### 1. **Clone the repository**

``` sh
git clone https://github.com/yourusername/chatbee-frontend.git
cd chatbee-frontend
```

### 2. **Install dependencies**

``` sh
npm install
```

### 3. **Set environment variables**

Create a file:

    .env.local

Add:

``` env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. **Start development server**

``` sh
npm run dev
```

The app will run at:

    http://localhost:3000

------------------------------------------------------------------------


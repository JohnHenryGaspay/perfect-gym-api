# Perfect Gym Lead API

API endpoint to forward Webflow form submissions to Perfect Gym CRM.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and add your Perfect Gym credentials:
```
CLIENT_ID=your_actual_client_id
CLIENT_SECRET=your_actual_client_secret
PORT=3000
PERFECT_GYM_BASE_URL=https://chasingbetter247.perfectgym.com.au
CLUB_ID=3
SOURCE=Webflow Form
```

### 3. Start the Server
```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### POST /lead
Receives form data from Webflow and creates a lead in Perfect Gym.

**Request Body:**
```json
{
  "Name": "John Doe",
  "Email": "john@example.com",
  "Phone": "+61 400 000 000"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "leadId": 12345
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Error message",
  "details": {}
}
```

## Webflow Setup

1. In your Webflow form settings, set the **Action** to:
   ```
   https://your-server-domain.com/lead
   ```
   
2. Ensure your form field names match:
   - **Name** - Full name input
   - **Email** - Email input
   - **Phone** - Phone input

3. Set form method to **POST**

## Testing with Postman

**URL:** `http://localhost:3000/lead`  
**Method:** POST  
**Headers:**
- `Content-Type: application/json`

**Body (raw JSON):**
```json
{
  "Name": "Jane Smith",
  "Email": "jane@test.com",
  "Phone": "+61 412 345 678"
}
```

## Deployment

Deploy to a cloud platform with HTTPS support:
- **Heroku**: Easy Node.js deployment
- **Railway**: Modern deployment platform
- **DigitalOcean App Platform**: Simple hosting
- **AWS/Azure**: Enterprise options

**Important:** Always use HTTPS in production to protect API credentials.

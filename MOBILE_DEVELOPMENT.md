# Mobile Development Setup

This guide helps you set up the frontend for mobile testing and resolve CORS issues.

## Quick Setup for Mobile Testing

### 1. Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for your IPv4 Address (usually starts with 192.168.x.x)

**Mac/Linux:**
```bash
ifconfig | grep inet
```

### 2. Create Environment File

Create a `.env.local` file in the project root:

```env
# Replace 192.168.1.12 with your actual computer IP
VITE_API_BASE_URL=http://192.168.1.12:3001/api
VITE_API_SECRET=your_api_secret_here
```

### 3. Start Development Server

For mobile development:
```bash
npm run dev:mobile
```

This will:
- Use your mobile environment configuration
- Make the server accessible from your mobile device
- Use your local IP address for API calls (if you have a local backend)

### 4. Access from Mobile

Open your mobile browser and navigate to:
```
http://[YOUR_COMPUTER_IP]:8080
```

Example: `http://192.168.1.12:8080`

## CORS Solutions

### Option 1: Use Local Backend (Recommended)
- Run your backend locally
- Update `.env.local` to point to your local backend
- Example: `VITE_API_BASE_URL=http://192.168.1.12:3001/api`

### Option 2: Backend CORS Configuration
Ask your backend team to add these origins to CORS:
```
http://localhost:8080
http://127.0.0.1:8080
http://192.168.*.*:8080
```

### Option 3: Development Proxy (Alternative)
If you can't modify backend CORS, you can add a proxy in `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://meemhome.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
```

## Environment Files

- `.env.example` - Template for environment variables
- `.env.local` - Your personal development settings (not committed)
- `.env.mobile` - Template for mobile development

## Troubleshooting

### Network Error
- Check if your computer and mobile are on the same network
- Verify the IP address is correct
- Make sure Windows/Mac firewall allows the port

### CORS Error
- Verify your API URL in `.env.local`
- Check backend CORS configuration
- Try using local backend if available

### Can't Access from Mobile
- Make sure you're using `npm run dev:mobile`
- Check that Vite is binding to all interfaces (0.0.0.0)
- Verify your mobile and computer are on the same Wi-Fi network
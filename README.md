# SmartQueue — Smart Queue Management

## Project Structure

```
smartqueue/
├── readme.md
├── backend/
│   ├── server.js
│   └── package.json
│   └── package-lock.json
└── frontend/
    ├── index.html
    ├── admin.html
    ├── adminlogin.html
    ├── login.html
    ├── userstatus.html
    └── css/
        ├── style.css
        ├── admin.css
        └── people.png
```

## Setup

```bash
npm install
npm start
# Server runs on http://localhost:5000
```

For development with auto-reload:
```bash
npm start
```

## User Flow
1. Admin logs in → opens Admin Panel → clicks "QR Code" to generate QR
2. User scans QR code (points to login.html)
3. User enters mobile number → receives OTP (printed to console in demo mode)
4. User verifies OTP → signs in with Gmail → enters name + age
5. User is added to queue → redirected to live status page
6. Admin marks users Complete or Absent → queue advances in real time

## Features
- Real-time updates via Socket.io (no page refresh)
- QR code entry system
- Gmail + OTP dual authentication
- Queue position, rank, and estimated wait time for each user
- Admin panel with Waiting / Completed / Absent panels
- Pastel minimal design system with DM Sans + Playfair Display

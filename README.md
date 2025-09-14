# Stork Stakes - Baby Prediction Game

A fun web application for expecting parents to create prediction games where friends and family can guess baby details like weight, length, and birth date. Perfect for baby showers and building excitement before the big day!

## ✨ Features

- **🎮 Create Prediction Games:** Parents can easily create custom baby prediction games
- **🔗 Shareable Links:** Each game gets a unique, shareable link for easy distribution
- **👥 Guest-Friendly:** Friends can submit predictions without creating accounts
- **📊 Live Results:** Real-time overview of all predictions and published results
- **🎯 Custom Questions:** Default questions for weight, length, and birth date
- **🔒 Creator Controls:** Game creators can manage results and publish questions selectively
- **📱 Responsive Design:** Works seamlessly on desktop, tablet, and mobile devices

## 🛠 Tech Stack

- **Frontend:** Next.js 15.5.3 (App Router), TypeScript, TailwindCSS 4, shadcn/ui
- **Backend:** Next.js API Routes with TypeScript
- **Database:** Prisma ORM with SQLite (development) / PostgreSQL (production)
- **Authentication:** Simple email/password with localStorage sessions
- **UI Components:** Radix UI primitives with custom styling
- **Notifications:** Sonner for elegant toast messages

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd stork-stakes
   npm install
   ```

2. **Set up the database:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) to view the app.

### 🎮 How to Use

1. **Create an Account:** Register with your email and name
2. **Create a Game:** Enter a fun name like "The Great Baby Bet 2025"
3. **Share the Link:** Copy and share the unique game link with friends
4. **Collect Predictions:** Friends visit the link and submit their guesses
5. **Manage Results:** Enter actual baby details and publish results as they become available
6. **View Overview:** See all predictions and published results in a beautiful table

---

## 🤝 Sharing with Friends

### Method 1: Share the Code Repository

**For developers who want to run their own instance:**

1. **Share this repository URL**
2. **Provide setup instructions:**
   ```bash
   git clone <repository-url>
   cd stork-stakes
   npm install
   npx prisma db push
   npm run dev
   ```
3. **Each person runs their own local instance on localhost:3000**

### Method 2: Host for Others (Recommended)

**For non-technical friends to easily access:**

1. **Deploy to a hosting platform:**
   - **Vercel** (recommended): 
     - Connect your GitHub repo to Vercel
     - Add PostgreSQL database (Vercel Postgres or Supabase)
     - Update `DATABASE_URL` in environment variables
   - **Railway/Render**: Similar process with built-in PostgreSQL

2. **Share the hosted URL** (e.g., `https://your-app.vercel.app`)

3. **Friends can access directly** without any setup!

### Method 3: Local Network Sharing

**For testing with friends on the same network:**

1. **Start your local server:**
   ```bash
   npm run dev
   ```

2. **Find your local IP address:**
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` or `ip addr show`

3. **Share the network URL:**
   - Example: `http://192.168.1.100:3000`
   - Friends on the same WiFi can access this URL

---

## 🔧 Development & Customization

### Database Schema
The app uses a simple but effective schema:
- **Users:** id, email, password, name
- **Games:** id, name, createdBy, publishedQuestions, actualResults
- **Bets:** id, question, answer, gameId, userId

### Key Features
- **Soft Deletes:** Games are marked as deleted, not permanently removed
- **JSON Storage:** Published questions and actual results stored as JSON
- **Foreign Key Constraints:** Maintains data integrity between users and games

### Adding Custom Questions
Modify the default questions in `/src/app/games/new/page.tsx`:
```typescript
const defaultBets = [
  { question: 'Baby\'s Weight (in kg)', userId: user.id },
  { question: 'Baby\'s Length (in cm)', userId: user.id },
  { question: 'Birth Date', userId: user.id },
  // Add your custom questions here
];
```

### Environment Setup for Production

Create a `.env.local` file:
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/stork_stakes"

# Optional: Add other environment variables as needed
```

---

## 📱 User Experience

### For Game Creators:
1. Register → Create Game → Share Link → Manage Results → Publish Results

### For Participants:
1. Click Link → Submit Predictions → View Published Results

### Mobile-Friendly Features:
- Responsive design works on all screen sizes
- Touch-friendly buttons and forms
- Easy sharing via mobile messaging apps

---

## 🐳 Docker Deployment (Optional)

For containerized deployment:

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/stork_stakes
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: stork_stakes
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run with: `docker-compose up --build`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🎉 Perfect for:
- Baby showers and gender reveal parties
- Family and friend gatherings
- Remote celebration participation
- Creating lasting memories of the prediction fun!

**Happy predicting! 🍼👶**

# How to Deploy Code Migrator Web App

## Option 1: Deploy to Netlify (Easiest)

### Prerequisites
- GitHub account
- Netlify account (free tier is sufficient)

### Steps

1. **Create a GitHub repository and push your code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/code-migrator.git
   git push -u origin main
   ```

2. **Deploy to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com/) and log in
   - Click "New site from Git"
   - Select GitHub as your Git provider and authorize Netlify
   - Select your repository
   - Netlify will automatically detect the netlify.toml configuration
   - Click "Deploy site"

3. **That's it!**
   - Netlify will deploy your site and provide a URL (e.g., `https://your-site-name.netlify.app`)
   - You can change the site name in Netlify settings if desired

## Option 2: Deploy to GitHub Pages

### Prerequisites
- GitHub account

### Steps

1. **Create a GitHub repository and push your code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/code-migrator.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to the "GitHub Pages" section
   - Under "Source", select "main" branch and "/src" folder
   - Click "Save"

3. **Wait for deployment**
   - GitHub will provide a URL where your site is published
   - It typically takes a few minutes for the site to become available

## Option 3: Run Locally and Share via ngrok

### Prerequisites
- Node.js installed
- ngrok installed (`npm install -g ngrok` or download from [ngrok.com](https://ngrok.com/))

### Steps

1. **Start the local server**
   ```bash
   npm start
   ```

2. **Create a tunnel with ngrok**
   ```bash
   ngrok http 3000
   ```

3. **Share the provided URL**
   - ngrok will provide a public URL (e.g., `https://abc123.ngrok.io`)
   - This URL can be shared with anyone, and they can access your app
   - The tunnel lasts as long as ngrok is running on your computer

## Option 4: Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier is sufficient)

### Steps

1. **Create a GitHub repository and push your code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/code-migrator.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com/) and log in
   - Click "New Project"
   - Import your GitHub repository
   - Configure the project:
     - Output Directory: src
   - Click "Deploy"

3. **That's it!**
   - Vercel will deploy your site and provide a URL
   - The site will be automatically updated when you push changes to GitHub
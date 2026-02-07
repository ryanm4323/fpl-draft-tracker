# FPL Draft Tracker - Spreadsheet Merchants 3.0

## 🚀 Deploy to Netlify (Step-by-Step)

### Step 1: Create a GitHub Account (if you don't have one)
1. Go to https://github.com
2. Click "Sign up"
3. Follow the steps to create an account

### Step 2: Create a New Repository
1. Go to https://github.com/new
2. Repository name: `fpl-draft-tracker`
3. Make it **Public**
4. Click "Create repository"

### Step 3: Upload Your Files
1. On your new repository page, click "uploading an existing file"
2. Drag and drop ALL these files:
   - `index.html`
   - `app.jsx`
   - `netlify.toml`
   - `package.json`
   - The entire `netlify` folder (with the functions inside)
3. Scroll down and click "Commit changes"

### Step 4: Deploy to Netlify
1. Go to https://netlify.com
2. Click "Sign up" and choose "Sign up with GitHub"
3. Authorize Netlify to access your GitHub
4. Click "Add new site" → "Import an existing project"
5. Click "Deploy with GitHub"
6. Find and click your `fpl-draft-tracker` repository
7. Leave all settings as default
8. Click "Deploy site"

### Step 5: Wait for Deployment
- Netlify will automatically build and deploy your site
- This takes about 1-2 minutes
- You'll see "Site is live" when it's ready

### Step 6: Get Your Site URL
- Your site will be at: `https://random-name-12345.netlify.app`
- Click "Site settings" → "Change site name" to customize it
- Example: `spreadsheet-merchants.netlify.app`

### Step 7: Test It!
1. Visit your new site URL
2. Enter password: `merchants2026`
3. Click "Refresh Data"
4. Your league standings should appear! 🎉

## 📝 Notes

- The site is completely free on Netlify
- It will automatically fetch live data from FPL Draft API
- Waiver tracking saves to your browser's storage
- Your entry ID (81877) is already configured

## 🔧 To Update the Site Later

1. Go to your GitHub repository
2. Click on the file you want to edit (e.g., `app.jsx`)
3. Click the pencil icon to edit
4. Make your changes
5. Click "Commit changes"
6. Netlify will automatically redeploy (takes 1-2 minutes)

## ⚙️ Changing Settings

To change the password or league name:
1. Edit `app.jsx` in GitHub
2. Find the line with `password: "merchants2026"`
3. Change it to your preferred password
4. Commit the change
5. Wait for Netlify to redeploy

## 🆘 Troubleshooting

**Site not loading?**
- Wait 2-3 minutes after deployment
- Clear your browser cache
- Check Netlify deploy logs for errors

**Data not loading?**
- Open browser DevTools (F12) → Console
- Look for error messages
- Make sure entry ID is correct (81877)

**Need help?**
- Check Netlify deploy logs
- Look at the Console in browser DevTools
- The serverless function logs will show API call details

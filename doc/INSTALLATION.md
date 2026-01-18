# Installation Guide

Follow these steps to set up the ToBuy List project on your local machine.

## 📋 Prerequisites
- **Node.js**: Version 18 or higher recommended.
- **npm**: Usually comes with Node.js.

## 🚀 Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/gianlucacornacchia/tobuylist.git
   cd tobuylist
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the app**:
   Open `http://localhost:5173` in your favorite browser.

## 📱 Testing on Mobile
To test the app's mobile-specific features (like swipe gestures or safe areas) on a real device:
1. Ensure your phone and computer are on the same Wi-Fi network.
2. Run the dev server with the `--host` flag:
   ```bash
   npm run dev -- --host
   ```
3. Use the IP address provided in the terminal (e.g., `http://192.168.1.XX:5173`) to open the app on your phone.

## 🏗 Building for Production
To create a production-ready build in the `dist/` folder:
```bash
npm run build
```

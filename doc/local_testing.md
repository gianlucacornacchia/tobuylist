# Local Testing Guide

To test the ToBuy List application on your mobile device or another computer within your local network, follow these steps.

## 1. Start the Development Server

You need to run the development server with the `--host` flag to expose it to your local network.

Open your terminal in the project directory and run:

```bash
npm run dev -- --host
```

## 2. Connect from Your Mobile Device

1.  Ensure your mobile device is connected to the **same Wi-Fi network** as your computer.
2.  Open the web browser on your phone (Chrome, Safari, etc.).
3.  Enter the **Network URL** provided in the terminal output.

   Typically, it looks like:
   `http://<YOUR_COMPUTER_IP>:5173/tobuylist/`

   Example: `http://192.168.1.107:5173/tobuylist/`

## 3. Troubleshooting

If you cannot connect:
-   **Firewall**: Check if your computer's firewall is blocking incoming connections on port 5173. You may need to allow Node.js or the port through the firewall.
-   **Network**: Verify that both devices are on the exact same Wi-Fi network (no guest networks that segregate clients).
-   **IP Address**: If the IP address printed in the terminal doesn't work, verify your computer's local IP address using `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

## 4. Things to Test

Once connected, try the following interactions to ensure the mobile experience is smooth:

-   **Add Items**: Add enough items to overflow the screen.
-   **Scrolling**: Verify you can scroll the list up and down without accidentally triggering a swipe action.
-   **Swiping**: Swipe items left (to delete) and right (to buy/unbuy).
-   **Keyboard**: distinct mobile keyboard handling (verify the view doesn't break when the keyboard opens).
-   **Offline Mode**: Turn on Airplane mode and see if the app still functions (if PWA features are active).

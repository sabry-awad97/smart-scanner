# Smart Scanner

A modern desktop application built with Tauri and React for network scanning and IP camera connectivity. Features a beautiful dark-themed UI with real-time network scanning and camera streaming capabilities.

## Features

### Network Scanning
- **Port Discovery**: Scans your local network (192.168.1.x) for open ports
- **Service Detection**: Identifies common services running on open ports:
  - Web Services (HTTP/HTTPS): 80, 443, 8080-8082, 8443
  - File Transfer: FTP (20, 21)
  - Remote Access: SSH (22), Telnet (23), RDP (3389)
  - Mail Services: SMTP (25), POP3 (110), IMAP (143)
  - Databases: MySQL (3306), PostgreSQL (5432)
  - Network Services: DNS (53), SMB (445)
  - IoT & Streaming: RTSP (554), MQTT (1883)
  - IP Cameras: Common camera ports (4747, 8080-8082)

### Camera Integration
- Connect to IP cameras using discovered URLs
- Support for common camera URL patterns
- Real-time camera stream preview
- Image capture and history
- Automatic image resizing for optimal performance

### User Interface
- Modern, dark-themed design with gradients
- Real-time scanning progress visualization
- Toast notifications for discovered ports
- Interactive port list with service descriptions
- Scrollable capture history with hover effects
- Responsive layout with smooth animations

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run tauri dev
   ```

## Usage

### Network Scanning
1. Click the scan button to start discovering open ports
2. View real-time scanning progress
3. Found ports will appear in a scrollable list with:
   - IP address and port number
   - Service description
   - Visual indicators for open ports

### Camera Connection
1. Select a discovered camera port or enter a camera URL manually
2. Choose from predefined camera presets
3. Connect to view the camera stream
4. Capture images using the capture button
5. View captured images in the history panel

## Technical Details

### Built With
- [Tauri](https://tauri.app/) - Desktop framework
- [React](https://reactjs.org/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Lucide Icons](https://lucide.dev/) - Icons
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications

### Architecture
- Rust backend for network scanning and camera operations
- React frontend with TypeScript for type safety
- Real-time communication using Tauri events
- Concurrent port scanning for improved performance
- Modern component-based UI architecture

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

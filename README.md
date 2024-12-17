# Smart Scanner

A powerful desktop application built with Tauri and React for network scanning and IP camera integration. This application provides a modern, dark-themed interface for discovering network devices and connecting to IP cameras, with special support for the IP Webcam Android app.

## 🌟 Features

### 🔍 Network Discovery

- **Intelligent Port Scanning**: Automatically scans your local network (192.168.1.x) for active devices
- **Service Detection**: Identifies common services on open ports:
  - Web Services: HTTP(S) (80, 443, 8080-8082, 8443)
  - Camera Streams: RTSP (554), Camera Ports (4747, 8080-8082)
  - Remote Access: SSH (22), Telnet (23), RDP (3389)
  - File Transfer: FTP (20, 21), SMB (445)
  - IoT & Messaging: MQTT (1883)
  - Database Services: MySQL (3306), PostgreSQL (5432)

### 📸 Camera Integration

- **IP Webcam Support**: Seamless integration with the IP Webcam Android app
- **Real-time Streaming**: Low-latency video streaming with configurable quality
- **Image Capture**: Quick snapshot functionality with automatic saving
- **Multi-format Support**: Compatible with MJPEG, JPEG, and other common formats
- **Adaptive Quality**: Automatic stream quality adjustment based on network conditions

### 💻 User Interface

- **Modern Design**: Sleek, dark-themed interface with smooth animations
- **Real-time Updates**: Live scanning progress and device discovery notifications
- **Interactive Elements**: Clickable device list with detailed service information
- **Capture Gallery**: Visual history of captured images with preview
- **Responsive Layout**: Adapts to different window sizes and orientations

## 🚀 Getting Started

### Prerequisites

- Node.js 16 or later
- Rust toolchain
- Android device with IP Webcam app (for camera functionality)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/sabry-awad97/smart-scanner.git
   cd smart-scanner
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run tauri dev
   ```

### Setting up IP Webcam

1. Install [IP Webcam](https://play.google.com/store/apps/details?id=com.pas.webcam) from Google Play Store
2. Open IP Webcam app on your Android device
3. Scroll down and tap "Start server"
4. Note the IP address shown (e.g., http://192.168.1.100:8080)
5. Enter this URL in Smart Scanner to connect

## 🛠️ Technical Architecture

### Backend (Rust)

- **Concurrent Network Scanning**: Efficient port scanning using Tokio
- **Error Handling**: Comprehensive error management with thiserror
- **Image Processing**: High-performance image manipulation with image-rs
- **State Management**: Thread-safe state handling with Arc and Mutex
- **Async Operations**: Non-blocking I/O operations for better performance

### Frontend (React + TypeScript)

- **Type Safety**: Full TypeScript integration
- **Component Architecture**: Modular, reusable components
- **State Management**: Efficient React hooks and context
- **Styling**: Tailwind CSS for responsive design
- **UI Components**: Custom components with Radix UI
- **Notifications**: Toast notifications using Sonner

## 📦 Dependencies

### Core Dependencies

```toml
[dependencies]
tauri = { version = "2" }
tokio = { version = "1.0", features = ["full"] }
image = "0.25.5"
reqwest = "0.12.9"
thiserror = "2.0"
```

### Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^19",
    "tailwindcss": "^3"
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [IP Webcam](https://play.google.com/store/apps/details?id=com.pas.webcam) for providing the Android camera server
- [Tauri](https://tauri.app/) for the desktop application framework
- [React](https://reactjs.org/) for the frontend framework
- [Rust](https://www.rust-lang.org/) for the powerful backend language

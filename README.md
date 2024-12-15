# Smart Scanner

<div align="center">
  <img src="docs/assets/logo.png" alt="Smart Scanner Logo" width="200"/>

A modern, high-performance document scanning application built with Tauri, React, and Rust.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Rust](https://img.shields.io/badge/Rust-1.70%2B-orange.svg)](https://www.rust-lang.org)
[![React](https://img.shields.io/badge/React-18.0%2B-blue.svg)](https://reactjs.org)
[![Tauri](https://img.shields.io/badge/Tauri-2.0%2B-purple.svg)](https://tauri.app)

</div>

## Features

- 🎥 Real-time camera streaming with optimized performance
- 📸 Quick image capture with automatic processing
- 💾 Efficient image saving with timestamp-based naming
- 🖼️ Recent captures history with thumbnail preview
- 🎨 Modern, responsive UI with dark theme
- ⚡ Low-latency image processing using Rust
- 🔄 Automatic error recovery with exponential backoff

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Rust](https://www.rust-lang.org/) (1.70 or later)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/sabry-awad97/smart-scanner.git
cd smart-scanner
```

2. Install dependencies:

```bash
# Install frontend dependencies
npm install

# Install Rust dependencies (automatic during build)
```

3. Configure the camera URL:
   - Open `src/App.tsx`
   - Update the `cameraUrl` constant with your IP camera URL

## Development

Start the development server:

```bash
npm run tauri dev
```

This will launch the application in development mode with hot-reload enabled.

## Building

Create a production build:

```bash
npm run tauri build
```

The built application will be available in the `src-tauri/target/release` directory.

## Architecture

### Frontend (React + TypeScript)

- Modern React with TypeScript for type safety
- Tailwind CSS for styling
- Shadcn UI components
- Real-time updates using Tauri events

### Backend (Rust)

- High-performance image processing
- Efficient memory management
- Robust error handling
- Optimized network communication

## Performance Optimizations

- Image preloading for smoother streaming
- Efficient JPEG encoding with quality control
- Smart frame rate management
- TCP optimizations for better network performance
- Memory-efficient buffer management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Tauri](https://tauri.app/) for the framework
- [React](https://reactjs.org/) for the UI library
- [Shadcn UI](https://ui.shadcn.com/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide Icons](https://lucide.dev/) for the icons

# NodeAzure

A Node.js/Express web application demonstrating the capabilities of Azure Maps, showcasing various maps tools, layers, and functionalities.

## Overview

NodeAzure is a demo application built with Node.js and Express that provides an interactive showcase of Azure Maps features. The application displays mapping capabilities and demonstrates integration with Azure's mapping services.

## Features

- Interactive Azure Maps visualization
- Multiple map layers and tools
- Express.js backend for serving the application
- File upload functionality with multer
- CORS support for cross-origin requests
- Environment variable configuration with dotenv

## Tech Stack

- **Runtime:** Node.js
- **Backend Framework:** Express.js
- **HTTP Method Support:** CORS
- **File Handling:** Express-fileupload, Multer
- **Environment Config:** dotenv
- **UI Components:** Popper.js for positioning

## Prerequisites

- Node.js v10.15.3+
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/zack09holland/NodeAzure.git
cd NodeAzure
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with your Azure Maps configuration:
```env
# Add your configuration here
```

## Getting Started

Start the development server:

```bash
npm start
```

The application will run on `http://localhost:3000` (or your configured port).

## Available Scripts

- `npm start` - Start the Node.js server

## Project Structure

- `server.js` - Main application entry point
- `package.json` - Project dependencies and configuration

## Dependencies

- **express** (^4.16.3) - Web application framework
- **cors** (^2.8.5) - Cross-Origin Resource Sharing middleware
- **dotenv** (^8.2.0) - Environment variable management
- **express-fileupload** (^1.1.6) - File upload handling
- **multer** (^1.4.2) - Multipart form data handling
- **@popperjs/core** (^2.1.1) - Positioning library for tooltips/popovers
- **node-env-file** (^0.1.8) - Environment file parsing

## License

ISC

## Author

zack09holland

---

For more information about Azure Maps, visit the [Azure Maps Documentation](https://learn.microsoft.com/en-us/azure/azure-maps/).

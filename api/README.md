# Minecraft Server Management API Documentation
 
This API allows you to control and manage a Minecraft server through various endpoints.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download/current) installed (at least version 14 or higher)

### Installation

1. Clone this repository:

   ```sh
   git clone https://github.com/mooncorn/gameserverhub.git
   cd gameserverhub

2. Download and place `server.jar` file in the `gameservers/minecraft` directory (you can download it from [here](https://www.minecraft.net/en-us/download/server))
   - Note: If the file has a different name, rename it.

3. Create an `.env` file in the root directory of the `api` project. Copy the contents of `.env.example` file into the newly created `.env` file and assign the required environment variables.

4. Install the required dependencies:

   ```sh
   npm install

### Usage

1. Start the server:

   ```sh
   npm start

## Endpoints

### Start Minecraft Server

Starts the Minecraft server.

- **URL:** `/api/minecraft/start`
- **Method:** POST
- **Request Body:** None
- **Response:**
  - Success: 200 OK
    ```json
    {
      "message": "Minecraft server startup initiated"
    }
  - Error (server is already running): 400 Bad Request
    ```json
    {
        "errors": [
            {
                "message": "Server is online"
            }
        ]
    }

### Check Minecraft Server Status

Checks the status of the Minecraft server.

- **URL:** `/api/minecraft/status`
- **Method:** GET
- **Response:**
  - Success: 200 OK
    ```json
    {
      "status": "online"
    }
  - Success (when server is offline): 200 OK
    ```json
    {
      "status": "offline"
    }

### Stop Minecraft Server

Stops the Minecraft server gracefully.

- **URL:** `/api/minecraft/stop`
- **Method:** POST
- **Request Body:** None
- **Response:**
  - Success: 200 OK
    ```json
    {
      "message": "Minecraft server shutdown initiated"
    }
  - Error (when server is not running): 400 Bad Request
    ```json
    {
        "errors": [
            {
                "message": "Server is offline"
            }
        ]
    }

### Get Minecraft Server Console Logs

Reads the latest Minecraft server console logs.

- **URL:** `/api/minecraft/console`
- **Method:** GET
- **Request Body:** None
- **Response:**
  - Success: 200 OK
    ```json
    {
      "console": "logs"
    }
  - Error (when log file doesn't exist): 400 Bad Request
    ```json
    {
      "message": ""
    }

### Execute Minecraft Command

Executes a command on the Minecraft server console.

- **URL:** `/api/minecraft/cmd`
- **Method:** POST
- **Request Body:**
    ```json
    {
      "cmd": "your_command_here"
    }

- **Response:**
  - Success: 200 OK (no response body)
  - Error (when server is not running): 400 Bad Request
    ```json
    {
      "message": "Server offline"
    }
 
### Edit Minecraft Server Properties

Edit properties of the Minecraft server by updating the server.properties file. You can modify settings such as the world name, world seed, world type, and whether to generate structures.

- **URL:** `/api/minecraft/edit`
- **Method:** POST
- **Request Body:** JSON object containing the following fields:
  - **`name`** (required): The name of the world. 
  - **`seed`** (optional): The seed for world generation. Default: None.
  - **`type`** (optional): The type of world generation ('normal' | 'flat' | 'large_biomes' | 'amplified' | 'single_biome_surface') Default: normal.
  - **`generateStructures`** (optional): A boolean indicating whether to generate structures (e.g., villages, temples). Default: true.

- **Response:**
  - Success: 200 OK (no response body)
  
#### Example Usage

   POST /api/minecraft/edit <br />
   Content-Type: application/json
   ```json
   {
      "name": "myworld",
      "seed": "12345",
      "type": "flat",
      "generateStructures": true
   }
   ```

#### How it works

1. The endpoint reads the existing server.properties file, located in the Minecraft server directory.

2. It parses the current properties and updates the relevant ones based on the provided input.

3. The updated properties are written back to the server.properties file.

#### Error Handling

- If the server.properties file cannot be read or there is an error during the update, the endpoint will return an error response.

- Ensure that the Minecraft server is stopped before making changes to the properties, and start it again after making the modifications for the changes to take effect.

### Socket.io Events

This API utilizes Socket.io to emit real-time events to clients.

#### Events

- `minecraft/started`
   - Emitted when the Minecraft server has started.

- `minecraft/stopped`

   - Emitted when the Minecraft server has been completely stopped.

- `minecraft/consoleOutput`
   - Emitted to provide real-time console output from the Minecraft server.
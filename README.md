# Code Migrator

A tool for migrating code between programming languages while preserving logic and syntax.

## Features

- Support for Java, C++, COBOL, Pascal, and Go
- Syntax preservation during migration
- Logic preservation during migration 
- Syntax validation for migrated code
- Web interface for easy access

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd code-migrator
   ```

2. No additional dependencies are required for the basic web version.

### Running the Web Version

1. Start the local server:
   ```
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/
   ```

3. You can now use the web interface to migrate code between languages.

### Sharing with Others

To share the application with others on your local network:

1. Find your local IP address:
   - On Windows: Run `ipconfig` in Command Prompt
   - On macOS/Linux: Run `ifconfig` in Terminal

2. Others on the same network can access the application at:
   ```
   http://YOUR_IP_ADDRESS:3000/
   ```

3. For public sharing, consider deploying to a hosting service like:
   - Netlify
   - Vercel
   - GitHub Pages
   - Heroku

## How to Use

1. Select the source language
2. Select the target language
3. Enter or paste your source code
4. Click "Migrate Code"
5. View the migrated code in the result area
6. Click "Validate Syntax" to check for potential syntax issues

## Architecture

The application follows a parser-transformer-generator architecture:

1. **Parsers**: Convert source code into a language-agnostic Abstract Syntax Tree (AST)
2. **Migration Service**: Manages the transformation between languages
3. **Generators**: Convert the AST into target language code
4. **Validator**: Checks syntax of the generated code

## Limitations

- The current implementation provides basic syntax migration and may not handle all complex language features
- The syntax validator performs basic checks and is not a replacement for a full compiler or linter
- For complex code bases, some manual adjustments may be required after migration

## Future Enhancements

- Support for more programming languages
- Improved syntax validation with better error messages
- IDE plugins for direct integration
- API service for programmatic access

## License

This project is licensed under the MIT License - see the LICENSE file for details.cooltest123456
TESTINGGM

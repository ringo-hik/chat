# SWDP ChatOps Extension

A Visual Studio Code extension for SWDP (Software Development Process) ChatOps integration with one-click automation for weekly reporting and team collaboration.

## Features

- 🤖 **Automated Weekly Reports**: Generate comprehensive weekly reports from your git activity
- 🔄 **Interactive Feedback**: Provide feedback to refine and improve generated reports
- 🔐 **Secure Authentication**: Token-based authentication for API access
- 📊 **Activity Tracking**: Integration with git history for accurate reporting
- 💾 **Report Management**: Automatic saving of reports with timestamps

## Installation

1. Install the extension from the VS Code marketplace
2. Configure your authentication token in settings
3. Start generating weekly reports from the ChatOps panel

## Usage

### Initial Setup

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run "SWDP ChatOps: Check Authentication"
3. Enter your authentication token when prompted

### Generating Reports

1. Open the SWDP ChatOps panel in the Activity Bar
2. Click "Process Weekly Report" to generate a new report
3. Review the generated report
4. Provide feedback if needed to refine the report
5. Reports are automatically saved to `swdp_chatops/weekly_report/` in your workspace

### Commands

- `SWDP ChatOps: Process Weekly Report` - Generate or provide feedback on weekly reports
- `SWDP ChatOps: Check Authentication` - Verify and configure authentication
- `SWDP ChatOps: Refresh` - Refresh the ChatOps panel
- `SWDP ChatOps: Open Settings` - Open extension settings

## Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| `swdpChatOps.authToken` | Authentication token for SWDP ChatOps API | `""` |

## Development

### Prerequisites

- Node.js 16.x or higher
- npm

### Building

```bash
npm install
npm run compile
```

### Testing

```bash
# Open in VS Code development host
F5 or Run > Start Debugging
```

## Requirements

- Visual Studio Code 1.74.0 or higher
- Git configured with user information
- Valid SWDP ChatOps API token

## Extension Settings

Access extension settings via:
- File > Preferences > Settings > Extensions > SWDP ChatOps
- Command Palette: "Preferences: Open Settings" and search for "swdpChatOps"

## Troubleshooting

### Authentication Issues
- Verify your token is correct and active
- Check network connectivity to the ChatOps API
- Ensure git is properly configured with user information

### Report Generation Issues
- Confirm you have git history in your workspace
- Check that the workspace folder is accessible
- Verify API service is responding

## License

This extension is proprietary software developed for SWDP team usage.

## Support

For issues and feature requests, contact the SWDP development team.
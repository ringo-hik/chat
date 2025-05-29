const vscode = require('vscode');

class Logger {
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('SWDP ChatOps');
    }

    log(message) {
        this.outputChannel.appendLine(`[INFO] ${message}`);
    }

    error(message, error) {
        this.outputChannel.appendLine(`[ERROR] ${message}`);
        if (error) {
            this.outputChannel.appendLine(error.stack || error.toString());
        }
    }

    show() {
        this.outputChannel.show();
    }
}

module.exports = new Logger();
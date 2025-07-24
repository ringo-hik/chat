const vscode = require('vscode');
const logger = require('./logger');

class ChatOpsTreeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element) {
        return element;
    }

    getChildren(element) {
        try {
            logger.log('getChildren called with element:', element ? element.contextValue : 'root');
            
            if (!element) {
                // Root level - return Reports and How to use
                const rootItems = [
                    new ChatOpsTreeItem(
                        'Weekly Reports', 
                        'Weekly Report Management', 
                        vscode.TreeItemCollapsibleState.Expanded,
                        'reports'
                    ),
                    new ChatOpsTreeItem(
                        'How to Use',
                        'View usage guide and documentation',
                        vscode.TreeItemCollapsibleState.None,
                        'howToUseItem',
                        {
                            command: 'swdpChatOps.showHowToUse',
                            title: 'How to Use'
                        }
                    )
                ];
                logger.log('Returning root items:', rootItems.length);
                return Promise.resolve(rootItems);
            }

            if (element.contextValue === 'reports') {
                // Reports category level - directly show Process Weekly Report
                const reportItems = [
                    new ChatOpsTreeItem(
                        'Process Weekly Report', 
                        'Generate new report or apply feedback', 
                        vscode.TreeItemCollapsibleState.None,
                        'weeklyReportItem',
                        {
                            command: 'swdpChatOps.processWeeklyReport',
                            title: 'Process Weekly Report'
                        }
                    )
                ];
                logger.log('Returning report items:', reportItems.length);
                return Promise.resolve(reportItems);
            }

            logger.log('No matching context, returning empty array');
            return Promise.resolve([]);
            
        } catch (error) {
            logger.error('Error in getChildren:', error);
            return Promise.resolve([]);
        }
    }
}

class ChatOpsTreeItem extends vscode.TreeItem {
    constructor(label, tooltip, collapsibleState, contextValue, command = null) {
        super(label, collapsibleState);
        
        this.tooltip = tooltip;
        this.contextValue = contextValue;
        
        if (command) {
            this.command = command;
        }

        // Set icons based on context
        switch (contextValue) {
            case 'reports':
                this.iconPath = new vscode.ThemeIcon('folder');
                break;
            case 'weeklyReportItem':
                this.iconPath = new vscode.ThemeIcon('play', new vscode.ThemeColor('charts.green'));
                break;
            case 'helpItem':
                this.iconPath = new vscode.ThemeIcon('question');
                break;
            case 'howToUseItem':
                this.iconPath = new vscode.ThemeIcon('book');
                break;
            default:
                this.iconPath = new vscode.ThemeIcon('circle');
        }
    }
}

module.exports = {
    ChatOpsTreeProvider,
    ChatOpsTreeItem
};
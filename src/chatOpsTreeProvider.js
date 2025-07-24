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
                // Root level - return Reports directly
                const rootItems = [
                    new ChatOpsTreeItem(
                        'Weekly Reports', 
                        'Weekly Report Management', 
                        vscode.TreeItemCollapsibleState.Expanded,
                        'reports'
                    )
                ];
                logger.log('Returning root items:', rootItems.length);
                return Promise.resolve(rootItems);
            }

            if (element.contextValue === 'reports') {
                // Reports category level
                const reportItems = [
                    new ChatOpsTreeItem(
                        'Weekly Report Actions', 
                        'Available weekly report operations', 
                        vscode.TreeItemCollapsibleState.Expanded,
                        'weeklyReportGroup'
                    )
                ];
                logger.log('Returning report items:', reportItems.length);
                return Promise.resolve(reportItems);
            }

            if (element.contextValue === 'weeklyReportGroup') {
                // Weekly report sub-items
                const subItems = [
                    new ChatOpsTreeItem(
                        'Check Authentication',
                        'Check if the authentication token is valid',
                        vscode.TreeItemCollapsibleState.None,
                        'checkAuthItem',
                        {
                            command: 'swdpChatOps.checkAuth',
                            title: 'Check Authentication'
                        }
                    ),
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
                logger.log('Returning sub items:', subItems.length);
                return Promise.resolve(subItems);
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
            case 'weeklyReportGroup':
                this.iconPath = new vscode.ThemeIcon('file-text');
                break;
            case 'weeklyReportItem':
                this.iconPath = new vscode.ThemeIcon('play');
                break;
            case 'checkAuthItem':
                this.iconPath = new vscode.ThemeIcon('verified');
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
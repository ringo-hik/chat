const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');
const logger = require('./logger');

class GitUtils {
    constructor() {
        this.workspaceRoot = null;
        this.initializeWorkspace();
    }

    initializeWorkspace() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            this.workspaceRoot = workspaceFolders[0].uri.fsPath;
        }
    }

    /**
     * Extract userId from git email configuration
     * Returns the part before @ in the email address
     */
    async getUserId() {
        try {
            if (!this.workspaceRoot) {
                throw new Error('No workspace folder found');
            }

            // First, try to get email from git config in the current repository
            const email = await this.getGitEmail();
            
            if (!email) {
                throw new Error('No git email found');
            }

            // Extract userId from email (part before @)
            const userId = email.split('@')[0];
            
            if (!userId) {
                throw new Error('Invalid email format');
            }

            logger.log(`Extracted userId: ${userId} from email: ${email}`);
            return userId;

        } catch (error) {
            logger.error('Error extracting userId from git:', error);
            throw error;
        }
    }

    /**
     * Get git email from configuration
     */
    async getGitEmail() {
        try {
            // Try local git config first
            const localEmail = await this.executeGitCommand('config user.email');
            if (localEmail) {
                return localEmail.trim();
            }

            // Fallback to global git config
            const globalEmail = await this.executeGitCommand('config --global user.email');
            if (globalEmail) {
                return globalEmail.trim();
            }

            // Last resort: read from .git/config file directly
            const configEmail = await this.readGitConfigEmail();
            if (configEmail) {
                return configEmail.trim();
            }

            throw new Error('No git email configuration found');

        } catch (error) {
            logger.error('Error getting git email:', error);
            throw error;
        }
    }

    /**
     * Execute git command in the workspace directory
     */
    async executeGitCommand(command) {
        return new Promise((resolve, reject) => {
            const fullCommand = `git ${command}`;
            const options = {
                cwd: this.workspaceRoot,
                timeout: 5000
            };

            exec(fullCommand, options, (error, stdout, stderr) => {
                if (error) {
                    logger.error(`Git command error: ${error}`);
                    resolve(null); // Don't reject, just return null to try other methods
                    return;
                }

                if (stderr && stderr.trim()) {
                    logger.log(`Git command warning: ${stderr}`);
                }

                resolve(stdout ? stdout.toString() : null);
            });
        });
    }

    /**
     * Read email directly from .git/config file
     */
    async readGitConfigEmail() {
        try {
            if (!this.workspaceRoot) {
                return null;
            }

            const gitConfigPath = path.join(this.workspaceRoot, '.git', 'config');
            
            if (!fs.existsSync(gitConfigPath)) {
                return null;
            }

            const configContent = fs.readFileSync(gitConfigPath, 'utf8');
            
            // Parse the config file to find email
            const lines = configContent.split('\n');
            let inUserSection = false;
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                
                if (trimmedLine === '[user]') {
                    inUserSection = true;
                    continue;
                }
                
                if (trimmedLine.startsWith('[') && trimmedLine !== '[user]') {
                    inUserSection = false;
                    continue;
                }
                
                if (inUserSection && trimmedLine.startsWith('email = ')) {
                    return trimmedLine.substring(8); // Remove 'email = ' prefix
                }
            }

            return null;

        } catch (error) {
            logger.error('Error reading git config file:', error);
            return null;
        }
    }

    /**
     * Get git user name for additional context
     */
    async getUserName() {
        try {
            const localName = await this.executeGitCommand('config user.name');
            if (localName) {
                return localName.trim();
            }

            const globalName = await this.executeGitCommand('config --global user.name');
            if (globalName) {
                return globalName.trim();
            }

            return 'Unknown User';

        } catch (error) {
            logger.error('Error getting git user name:', error);
            return 'Unknown User';
        }
    }

    /**
     * Get current branch name
     */
    async getCurrentBranch() {
        try {
            const branch = await this.executeGitCommand('branch --show-current');
            return branch ? branch.trim() : 'main';
        } catch (error) {
            logger.error('Error getting current branch:', error);
            return 'main';
        }
    }

    /**
     * Check if current directory is a git repository
     */
    async isGitRepository() {
        try {
            const result = await this.executeGitCommand('rev-parse --is-inside-work-tree');
            return result && result.trim() === 'true';
        } catch (error) {
            return false;
        }
    }

    /**
     * Get repository information for context
     */
    async getRepositoryInfo() {
        try {
            const isRepo = await this.isGitRepository();
            if (!isRepo) {
                return null;
            }

            const userId = await this.getUserId();
            const userName = await this.getUserName();
            const branch = await this.getCurrentBranch();
            const email = await this.getGitEmail();

            return {
                userId,
                userName,
                branch,
                email,
                workspaceRoot: this.workspaceRoot
            };

        } catch (error) {
            logger.error('Error getting repository info:', error);
            return null;
        }
    }
}

module.exports = {
    GitUtils
};
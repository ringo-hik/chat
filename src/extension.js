const vscode = require('vscode');
const { ChatOpsTreeProvider } = require('./chatOpsTreeProvider');
const { ApiService } = require('./apiService');
const { GitUtils } = require('./gitUtils');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

let currentReportContent = '';

/**
 * This method is called when your extension is activated
 */
function activate(context) {
    console.log('🚀 SWDP ChatOps Extension activation started!');
    logger.log('SWDP ChatOps Extension is now active!');

    try {
        console.log('📝 Initializing services...');
        // Initialize services
        const apiService = new ApiService();
        const gitUtils = new GitUtils();
        console.log('✅ Services initialized');
        
        console.log('🌳 Creating tree data provider...');
        // Create tree data provider
        const treeDataProvider = new ChatOpsTreeProvider();
        logger.log('Tree data provider created');
        console.log('✅ Tree data provider created');
        
        console.log('📋 Registering tree data provider...');
        // Register tree data provider explicitly
        const disposableProvider = vscode.window.registerTreeDataProvider('swdpChatOps', treeDataProvider);
        context.subscriptions.push(disposableProvider);
        logger.log('Tree data provider registered');
        console.log('✅ Tree data provider registered');
        
        console.log('🖼️ Creating tree view...');
        // Create tree view
        const treeView = vscode.window.createTreeView('swdpChatOps', {
            treeDataProvider: treeDataProvider,
            showCollapseAll: true,
            canSelectMany: false
        });
        context.subscriptions.push(treeView);
        logger.log('Tree view created');
        console.log('✅ Tree view created');

        console.log('⚡ Registering commands...');
        // Register commands
        const commands = [
            // Refresh command
            vscode.commands.registerCommand('swdpChatOps.refresh', () => {
                console.log('🔄 Refresh command executed');
                treeDataProvider.refresh();
            }),

        // Process Weekly Report command
        vscode.commands.registerCommand('swdpChatOps.processWeeklyReport', async () => {
            try {
                await processWeeklyReport(apiService, gitUtils);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to process weekly report: ${error.message}`);
            }
        }),

        // Save Report command
        vscode.commands.registerCommand('swdpChatOps.saveReport', async () => {
            try {
                await saveReport();
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to save report: ${error.message}`);
            }
        }),

        // Show Help command
        vscode.commands.registerCommand('swdpChatOps.showHelp', () => {
            showHelpDialog();
        }),

        // Show How to Use command  
        vscode.commands.registerCommand('swdpChatOps.showHowToUse', () => {
            showHowToUseDialog();
        }),

        // Open Settings command
        vscode.commands.registerCommand('swdpChatOps.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'swdpChatOps');
        })
    ];

        // Add all commands to context subscriptions
        console.log(`📝 Adding ${commands.length} commands to subscriptions...`);
        commands.forEach((command, index) => {
            context.subscriptions.push(command);
            console.log(`✅ Command ${index + 1}/${commands.length} added to subscriptions`);
        });
        
        logger.log('All commands registered successfully');
        console.log('🎉 Extension activation completed successfully!');
        
    } catch (error) {
        logger.error('Error activating extension:', error);
        vscode.window.showErrorMessage(`Failed to activate SWDP ChatOps Extension: ${error.message}`);
    }
}

/**
 * Process Weekly Report (Generate or Apply Feedback)
 */
async function processWeeklyReport(apiService, gitUtils) {
    try {
        // Get user ID from git
        const userId = await gitUtils.getUserId();
        if (!userId) {
            vscode.window.showErrorMessage('Unable to extract user ID from git configuration');
            return;
        }

        let response;
        
        if (currentReportContent) {
            // Ask if user wants to provide feedback or generate new report
            const action = await vscode.window.showQuickPick([
                { label: 'Generate New Report', description: 'Create a fresh weekly report' },
                { label: 'Provide Feedback', description: 'Modify the existing report' }
            ], {
                placeHolder: 'Choose an action'
            });

            if (!action) return;

            if (action.label === 'Provide Feedback') {
                const feedback = await vscode.window.showInputBox({
                    prompt: 'Enter your feedback for the weekly report',
                    placeHolder: 'e.g., Please add more details about the project timeline...',
                    ignoreFocusOut: true
                });

                if (!feedback) return;

                vscode.window.showInformationMessage('Processing feedback...');
                response = await apiService.processWeeklyReport(userId, feedback, currentReportContent);
            } else {
                vscode.window.showInformationMessage('Generating new weekly report...');
                currentReportContent = '';
                response = await apiService.processWeeklyReport(userId);
            }
        } else {
            vscode.window.showInformationMessage('Generating weekly report...');
            response = await apiService.processWeeklyReport(userId);
        }
        
        logger.log('API Response:', JSON.stringify(response, null, 2));
        
        if (response.success && response.data) {
            // API 응답 데이터 구조 확인 및 처리
            let reportContent = '';
            if (typeof response.data === 'string') {
                reportContent = response.data;
            } else if (response.data.message) {
                // 실제 서버 응답 구조: data.message에 보고서 내용이 있음
                reportContent = response.data.message;
            } else if (response.data.content) {
                reportContent = response.data.content;
            } else if (response.data.report) {
                reportContent = response.data.report;
            } else {
                logger.error('Unexpected response data structure:', response.data);
                vscode.window.showErrorMessage('보고서 데이터 형식이 올바르지 않습니다.');
                return;
            }
            
            currentReportContent = reportContent;
            
            // Automatically save the report
            try {
                await saveReport();
                vscode.window.showInformationMessage('주간 보고서가 성공적으로 처리되고 저장되었습니다!');
            } catch (saveError) {
                vscode.window.showErrorMessage(`보고서는 생성되었지만 저장에 실패했습니다: ${saveError.message}`);
            }
        } else {
            const errorMsg = response.errorMessage || response.message || 'Unknown error';
            logger.error('Report processing failed:', errorMsg);
            vscode.window.showErrorMessage(`보고서 처리 실패: ${errorMsg}`);
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Error processing weekly report: ${error.message}`);
    }
}

/**
 * Save Report to workspace
 */
async function saveReport() {
    if (!currentReportContent) {
        vscode.window.showWarningMessage('No report available to save. Please generate a report first.');
        return;
    }

    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        // Create directory if it doesn't exist
        const reportDir = path.join(workspaceFolder.uri.fsPath, 'swdp_chatops', 'weekly_report');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        // Generate filename with current date and time
        const now = new Date();
        const dateString = now.toISOString().slice(2, 10).replace(/-/g, '');
        const timeString = now.toISOString().slice(11, 16).replace(/:/g, '');
        const filename = `weekly_report_${dateString}_${timeString}.md`;
        const filePath = path.join(reportDir, filename);

        // Write file
        fs.writeFileSync(filePath, currentReportContent, 'utf8');

        // Open the saved file
        const doc = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(doc, {
            preview: false,
            viewColumn: vscode.ViewColumn.One
        });

        vscode.window.showInformationMessage(`Report saved as: ${filename}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to save report: ${error.message}`);
    }
}

/**
 * Show Help Dialog
 */
function showHelpDialog() {
    const helpMessage = `
📖 SWDP ChatOps Extension Help

🔹 Weekly Reports: 주간 보고서 자동 생성 및 관리
🔹 Process Weekly Report: AI 기반 주간 보고서 생성
🔹 Feedback System: 생성된 보고서에 대한 피드백 적용
🔹 Auto Save: 보고서 자동 저장 및 파일 관리

📧 문의사항이 있으시면 개발팀에 연락하세요.
    `;
    
    vscode.window.showInformationMessage(helpMessage, { modal: true });
}

/**
 * Show How to Use Dialog
 */
function showHowToUseDialog() {
    const howToUseMessage = `
🚀 SWDP ChatOps Extension 사용법

1️⃣ **확장 프로그램 활성화**
   - VS Code 왼쪽 사이드바에서 SWDP ChatOps 아이콘 클릭

2️⃣ **주간 보고서 생성**
   - "Weekly Reports" → "Process Weekly Report" 클릭
   - AI가 자동으로 Git 커밋 내역을 분석하여 보고서 생성

3️⃣ **피드백 적용** (선택사항)
   - 보고서 생성 후 "Provide Feedback" 선택
   - 원하는 수정사항 입력하여 보고서 개선

4️⃣ **보고서 확인**
   - 생성된 보고서는 자동으로 워크스페이스의 swdp_chatops/weekly_report 폴더에 저장
   - Markdown 형식으로 저장되어 바로 확인 가능

📸 **스크린샷 추가 권장 위치:**
   • 확장 프로그램 사이드바 화면
   • 주간 보고서 생성 버튼 클릭 시
   • 생성된 보고서 미리보기
   • 피드백 입력 화면
   • 저장된 보고서 파일 위치

💡 **팁:** 
   - Git 커밋 메시지를 상세히 작성하면 더 정확한 보고서가 생성됩니다
   - 보고서는 지난 8일간의 활동을 기준으로 생성됩니다
    `;
    
    vscode.window.showInformationMessage(howToUseMessage, { modal: true });
}

/**
 * Check Authentication (Legacy function - keeping for backwards compatibility)
 */
async function checkAuth(apiService) {
    try {
        let token = vscode.workspace.getConfiguration('swdpChatOps').get('authToken');
        if (!token) {
            token = await vscode.window.showInputBox({
                prompt: 'Enter your authentication token',
                placeHolder: 'Paste your token here',
                ignoreFocusOut: true
            });

            if (token) {
                await vscode.workspace.getConfiguration('swdpChatOps').update('authToken', token, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage('Authentication token saved.');
            } else {
                vscode.window.showWarningMessage('Authentication token is required.');
                return;
            }
        }

        vscode.window.showInformationMessage('Checking authentication token...');
        const response = await apiService.checkAuth(token);

        if (response.success) {
            vscode.window.showInformationMessage('Authentication successful!');
        } else {
            const retry = await vscode.window.showErrorMessage(
                `Authentication failed: ${response.errorMessage}`,
                'Retry with New Token',
                'Cancel'
            );
            
            if (retry === 'Retry with New Token') {
                // Clear current token and retry
                await vscode.workspace.getConfiguration('swdpChatOps').update('authToken', '', vscode.ConfigurationTarget.Global);
                await checkAuth(apiService);
            }
        }
    } catch (error) {
        logger.error('Error checking authentication:', error);
        vscode.window.showErrorMessage(`Error checking authentication: ${error.message}`);
    }
}

/**
 * This method is called when your extension is deactivated
 */
function deactivate() {
    logger.log('SWDP ChatOps Extension deactivated');
}

module.exports = {
    activate,
    deactivate
};
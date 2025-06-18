import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const isDev = require('electron-is-dev');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow;

// 開発中のプロジェクトファイルパス
let currentProjectPath = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../public/icon.png'), // アイコンは後で追加
  });

  // 開発モードではViteのdevサーバーを読み込み
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // 開発者ツールを自動的に開く（オプション）
    mainWindow.webContents.openDevTools();
    
    // ホットリロード対応
    mainWindow.webContents.on('did-fail-load', () => {
      setTimeout(() => {
        mainWindow.reload();
      }, 1000);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // メニューバーの作成
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'ファイル',
      submenu: [
        {
          label: '新規プロジェクト',
          accelerator: 'CmdOrCtrl+N',
          click: async () => {
            mainWindow.webContents.send('menu-new-project');
          },
        },
        {
          label: 'プロジェクトを開く',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'Novel Editor Project', extensions: ['nep'] },
                { name: 'All Files', extensions: ['*'] },
              ],
            });

            if (!result.canceled && result.filePaths.length > 0) {
              currentProjectPath = result.filePaths[0];
              const data = await fs.readFile(currentProjectPath, 'utf-8');
              mainWindow.webContents.send('menu-open-project', { path: currentProjectPath, data });
            }
          },
        },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: async () => {
            mainWindow.webContents.send('menu-save-project');
          },
        },
        {
          label: '名前を付けて保存',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: async () => {
            mainWindow.webContents.send('menu-save-project-as');
          },
        },
        { type: 'separator' },
        {
          label: 'エクスポート',
          submenu: [
            {
              label: 'カクヨム形式',
              click: () => {
                mainWindow.webContents.send('menu-export', 'kakuyomu');
              },
            },
            {
              label: 'なろう形式',
              click: () => {
                mainWindow.webContents.send('menu-export', 'narou');
              },
            },
            {
              label: 'テキストファイル',
              click: () => {
                mainWindow.webContents.send('menu-export', 'text');
              },
            },
          ],
        },
        { type: 'separator' },
        {
          label: '終了',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: '編集',
      submenu: [
        { label: '元に戻す', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'やり直し', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: '切り取り', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'コピー', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '貼り付け', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'すべて選択', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
      ],
    },
    {
      label: '表示',
      submenu: [
        { label: '再読み込み', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '強制再読み込み', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: '開発者ツール', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '実際のサイズ', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '拡大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '縮小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全画面表示', accelerator: 'F11', role: 'togglefullscreen' },
      ],
    },
    {
      label: 'ヘルプ',
      submenu: [
        {
          label: 'Novel Editorについて',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Novel Editorについて',
              message: 'Novel Editor',
              detail: 'ネット小説執筆支援エディタ\nVersion 1.0.0',
              buttons: ['OK'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC通信のハンドラー設定
ipcMain.handle('save-file', async (event, { path, content }) => {
  try {
    await fs.writeFile(path, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-file', async (event, path) => {
  try {
    const content = await fs.readFile(path, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

// アプリケーションの準備ができたらウィンドウを作成
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// すべてのウィンドウが閉じられたときの処理
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// プロジェクトパスの更新
ipcMain.on('update-project-path', (event, path) => {
  currentProjectPath = path;
});
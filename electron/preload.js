const { contextBridge, ipcRenderer } = require('electron');

// レンダラープロセスに公開するAPI
contextBridge.exposeInMainWorld('electronAPI', {
  // ファイル操作
  saveFile: (path, content) => ipcRenderer.invoke('save-file', { path, content }),
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),

  // メニューイベントの受信
  onMenuAction: (callback) => {
    // 新規プロジェクト
    ipcRenderer.on('menu-new-project', () => {
      console.log('Preload: menu-new-project event received');
      callback('new-project');
    });
    // プロジェクトを開く
    ipcRenderer.on('menu-open-project', (event, data) => {
      console.log('Preload: menu-open-project event received', data);
      callback('open-project', data);
    });
    // 保存
    ipcRenderer.on('menu-save-project', () => {
      console.log('Preload: menu-save-project event received');
      callback('save-project');
    });
    // 名前を付けて保存
    ipcRenderer.on('menu-save-project-as', () => {
      console.log('Preload: menu-save-project-as event received');
      callback('save-project-as');
    });
    // エクスポート
    ipcRenderer.on('menu-export', (event, format) => {
      console.log('Preload: menu-export event received', format);
      callback('export', { format });
    });
  },

  // プロジェクトパスの更新
  updateProjectPath: (path) => ipcRenderer.send('update-project-path', path),

  // イベントリスナーの削除
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('menu-new-project');
    ipcRenderer.removeAllListeners('menu-open-project');
    ipcRenderer.removeAllListeners('menu-save-project');
    ipcRenderer.removeAllListeners('menu-save-project-as');
    ipcRenderer.removeAllListeners('menu-export');
  },

  // プラットフォーム情報
  platform: process.platform,
});
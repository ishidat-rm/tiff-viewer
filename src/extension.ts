import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      'tiffViewer.tiff',
      new TiffEditorProvider(context),
      { supportsMultipleEditorsPerDocument: false }
    )
  );
}

class TiffEditorProvider implements vscode.CustomReadonlyEditorProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  openCustomDocument(uri: vscode.Uri): vscode.CustomDocument {
    return { uri, dispose: () => {} };
  }

  async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewPanel: vscode.WebviewPanel
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(this.context.extensionPath, 'src')),
        vscode.Uri.file(path.join(this.context.extensionPath, 'node_modules'))
      ]
    };

    const fileData = fs.readFileSync(document.uri.fsPath);
    const base64 = fileData.toString('base64');

    const geotiffUri = webviewPanel.webview.asWebviewUri(
  vscode.Uri.file(path.join(this.context.extensionPath, 'node_modules', 'geotiff', 'dist-browser', 'geotiff.js'))
);

    const htmlPath = path.join(this.context.extensionPath, 'src', 'webview.html');
    let html = fs.readFileSync(htmlPath, 'utf8');
    html = html.replace('__TIFF_BASE64__', base64);
    html = html.replace('__GEOTIFF_URI__', geotiffUri.toString());

    webviewPanel.webview.html = html;
  }
}

export function deactivate() {}
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "less2html" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', function () {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World!');
        // editor.edit(function (edit) {
        //     // itterate through the selections and convert all text to Upper
        //     for (var x = 0; x < sel.length; x++) {
                
        //         edit.replace(sel[x], txt.toUpperCase());
        //     }
        // });        
        let selectionLessText = getSelectionText();
        let result = convert(selectionLessText);
        console.log(result);
        
    });

    context.subscriptions.push(disposable);
}

function getSelectionText(){
    let editor = vscode.window.activeTextEditor;
    let document = editor.document;
    let sel = editor.selections;
    let txt = document.getText(new vscode.Range(sel[0].start, sel[0].end));
    return txt;
}
function convert(selectionLessText){
    //去除所有注释
    let textWithoutAnnotation =   selectionLessText.replace(/\/\/.*\n/g,'');
    //去除所有空格
    let textWithoutSpace = textWithoutAnnotation.replace(/\s+/g,'');
    //去除颜色值，和小数，防止干扰
    let textWithoutBackdrop = textWithoutSpace.replace(/((#\w+)(?=;))|([.]\d+)/,'');
    // let classOrId = /[#.]\w+(?={})/.exec(textWithoutBackdrop)
    return textWithoutBackdrop;
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
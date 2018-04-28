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

        let selectionLessText = getSelectionText();
        let result;
        try {
            result = convert(selectionLessText);
        } catch (e) {
            console.log(e);
        }
        console.log('result',result);

    });

    context.subscriptions.push(disposable);
}


function convert(selectionLessText) {
    let finalSourceText = wipeBackdrop(selectionLessText);
    if (checkBracketsEqual(finalSourceText)) {
        throw new Error('missing some Brackets');
    }
    return convertToTree(finalSourceText);
}
function getSelectionText() {
    let editor = vscode.window.activeTextEditor;
    let document = editor.document;
    let sel = editor.selections;
    let txt = document.getText(new vscode.Range(sel[0].start, sel[0].end));
    return txt;
}
let stack = [];
let testArr = [];
function convertToTree(finalSourceText) {
    //1.start with class name(.) or id(#)name ,end with { ,or less function start whit (.)，end with (\(\)){  2.less reserved word (&),end with {  3.HTML tag  name 
    let regexp = new RegExp(/([.#][-\w()]+(?={))|(&.*?(?={))|([a-z]+(?={))|}/, 'g');
    // let regexp = new RegExp(/([.#].*?(?={))|(&.*?(?={))|([a-z]+(?={))|}/, 'g');
    let arr;
    let root = {type:'id',value:'root',child:[]};
    stack.push(root);

    while ((arr = regexp.exec(finalSourceText)) !== null) {
        //  console.log(`Found ${arr[0]}. Next starts at ${regexp.lastIndex}.`);
        let text = arr[0];
        //if not match{，push Matching text to stack
        if(text!=='}'){
            let node = {child:[]}
            node.type = getType(text);
            node.value = getValue(text);
            testArr.push(`${text},type:${node.type}`)
            stack.push(node);
        }else{
            let node = stack.pop();
            let parent = stack[stack.length-1];
            parent.child.push(node);
        }
     
    }
    console.log('testArr',testArr);
    


    return root;
}
function getType(text){
    let type ;
    if(text[0] ==='.'){
        if(/\(\)/.test(text)){
            type = 'function'
        }else{
            type = 'class'
        }
    }else if( text[0] ==='#'){
        type = 'id'
    }else if(text[0] ==='&'){
        type = 'reverse'
    }else{
        type = 'tag'
    }
    return type;
}
function getValue(text){
    if(text.length===1) return text;
    return text.slice(1,text.length)
}
function wipeBackdrop(selectionLessText) {
    // Remove all annotations
    let textWithoutAnnotation = selectionLessText.replace(/\/\/.*\n/g, '');
    //Remove all spaces
    let textWithoutSpace = textWithoutAnnotation.replace(/\s+/g, '');
    //Remove color values, and decimal
    // return  textWithoutSpace.replace(/(#\w+(?!{))|([.]\d+)/g, '');
    return  textWithoutSpace.replace(/([.]\d+)/g, '');

}
function checkBracketsEqual(finalText) {
    let leftBrackets = finalText.match(/{/g);
    let rightBrackets = finalText.match(/}/g);
    return leftBrackets.length !== rightBrackets.length;
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    console.log('this is deactivete');
    
}
exports.deactivate = deactivate;
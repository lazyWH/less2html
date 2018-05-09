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
    let disposable = vscode.commands.registerCommand('extension.sayHello', main);
    context.subscriptions.push(disposable);
}

function main(editor) {
    // The code you place here will be executed every time your command is executed

    let selectionLessText = getSelectionText();
    let result;
    let HTML = '';
    try {
        result = convert(selectionLessText);
        if(result.child.length===1){
            HTML = generateHTML(result.child[0],0);
        }else{
            for(let i = 0;i<result.child.length;i++)
                HTML += generateHTML(result.child[i],0);
        }
    } catch (e) {
        console.log(e);
    }
    console.log(HTML);
    
    
}
function convert(selectionLessText) {
    let finalSourceText = wipeBackdrop(selectionLessText);
    if (checkBracketsEqual(finalSourceText)) {
        vscode.window.showErrorMessage('left Brackets nums is not Equal right Brackets nums,please check selected text')
    }
    return convertToTree(finalSourceText);
}
function generateHTML(tree,level){
    const {child} = tree;
    if(child.length===0) return `\n${' '.repeat(level*4)}<${tree.nodeName} ${tree.type!=='tag'?`${tree.type}='${tree.value}'`:''}></${tree.nodeName}>`;
    let html = '';
    for(let i = 0 ;i<child.length;i++){
        html += generateHTML(child[i],level+1);
    }
    return `\n${' '.repeat(level*4)}<${tree.nodeName} ${tree.type!=='tag'?`${tree.type}='${tree.value}'`:''}>${html}\n${' '.repeat(level*4)}</${tree.nodeName}>`;
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
    let regexp = new RegExp(/([.#][-\w:()]+(?={))|(&.*?(?={))|([a-z]+(?={))|}/, 'g');
    // let regexp = new RegExp(/([.#].*?(?={))|(&.*?(?={))|([a-z]+(?={))|}/, 'g');
    let arr;
    let root = {type:'id',value:'root',nodeName:'div',child:[]};
    stack.push(root);
    while ((arr = regexp.exec(finalSourceText)) !== null) {
        //  console.log(`Found ${arr[0]}. Next starts at ${regexp.lastIndex}.`);
        let text = arr[0];
        //if not match{，push Matching text to stack
        if(text!=='}'){
            let node = {child:[]}
            node.type = getType(text);
            node.value = getValue(text);
            node.nodeName = node.type==='tag'?text:'div'
            testArr.push(`${text},type:${node.nodeName}`)
            
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
    let index = text.indexOf(':');
    let end = text.length;
    if(index!==-1) end = index;
    return text.slice(1,end)
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
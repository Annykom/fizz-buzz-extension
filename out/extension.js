"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FizzBuzzer = exports.activate = void 0;
const vscode = require("vscode");
const REGEX = /(?<=def\s)[\w]+/g;
function activate(context) {
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider('python', new FizzBuzzer(), {
        providedCodeActionKinds: FizzBuzzer.providedCodeActionKinds
    }));
}
exports.activate = activate;
/**
 * Provides code actions for converting function names to 'fizz' or 'buzz' or 'fizz_buzz'.
 */
class FizzBuzzer {
    provideCodeActions(document, range) {
        if (!this.isFuncLine(document, range)) {
            return;
        }
        if (this.getFuncsNumber(document, range) % 15 === 0) {
            let newName = 'fizz_buzz';
            let counter = 1;
            // проверка, подходит ли новое имя для замены
            while (this.nameRepeats(document, range)[2].includes(newName)) {
                newName = 'fizz_buzz_' + counter;
                counter++;
            }
            let newRange = this.findFullFuncNameRange(document, range);
            const replaceWithSmileyCatFix = this.createFix(document, newRange, newName);
            return [
                replaceWithSmileyCatFix
            ];
        }
        if (this.getFuncsNumber(document, range) % 5 === 0) {
            let newName = 'buzz';
            let counter = 1;
            // проверка, подходит ли новое имя для замены
            while (this.nameRepeats(document, range)[1].includes(newName)) {
                newName = 'buzz_' + counter;
                counter++;
            }
            let newRange = this.findFullFuncNameRange(document, range);
            const replaceWithSmileyCatFix = this.createFix(document, newRange, newName);
            return [
                replaceWithSmileyCatFix
            ];
        }
        if (this.getFuncsNumber(document, range) % 3 === 0) {
            let newName = 'fizz';
            let counter = 1;
            // проверка, подходит ли новое имя для замены
            while (this.nameRepeats(document, range)[0].includes(newName)) {
                newName = 'fizz_' + counter;
                counter++;
            }
            let newRange = this.findFullFuncNameRange(document, range);
            const replaceWithSmileyCatFix = this.createFix(document, newRange, newName);
            return [
                replaceWithSmileyCatFix
            ];
        }
        return;
    }
    isFuncLine(document, range) {
        const start = range.start;
        const line = document.lineAt(start.line);
        return line.text.match(REGEX) !== null;
    }
    nameRepeats(document, range) {
        const start = range.start;
        const line = document.lineAt(start.line);
        // здесь собран массив из наименований всех функций в документе
        let funcNames = document.getText().match(REGEX);
        // console.log(funcNames)
        // подготовка массивов
        let arr_fizz = [];
        let arr_buzz = [];
        let arr_fizz_buzz = [];
        // проход по массиву наименований функций 
        for (let index = 0; index < funcNames?.length; index++) {
            // сбор массива с именами, содержащими в себе fizz_buzz
            if (funcNames[index].includes('fizz_buzz')) {
                arr_fizz_buzz.push(funcNames[index]);
                continue;
            }
            // сбор массива с именами, содержащими в себе fizz
            if (funcNames[index].includes('fizz')) {
                arr_fizz.push(funcNames[index]);
            }
            // сбор массива с именами, содержащими в себе buzz
            if (funcNames[index].includes('buzz')) {
                arr_buzz.push(funcNames[index]);
            }
        }
        let result = [arr_fizz, arr_buzz, arr_fizz_buzz];
        return result;
    }
    getFuncsNumber(document, range) {
        const start = range.start;
        let index = 0;
        let funcNum = 0;
        for (index = 0; index <= start.line; index++) {
            let currLine = document.lineAt(index);
            if (currLine.text.match(REGEX) !== null) {
                funcNum++;
            }
        }
        return funcNum;
    }
    collisionResolver(document, range) {
        console.log('TEST', document.getText().match(REGEX));
    }
    findFullFuncNameRange(document, range) {
        const start = range.start;
        const line = document.lineAt(start.line);
        let funcNameEnd = line.text.indexOf('(');
        let funcNameBeg = line.text.indexOf('def ');
        let funcRange = new vscode.Range(start.line, funcNameBeg + 4, start.line, funcNameEnd);
        return funcRange;
    }
    createFix(document, range, newFuncName) {
        const fix = new vscode.CodeAction(`Rename to ${newFuncName}`, vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();
        fix.edit.replace(document.uri, range, newFuncName);
        return fix;
    }
}
FizzBuzzer.providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
];
exports.FizzBuzzer = FizzBuzzer;
//# sourceMappingURL=extension.js.map
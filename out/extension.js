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
        let docInfo = this.getDocInfo(document, range);
        let nameGroups = this.nameRepeats(docInfo.funcNames);
        if (docInfo.funcsNumber % 15 === 0) {
            let newName = 'fizz_buzz';
            let counter = 1;
            // проверка, подходит ли новое имя для замены
            while (nameGroups.fizz_buzz.includes(newName)) {
                newName = 'fizz_buzz_' + counter;
                counter++;
            }
            let newRange = this.findFullFuncNameRange(document, range);
            const replaceWithSmileyCatFix = this.createFix(document, newRange, newName);
            return [
                replaceWithSmileyCatFix
            ];
        }
        if (docInfo.funcsNumber % 5 === 0) {
            let newName = 'buzz';
            let counter = 1;
            // проверка, подходит ли новое имя для замены
            while (nameGroups.buzz.includes(newName)) {
                newName = 'buzz_' + counter;
                counter++;
            }
            let newRange = this.findFullFuncNameRange(document, range);
            const replaceWithSmileyCatFix = this.createFix(document, newRange, newName);
            return [
                replaceWithSmileyCatFix
            ];
        }
        if (docInfo.funcsNumber % 3 === 0) {
            let newName = 'fizz';
            let counter = 1;
            // проверка, подходит ли новое имя для замены
            while (nameGroups.fizz.includes(newName)) {
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
    getDocInfo(document, range) {
        const start = range.start;
        let funcsNumber = 0;
        let funcCounter = 0;
        let funcNames = [];
        for (let index = 0; index < document.lineCount; index++) {
            let currLine = document.lineAt(index);
            if (currLine.text.match(REGEX) !== null) {
                funcNames.push(currLine.text.match(REGEX)[0]);
                funcCounter++;
            }
            if (index === start.line) {
                funcsNumber = funcCounter;
            }
        }
        const result = {
            funcsNumber: funcsNumber,
            funcNames: funcNames
        };
        return result;
    }
    nameRepeats(funcNames) {
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
        const result = {
            fizz: arr_fizz,
            buzz: arr_buzz,
            fizz_buzz: arr_fizz_buzz
        };
        return result;
    }
    findFullFuncNameRange(document, range) {
        const start = range.start;
        const line = document.lineAt(start.line);
        const funcNameEnd = line.text.indexOf('(');
        const funcNameBeg = line.text.indexOf('def ');
        const funcRange = new vscode.Range(start.line, funcNameBeg + 4, start.line, funcNameEnd);
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
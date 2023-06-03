import * as vscode from 'vscode';
import type {FuncNames, DocInfo} from './types'

const REGEX = /(?<=def\s)[\w]+/g;

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('python', new FizzBuzzer(), {
			providedCodeActionKinds: FizzBuzzer.providedCodeActionKinds
		}));
}

/**
 * Provides code actions for converting function names to 'fizz' or 'buzz' or 'fizz_buzz'.
 */
export class FizzBuzzer implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
		if (!this.isFuncLine(document, range)) {
			return;
		}

		let docInfo = this.getDocInfo(document, range)
		let nameGroups = this.nameRepeats(docInfo.funcNames);

		if (docInfo.funcsNumber % 15 === 0) {
			let newName = 'fizz_buzz'
			let counter = 1;
			// проверка, подходит ли новое имя для замены
			while (nameGroups.fizz_buzz.includes(newName)) {
				newName = 'fizz_buzz_' + counter;
				counter++
			}

			let newRange = this.findFullFuncNameRange(document, range)
			const replaceWithSmileyCatFix = this.createFix(document, newRange, newName);

			return [
				replaceWithSmileyCatFix
			];
		}

		if (docInfo.funcsNumber % 5 === 0) {
			let newName = 'buzz'
			let counter = 1;
			// проверка, подходит ли новое имя для замены
			while (nameGroups.buzz.includes(newName)) {
				newName = 'buzz_' + counter;
				counter++
			}
			
			let newRange = this.findFullFuncNameRange(document, range)
			const replaceWithSmileyCatFix = this.createFix(document, newRange, newName);

			return [
				replaceWithSmileyCatFix
			];
		}

		if (docInfo.funcsNumber % 3 === 0) {
			let newName = 'fizz'
			let counter = 1;
			// проверка, подходит ли новое имя для замены
			while (nameGroups.fizz.includes(newName)) {
				newName = 'fizz_' + counter;
				counter++
			}

			let newRange = this.findFullFuncNameRange(document, range)
			const replaceWithSmileyCatFix = this.createFix(document, newRange, newName);

			return [
				replaceWithSmileyCatFix
			];
		}

		return;		
	}

	private isFuncLine(document: vscode.TextDocument, range: vscode.Range): boolean {
		const start = range.start;
		const line = document.lineAt(start.line);

		return line.text.match(REGEX) !== null
	}

	private getDocInfo(document: vscode.TextDocument, range: vscode.Range): DocInfo {
		// let funcNames = document.getText().match(REGEX)

		const start = range.start;

		let index = 0;
		let funcsNumber: number = 0;
		let funcCounter = 0

		let funcNames: string[];
		for (index = 0; index < document.lineCount; index++) {
			let currLine = document.lineAt(index)
			
			if (currLine.text.match(REGEX) !== null) {
				funcNames!.push(currLine.text.match(REGEX)![0])
				funcCounter++
			}

			if (index === start.line) {
				funcsNumber = funcCounter
			}
		}

		let result: DocInfo = {
			funcsNumber: funcsNumber,
			funcNames: funcNames!
		}
		return result;
	}

	private nameRepeats(funcNames: string[]) {
		// подготовка массивов
		let arr_fizz: string[] = [];
		let arr_buzz: string[] = [];
		let arr_fizz_buzz: string[] = [];

		// проход по массиву наименований функций 
		for (let index = 0; index < funcNames!?.length; index++) {
			// сбор массива с именами, содержащими в себе fizz_buzz
			if (funcNames![index].includes('fizz_buzz')) {
				arr_fizz_buzz.push(funcNames![index])
				continue
			}	
			// сбор массива с именами, содержащими в себе fizz
			if (funcNames![index].includes('fizz')) {
				arr_fizz.push(funcNames![index])
			}
			// сбор массива с именами, содержащими в себе buzz
			if (funcNames![index].includes('buzz')) {
				arr_buzz.push(funcNames![index])
			}		
		}

		let result: FuncNames = {
			fizz: arr_fizz,
			buzz: arr_buzz,
			fizz_buzz: arr_fizz_buzz
		}
		return result
	}

	private findFullFuncNameRange(document: vscode.TextDocument, range: vscode.Range): vscode.Range {
		const start = range.start;
		const line = document.lineAt(start.line);
		let funcNameEnd = line.text.indexOf('(')
		let funcNameBeg = line.text.indexOf('def ')
		
		let funcRange = new vscode.Range(start.line, funcNameBeg + 4, start.line, funcNameEnd)
		return funcRange
	}

	private createFix(document: vscode.TextDocument, range: vscode.Range, newFuncName: string): vscode.CodeAction {
		const fix = new vscode.CodeAction(`Rename to ${newFuncName}`, vscode.CodeActionKind.QuickFix);
		fix.edit = new vscode.WorkspaceEdit();
		fix.edit.replace(document.uri, range, newFuncName);
		return fix;
	}
}
import * as vscode from 'vscode';

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

		if (this.getFuncsNumber(document, range) % 15 === 0) {
			let newName = 'fizz_buzz'
			let counter = 1;
			// проверка, подходит ли новое имя для замены
			while (this.nameRepeats(document, range)[2].includes(newName)) {
				newName = 'fizz_buzz_' + counter;
				counter++
			}

			let newRange = this.findFullFuncNameRange(document, range)
			const replaceWithSmileyCatFix = this.createFix(document, newRange, newName);

			return [
				replaceWithSmileyCatFix
			];
		}

		if (this.getFuncsNumber(document, range) % 5 === 0) {
			let newName = 'buzz'
			let counter = 1;
			// проверка, подходит ли новое имя для замены
			while (this.nameRepeats(document, range)[1].includes(newName)) {
				newName = 'buzz_' + counter;
				counter++
			}
			
			let newRange = this.findFullFuncNameRange(document, range)
			const replaceWithSmileyCatFix = this.createFix(document, newRange, newName);

			return [
				replaceWithSmileyCatFix
			];
		}

		if (this.getFuncsNumber(document, range) % 3 === 0) {
			let newName = 'fizz'
			let counter = 1;
			// проверка, подходит ли новое имя для замены
			while (this.nameRepeats(document, range)[0].includes(newName)) {
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

	private nameRepeats(document: vscode.TextDocument, range: vscode.Range) {
		const start = range.start;
		const line = document.lineAt(start.line);
		// здесь собран массив из наименований всех функций в документе
		let funcNames = document.getText().match(REGEX)
		// console.log(funcNames)

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

		let result = [arr_fizz, arr_buzz, arr_fizz_buzz]
		return result
	}

	private getFuncsNumber(document: vscode.TextDocument, range: vscode.Range): number {
		const start = range.start;

		let index = 0;
		let funcNum = 0;
		for (index = 0; index <= start.line; index++) {
			let currLine = document.lineAt(index)
			if (currLine.text.match(REGEX) !== null) {
				funcNum++
			}
		}

		return funcNum;
	}

	private collisionResolver(document: vscode.TextDocument, range: vscode.Range) {
		console.log('TEST', document.getText().match(REGEX))
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
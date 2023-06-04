import * as vscode from 'vscode';
import type {DocInfo, Task} from './types'

const REGEX = /(?<=def\s)[\w]+/g;
const TASK: Task[] = [
	{
		divider: 3,
		funcName: 'fizz'
	},
	{
		divider: 5,
		funcName: 'buzz'
	}
];

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

		let suitableNames: string[] = [];
		TASK.sort((a, b) => {
			if (a.divider > b.divider) {
				return 1
			}
			if (a.divider < b.divider) {
				return -1
			}
			return 0;
		})

		TASK.forEach(element => {
			if (docInfo.funcsNumber % element.divider === 0) {
				suitableNames.push(element.funcName);
			}
		});

		if (suitableNames.length === 0) {
			return;
		}

		let suitableName: string = suitableNames.join('_');
		let newName = this.getNewFuncName(docInfo.funcNames, suitableName);

		let newRange = this.findFullFuncNameRange(document, range)
		const replaceWithNewFuncNameFix = this.createFix(document, newRange, newName);

		return [
			replaceWithNewFuncNameFix
		];	
	}

	private isFuncLine(document: vscode.TextDocument, range: vscode.Range): boolean {
		const start = range.start;
		const line = document.lineAt(start.line);

		return line.text.match(REGEX) !== null
	}

	private getDocInfo(document: vscode.TextDocument, range: vscode.Range): DocInfo {
		const start = range.start;

		let funcsNumber = 0;
		let funcCounter = 0;

		let funcNames: string[] = [];
		for (let index = 0; index < document.lineCount; index++) {
			let currLine = document.lineAt(index)
			
			if (currLine.text.match(REGEX) !== null) {
				funcNames!.push(currLine.text.match(REGEX)![0]);
				funcCounter++
			}

			if (index === start.line) {
				funcsNumber = funcCounter;
			}
		}

		const result: DocInfo = {
			funcsNumber: funcsNumber,
			funcNames: funcNames!
		}
		return result;
	}

	private getNewFuncName(allDocFuncNames: string[], suitableName: string): string {
		let result = new Set<string>;

		const suitableRegEx = new RegExp(`(^${suitableName}$|^${suitableName}_\\d+$)`, 'g');

		allDocFuncNames.forEach(element => {
			if (element.match(suitableRegEx) !== null) {
				result.add(element);
			}	
		});

		let counter = 1;
		let newName = suitableName;

		while (result.has(newName)) {
			newName = suitableName + '_' + counter;
			counter++
		}
		console.log('newName:', newName)
		return newName;
	}

	private findFullFuncNameRange(document: vscode.TextDocument, range: vscode.Range): vscode.Range {
		const start = range.start;
		const line = document.lineAt(start.line);
		const funcNameEnd = line.text.indexOf('(')
		const funcNameBeg = line.text.indexOf('def ')
		
		const funcRange = new vscode.Range(start.line, funcNameBeg + 4, start.line, funcNameEnd)
		return funcRange
	}

	private createFix(document: vscode.TextDocument, range: vscode.Range, newFuncName: string): vscode.CodeAction {
		const fix = new vscode.CodeAction(`Rename to ${newFuncName}`, vscode.CodeActionKind.QuickFix);
		fix.edit = new vscode.WorkspaceEdit();
		fix.edit.replace(document.uri, range, newFuncName);
		return fix;
	}
}
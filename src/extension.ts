import * as vscode from 'vscode';
import { Logic } from './logic';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('python', new FizzBuzzer(), {
			providedCodeActionKinds: FizzBuzzer.providedCodeActionKinds
		}));
}

/** 
 * Позволяет выполнить quick fix action в Python коде с предложением переименовать функцию 
 * в зависимости от её порядкового номера в файле и от заданных настроек.
 */
export class FizzBuzzer implements vscode.CodeActionProvider {
	readonly logic: Logic;

	constructor() {
		this.logic = new Logic();
	}

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
		if (!this.logic.isFuncLine(document, range)) {
			return;
		}

		const task = this.logic.getValidatedTask();
		const docInfo = this.logic.getDocInfo(document, range)

		let suitableNames: string[] = [];
		task.forEach(element => {
			if (docInfo.funcsNumber % element.divider === 0) {
				suitableNames.push(element.funcName);
			}
		});

		if (suitableNames.length === 0) {
			return;
		}

		const suitableName: string = suitableNames.join('_');
		const newName = this.logic.getCorrectFuncName(docInfo.funcNames, suitableName);

		const newRange = this.logic.findFullFuncNameRange(document, range)
		const replaceWithNewFuncNameFix = this.logic.createFix(document, newRange, newName);

		return [
			replaceWithNewFuncNameFix
		];	
	}
}

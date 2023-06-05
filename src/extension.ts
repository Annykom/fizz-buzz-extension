import * as vscode from 'vscode';
import type {DocInfo, Task, ISettings} from './types'

const FUNCTION_REGEX = /(?<=def\s)[\w]+/g;
const SETTINGS_REGEX = /^\d+\s*\|\s*\w+$/g;

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

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
		if (!this.isFuncLine(document, range)) {
			return;
		}

		const task = this.getValidatedTask();
		const docInfo = this.getDocInfo(document, range)

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
		const newName = this.getCorrectFuncName(docInfo.funcNames, suitableName);

		const newRange = this.findFullFuncNameRange(document, range)
		const replaceWithNewFuncNameFix = this.createFix(document, newRange, newName);

		return [
			replaceWithNewFuncNameFix
		];	
	}

	/** 
	 * Проверяет, содержит ли текущая строка объявление функции.
	 * 
	 * @param document документ, в котором была вызвана команда
	 * @param range диапазон, для которого была вызвана команда
	 * 
	 * @return `true`, если текущая строка содержит объявление функции
	 */
	private isFuncLine(document: vscode.TextDocument, range: vscode.Range): boolean {
		const currLineNumber = range.start.line;
		const line = document.lineAt(currLineNumber);

		return line.text.match(FUNCTION_REGEX) !== null
	}

	/** 
	 * Проверяет введенные в настройках параметры, исправляет при наличии ошибок и возвращает 
	 * дефолтные значения, если все параметры введены некорректно.
	 * 
	 * @return перечень делителей и соответствующих им имен функций
	 */
	private getValidatedTask(): Task[] {
		const settings = vscode.workspace.getConfiguration().get<ISettings>('fizzbuzz');
		
		const task: Task[] = [];
		settings!.transforms.forEach(element => {
			element = element.trim();
			if (element.match(SETTINGS_REGEX) === null) {
				vscode.window.showErrorMessage(`The setting element '${element}' is not valid.`);
			} else {
				let splittedElement = element.split('|')
				let divider = +splittedElement[0]
				let funcName = splittedElement[1].trim()
				task.push({divider, funcName})
			}
		});

		task.sort((a, b) => {
			if (a.divider > b.divider) {
				return 1
			}
			if (a.divider < b.divider) {
				return -1
			}
			return 0;
		})

		if (task.length === 0) {
			return [
				{
					divider: 3,
					funcName: 'fizz'
				},
				{
					divider: 5,
					funcName: 'buzz'
				}
			];
		}

		return task;
	}

	/** 
	 * Возвращает информацию о документе: перечень всех имен функций из документа и
	 * порядковый номер функции на текущей строке.
	 * 
	 * @param document документ, в котором была вызвана команда
	 * @param range диапазон, для которого была вызвана команда
	 * 
	 * @return перечень имен функций; порядковый номер функции
	 */
	private getDocInfo(document: vscode.TextDocument, range: vscode.Range): DocInfo {
		const start = range.start;

		let funcsNumber = 0;
		let funcCounter = 0;

		let funcNames: string[] = [];
		for (let index = 0; index < document.lineCount; index++) {
			let currLine = document.lineAt(index)
			
			if (currLine.text.match(FUNCTION_REGEX) !== null) {
				funcNames!.push(currLine.text.match(FUNCTION_REGEX)![0]);
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

	/** 
	 * Возвращает корректное имя функции с учетом возможных коллизий. В случае коллизии к имени
	 * функции добавляется суффикс с числом.
	 * 
	 * @param allDocFuncNames перечень всех имен функций из документа
	 * @param suitableName подходящее имя функции в зависимости от её порядкового номера
	 * 
	 * @return корректное имя функции
	 */
	private getCorrectFuncName(allDocFuncNames: string[], suitableName: string): string {
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

	/** 
	 * Возвращает диапазон, в котором находится имя функции, подлежащее замене.
	 * 
	 * @param document документ, в котором была вызвана команда
	 * @param range диапазон, для которого была вызвана команда
	 * 
	 * @return диапазон для замены имени функции
	 */
	private findFullFuncNameRange(document: vscode.TextDocument, range: vscode.Range): vscode.Range {
		const start = range.start;
		const line = document.lineAt(start.line);
		const funcNameEnd = line.text.indexOf('(')
		const funcNameBeg = line.text.indexOf('def ')
		
		const funcRange = new vscode.Range(start.line, funcNameBeg + 4, start.line, funcNameEnd)
		return funcRange
	}

	/** 
	 * Создает quick fix action, которое может быть выполнено в коде, с предложением переименовать функцию.
	 * 
	 * @param document документ, в котором была вызвана команда
	 * @param range диапазон, для которого была вызвана команда
	 * @param newFuncName новое имя функции
	 * 
	 * @return quick fix action
	 */
	private createFix(document: vscode.TextDocument, range: vscode.Range, newFuncName: string): vscode.CodeAction {
		const fix = new vscode.CodeAction(`Rename to ${newFuncName}`, vscode.CodeActionKind.QuickFix);
		fix.edit = new vscode.WorkspaceEdit();
		fix.edit.replace(document.uri, range, newFuncName);
		return fix;
	}
}

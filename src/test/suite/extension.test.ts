import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import {Logic} from '../../logic';
import type {DocInfo} from '../../types'

const logic = new Logic();

suite('Function "isFuncLine" test suite:', () => {
	const filename = 'test_file.py';
	const filePath = path.join(__dirname, '../../../src/test/suite', filename);

	test('#1: строка с объявлением функции', async () => {
		const document = await vscode.workspace.openTextDocument(filePath);
		const range = new vscode.Range(1, 1, 1, 1);

		const action = logic.isFuncLine(document, range);

		assert.strictEqual(action, true)
	})

	test('#2: строка с произвольным текстом без объявления функции', async () => {
		const document = await vscode.workspace.openTextDocument(filePath);
		const range = new vscode.Range(2, 1, 2, 1);

		const action = logic.isFuncLine(document, range);

		assert.strictEqual(action, false)
	})

	test('#3: пустая строка', async () => {
		const document = await vscode.workspace.openTextDocument(filePath);
		const range = new vscode.Range(3, 1, 3, 1);

		const action = logic.isFuncLine(document, range);

		assert.strictEqual(action, false)
	})
});

suite('Function "getDocInfo" test suite:', () => {
	const filename = 'test_file.py';
	const filePath = path.join(__dirname, '../../../src/test/suite', filename);
	const funcNames = ['foo', 'bar', 'foo_bar', 'foo_foo_bar', 'bar_bar_foo'];

	test('#1: строка до объявления первой функции', async () => {
		const document = await vscode.workspace.openTextDocument(filePath);
		const range = new vscode.Range(0, 0, 0, 0);
		const funcsNumber = 0;
		const result: DocInfo =  {
			funcsNumber: funcsNumber,
			funcNames: funcNames
		}

		const action = logic.getDocInfo(document, range);

		assert.deepEqual(action, result)
	})

	test('#2: строка с объявлением третьей функции', async () => {
		const document = await vscode.workspace.openTextDocument(filePath);
		const range = new vscode.Range(9, 0, 9, 0);
		const funcsNumber = 3;
		const result: DocInfo =  {
			funcsNumber: funcsNumber,
			funcNames: funcNames
		}

		const action = logic.getDocInfo(document, range);

		assert.deepEqual(action, result)
	})

	test('#3: строка после объявления четвертой функции', async () => {
		const document = await vscode.workspace.openTextDocument(filePath);
		const range = new vscode.Range(14, 0, 14, 0);
		const funcsNumber = 4;
		const result: DocInfo =  {
			funcsNumber: funcsNumber,
			funcNames: funcNames
		}

		const action = logic.getDocInfo(document, range);

		assert.deepEqual(action, result)
	})
})

suite('Function "getCorrectFuncName" test suite:', () => {
	test('#1: возвращается исходное значение имени', () => {
		const allDocFuncNames = ['foo', 'bar', 'foo_bar', 'foo_foo_bar', 'buzz', 'bar_bar_foo', 'foo_foo'];
		const suitableName = 'fizz';

		const action = logic.getCorrectFuncName(allDocFuncNames, suitableName)

		assert.strictEqual(action, 'fizz')
	})

	test('#2: к имени добавляется суффикс с первым порядковым номером', () => {
		const allDocFuncNames = ['foo', 'bar', 'fizz', 'foo_foo_bar', 'bar_bar_foo', 'foo_foo'];
		const suitableName = 'fizz';

		const action = logic.getCorrectFuncName(allDocFuncNames, suitableName)

		assert.strictEqual(action, 'fizz_1')
	})

	test('#3: к имени добавляется суффикс с отсутствующим номером', () => {
		const allDocFuncNames = ['buzz', 'bar', 'buzz_1', 'foo_foo_bar', 'buzz_2', 'bar_bar_foo', 'buzz_4'];
		const suitableName = 'buzz';

		const action = logic.getCorrectFuncName(allDocFuncNames, suitableName)

		assert.strictEqual(action, 'buzz_3')
	})

	test('#4: возвращается исходное значение имени', () => {
		const allDocFuncNames: string[] = [];
		const suitableName = 'buzz';

		const action = logic.getCorrectFuncName(allDocFuncNames, suitableName)

		assert.strictEqual(action, 'buzz')
	})

	test('#5: возвращается исходное значение имени', () => {
		const allDocFuncNames: string[] = ['foo', 'bar', 'foo_bar', 'foo_foo_bar', 'buzz', 'bar_bar_foo', 'foo_foo'];
		const suitableName = '';

		const action = logic.getCorrectFuncName(allDocFuncNames, suitableName)

		assert.strictEqual(action, '')
	})
});

suite('Function "findFullFuncNameRange" test suite:', () => {
	const filename = 'test_file.py';
	const filePath = path.join(__dirname, '../../../src/test/suite', filename);

	test('#1: строка с объявлением функции', async () => {
		const document = await vscode.workspace.openTextDocument(filePath);
		const range = new vscode.Range(13, 0, 13, 0);
		const result = new vscode.Range(13, 4, 13, 15);

		const action = logic.findFullFuncNameRange(document, range);

		assert.deepEqual(action, result)
	})

	test('#2: строка с произвольным текстом без объявления функции', async () => {
		const document = await vscode.workspace.openTextDocument(filePath);
		const range = new vscode.Range(4, 10, 4, 10);
		
		assert.throws(() => logic.findFullFuncNameRange(document, range))
	})
})

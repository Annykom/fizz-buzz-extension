# FizzBuzz extension

This extension allows to rename functions based on their sequence number in Python files. Code actions are used to implement quick fixes in VS Code.

The extension uses the [`CodeActionProvider`](https://code.visualstudio.com/api/references/vscode-api#CodeActionProvider) api to implement code actions that convert function name:
- to 'fizz' if its sequence number multiple 3, 
- to 'buzz' if its sequence number multiple 5,
- to 'fizz_buzz' if its sequence number multiple both 3 and 5.

![FizzBuzz code actions](fizzbuzzer.gif)

In case of collisions, a numeric suffix is added to the function name.
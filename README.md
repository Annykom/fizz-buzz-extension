# FizzBuzz extension

This extension allows to rename functions based on their sequence number in Python files. Code actions are used to implement quick fixes in VS Code.

The extension uses the [`CodeActionProvider`](https://code.visualstudio.com/api/references/vscode-api#CodeActionProvider) api to implement code actions that convert function name.
The default settings are:
- 'fizz' if function sequence number is multiple 3, 
- 'buzz' if function sequence number is multiple 5,
- 'fizz_buzz' if function sequence number is multiple both 3 and 5.

![FizzBuzz code actions](https://github.com/Annykom/fizz-buzz-extension/blob/8874e0b01878359d73974b2d7c683ad61c4eb000/fizzbuzzer.gif?raw=true)

In case of collisions, a numeric suffix is added to the function name.

![FizzBuzz collisions](https://github.com/Annykom/fizz-buzz-extension/blob/8874e0b01878359d73974b2d7c683ad61c4eb000/fizzbuzzer_collisions.gif?raw=true)

Setting of user parameters is available in the extension settings.

![FizzBuzz settings](https://github.com/Annykom/fizz-buzz-extension/blob/8874e0b01878359d73974b2d7c683ad61c4eb000/fizzbuzzer_settings.gif?raw=true)

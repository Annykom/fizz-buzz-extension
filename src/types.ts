export type DocInfo = {
	funcsNumber: number;
	funcNames: string[];
};

export type Task = {
	divider: number,
	funcName: string
}

export interface ISettings {
	transforms: string[];
}
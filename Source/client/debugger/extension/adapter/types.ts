// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export const IPromptShowState = Symbol("IPromptShowState");
export interface IPromptShowState {
	shouldShowPrompt(): boolean;
	setShowPrompt(show: boolean): void;
}

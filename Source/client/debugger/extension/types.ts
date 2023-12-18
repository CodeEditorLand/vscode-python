// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Readable } from "stream";
import {
	CancellationToken,
	DebugAdapterDescriptorFactory,
	DebugAdapterTrackerFactory,
	DebugConfigurationProvider,
	Disposable,
	WorkspaceFolder,
} from "vscode";

import { DebugConfigurationArguments } from "../types";

export const IDebugConfigurationService = Symbol("IDebugConfigurationService");
export type IDebugConfigurationService = DebugConfigurationProvider;

export const IDynamicDebugConfigurationService = Symbol(
	"IDynamicDebugConfigurationService",
);
export type IDynamicDebugConfigurationService = DebugConfigurationProvider;

export type DebugConfigurationState = {
	config: Partial<DebugConfigurationArguments>;
	folder?: WorkspaceFolder;
	token?: CancellationToken;
};

export enum DebugConfigurationType {
	launchFile = "launchFile",
	remoteAttach = "remoteAttach",
	launchDjango = "launchDjango",
	launchFastAPI = "launchFastAPI",
	launchFlask = "launchFlask",
	launchModule = "launchModule",
	launchPyramid = "launchPyramid",
	pidAttach = "pidAttach",
}

export enum PythonPathSource {
	launchJson = "launch.json",
	settingsJson = "settings.json",
}

export const IDebugAdapterDescriptorFactory = Symbol(
	"IDebugAdapterDescriptorFactory",
);
export type IDebugAdapterDescriptorFactory = DebugAdapterDescriptorFactory;

export const IDebugSessionLoggingFactory = Symbol(
	"IDebugSessionLoggingFactory",
);

export type IDebugSessionLoggingFactory = DebugAdapterTrackerFactory;

export const IOutdatedDebuggerPromptFactory = Symbol(
	"IOutdatedDebuggerPromptFactory",
);

export type IOutdatedDebuggerPromptFactory = DebugAdapterTrackerFactory;

export const IProtocolParser = Symbol("IProtocolParser");
export interface IProtocolParser extends Disposable {
	connect(stream: Readable): void;
	once(event: string | symbol, listener: (...args: unknown[]) => void): this;
	on(event: string | symbol, listener: (...args: unknown[]) => void): this;
}

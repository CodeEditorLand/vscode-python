// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
	IExtensionActivationService,
	IExtensionSingleActivationService,
} from "../activation/types";
import { IServiceManager } from "../ioc/types";
import { TerminalAutoActivation } from "./activation";
import { CodeExecutionManager } from "./codeExecution/codeExecutionManager";
import { DjangoShellCodeExecutionProvider } from "./codeExecution/djangoShellCodeExecution";
import { CodeExecutionHelper } from "./codeExecution/helper";
import { ReplProvider } from "./codeExecution/repl";
import { TerminalCodeExecutionProvider } from "./codeExecution/terminalCodeExecution";
import { TerminalDeactivateService } from "./envCollectionActivation/deactivateService";
import { TerminalIndicatorPrompt } from "./envCollectionActivation/indicatorPrompt";
import { TerminalEnvVarCollectionService } from "./envCollectionActivation/service";
import { ShellIntegrationDetectionService } from "./envCollectionActivation/shellIntegrationService";
import {
	ICodeExecutionHelper,
	ICodeExecutionManager,
	ICodeExecutionService,
	IShellIntegrationDetectionService,
	ITerminalAutoActivation,
	ITerminalDeactivateService,
	ITerminalEnvVarCollectionService,
} from "./types";

export function registerTypes(serviceManager: IServiceManager): void {
	serviceManager.addSingleton<ICodeExecutionHelper>(
		ICodeExecutionHelper,
		CodeExecutionHelper,
	);

	serviceManager.addSingleton<ICodeExecutionManager>(
		ICodeExecutionManager,
		CodeExecutionManager,
	);

	serviceManager.addSingleton<ICodeExecutionService>(
		ICodeExecutionService,
		DjangoShellCodeExecutionProvider,
		"djangoShell",
	);

	serviceManager.addSingleton<ICodeExecutionService>(
		ICodeExecutionService,
		TerminalCodeExecutionProvider,
		"standard",
	);

	serviceManager.addSingleton<ICodeExecutionService>(
		ICodeExecutionService,
		ReplProvider,
		"repl",
	);

	serviceManager.addSingleton<ITerminalAutoActivation>(
		ITerminalAutoActivation,
		TerminalAutoActivation,
	);

	serviceManager.addSingleton<ITerminalEnvVarCollectionService>(
		ITerminalEnvVarCollectionService,
		TerminalEnvVarCollectionService,
	);

	serviceManager.addSingleton<ITerminalDeactivateService>(
		ITerminalDeactivateService,
		TerminalDeactivateService,
	);

	serviceManager.addSingleton<IExtensionSingleActivationService>(
		IExtensionSingleActivationService,
		TerminalIndicatorPrompt,
	);

	serviceManager.addSingleton<IShellIntegrationDetectionService>(
		IShellIntegrationDetectionService,
		ShellIntegrationDetectionService,
	);

	serviceManager.addBinding(
		ITerminalEnvVarCollectionService,
		IExtensionActivationService,
	);
}

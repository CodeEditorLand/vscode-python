// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IServiceManager } from "../ioc/types";
import { ILanguageServerWatcher } from "../languageServer/types";
import { LanguageServerWatcher } from "../languageServer/watcher";
import { ExtensionActivationManager } from "./activationManager";
import { LoadLanguageServerExtension } from "./common/loadLanguageServerExtension";
import { LanguageServerOutputChannel } from "./common/outputChannel";
import { ExtensionSurveyPrompt } from "./extensionSurvey";
import { PartialModeStatusItem } from "./partialModeStatus";
import { RequirementsTxtLinkActivator } from "./requirementsTxtLinkActivator";
import {
	IExtensionActivationManager,
	IExtensionActivationService,
	IExtensionSingleActivationService,
	ILanguageServerOutputChannel,
} from "./types";

export function registerTypes(serviceManager: IServiceManager): void {
	serviceManager.addSingleton<IExtensionActivationService>(
		IExtensionActivationService,
		PartialModeStatusItem,
	);

	serviceManager.add<IExtensionActivationManager>(
		IExtensionActivationManager,
		ExtensionActivationManager,
	);

	serviceManager.addSingleton<ILanguageServerOutputChannel>(
		ILanguageServerOutputChannel,
		LanguageServerOutputChannel,
	);

	serviceManager.addSingleton<IExtensionSingleActivationService>(
		IExtensionSingleActivationService,
		ExtensionSurveyPrompt,
	);

	serviceManager.addSingleton<IExtensionSingleActivationService>(
		IExtensionSingleActivationService,
		LoadLanguageServerExtension,
	);

	serviceManager.addSingleton<ILanguageServerWatcher>(
		ILanguageServerWatcher,
		LanguageServerWatcher,
	);

	serviceManager.addBinding(
		ILanguageServerWatcher,
		IExtensionActivationService,
	);

	serviceManager.addSingleton<IExtensionSingleActivationService>(
		IExtensionSingleActivationService,
		RequirementsTxtLinkActivator,
	);
}

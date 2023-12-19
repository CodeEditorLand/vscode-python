// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { LanguageClientOptions } from "vscode-languageclient";

import { LanguageServerAnalysisOptionsBase } from "../common/analysisOptions";

export class NodeLanguageServerAnalysisOptions extends LanguageServerAnalysisOptionsBase {
	protected getConfigSectionsToSynchronize(): string[] {
		return [
			...super.getConfigSectionsToSynchronize(),
			"jupyter.runStartupCommands",
		];
	}

	// eslint-disable-next-line class-methods-use-this
	protected async getInitializationOptions(): Promise<LanguageClientOptions> {
		return {
			experimentationSupport: true,
			trustedWorkspaceSupport: true,
		} as unknown as LanguageClientOptions;
	}
}

/* eslint-disable comma-dangle */

/* eslint-disable implicit-arrow-linebreak */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { dirname } from "path";
import { inject, injectable, named } from "inversify";
import type { SemVer } from "semver";
import { Extension, Memento, Uri } from "vscode";

import { PylanceApi } from "../activation/node/pylanceApi";
import type { Environment } from "../api/types";
import { ExtensionContextKey } from "../common/application/contextKeys";
import {
	IContextKeyManager,
	IWorkspaceService,
} from "../common/application/types";
import {
	JUPYTER_EXTENSION_ID,
	PYLANCE_EXTENSION_ID,
} from "../common/constants";
import {
	GLOBAL_MEMENTO,
	IExtensions,
	IMemento,
	Resource,
} from "../common/types";
import { getDebugpyPath } from "../debugger/pythonDebugger";
import { IEnvironmentActivationService } from "../interpreter/activation/types";
import {
	IInterpreterQuickPickItem,
	IInterpreterSelector,
} from "../interpreter/configuration/types";
import {
	ICondaService,
	IInterpreterDisplay,
	IInterpreterService,
	IInterpreterStatusbarVisibilityFilter,
} from "../interpreter/contracts";

type PythonApiForJupyterExtension = {
	/**
	 * IEnvironmentActivationService
	 */
	getActivatedEnvironmentVariables(
		resource: Resource,
		interpreter: Environment,
		allowExceptions?: boolean,
	): Promise<NodeJS.ProcessEnv | undefined>;

	getKnownSuggestions(resource: Resource): IInterpreterQuickPickItem[];
	/**
	 * @deprecated Use `getKnownSuggestions` and `suggestionToQuickPickItem` instead.
	 */
	getSuggestions(resource: Resource): Promise<IInterpreterQuickPickItem[]>;
	/**
	 * Returns path to where `debugpy` is. In python extension this is `/python_files/lib/python`.
	 */
	getDebuggerPath(): Promise<string>;
	/**
	 * Retrieve interpreter path selected for Jupyter server from Python memento storage
	 */
	getInterpreterPathSelectedForJupyterServer(): string | undefined;
	/**
	 * Registers a visibility filter for the interpreter status bar.
	 */
	registerInterpreterStatusFilter(
		filter: IInterpreterStatusbarVisibilityFilter,
	): void;

	getCondaVersion(): Promise<SemVer | undefined>;
	/**
	 * Returns the conda executable.
	 */
	getCondaFile(): Promise<string | undefined>;

	/**
	 * Call to provide a function that the Python extension can call to request the Python
	 * path to use for a particular notebook.
	 * @param func : The function that Python should call when requesting the Python path.
	 */
	registerJupyterPythonPathFunction(
		func: (uri: Uri) => Promise<string | undefined>,
	): void;
};

type JupyterExtensionApi = {
	/**
	 * Registers python extension specific parts with the jupyter extension
	 * @param interpreterService
	 */
	registerPythonApi(interpreterService: PythonApiForJupyterExtension): void;
};

@injectable()
export class JupyterExtensionIntegration {
	private jupyterExtension: Extension<JupyterExtensionApi> | undefined;

	private pylanceExtension: Extension<PylanceApi> | undefined;

	constructor(
		@inject(IExtensions) private readonly extensions: IExtensions,
		@inject(IInterpreterSelector)
		private readonly interpreterSelector: IInterpreterSelector,
		@inject(IEnvironmentActivationService)
		private readonly envActivation: IEnvironmentActivationService,
		@inject(IMemento) @named(GLOBAL_MEMENTO) private globalState: Memento,
		@inject(IInterpreterDisplay)
		private interpreterDisplay: IInterpreterDisplay,
		@inject(IWorkspaceService) private workspaceService: IWorkspaceService,
		@inject(ICondaService) private readonly condaService: ICondaService,
		@inject(IContextKeyManager)
		private readonly contextManager: IContextKeyManager,
		@inject(IInterpreterService)
		private interpreterService: IInterpreterService,
	) {}

	public registerApi(
		jupyterExtensionApi: JupyterExtensionApi,
	): JupyterExtensionApi | undefined {
		this.contextManager.setContext(
			ExtensionContextKey.IsJupyterInstalled,
			true,
		);

		if (!this.workspaceService.isTrusted) {
			this.workspaceService.onDidGrantWorkspaceTrust(() =>
				this.registerApi(jupyterExtensionApi),
			);

			return undefined;
		}
		// Forward python parts
		jupyterExtensionApi.registerPythonApi({
			getActivatedEnvironmentVariables: async (
				resource: Resource,
				env: Environment,
				allowExceptions?: boolean,
			) => {
				const interpreter =
					await this.interpreterService.getInterpreterDetails(
						env.path,
					);

				return this.envActivation.getActivatedEnvironmentVariables(
					resource,
					interpreter,
					allowExceptions,
				);
			},
			getSuggestions: async (
				resource: Resource,
			): Promise<IInterpreterQuickPickItem[]> =>
				this.interpreterSelector.getAllSuggestions(resource),
			getKnownSuggestions: (
				resource: Resource,
			): IInterpreterQuickPickItem[] =>
				this.interpreterSelector.getSuggestions(resource),
			getDebuggerPath: async () => dirname(await getDebugpyPath()),
			getInterpreterPathSelectedForJupyterServer: () =>
				this.globalState.get<string | undefined>(
					"INTERPRETER_PATH_SELECTED_FOR_JUPYTER_SERVER",
				),
			registerInterpreterStatusFilter:
				this.interpreterDisplay.registerVisibilityFilter.bind(
					this.interpreterDisplay,
				),
			getCondaFile: () => this.condaService.getCondaFile(),
			getCondaVersion: () => this.condaService.getCondaVersion(),
			registerJupyterPythonPathFunction: (
				func: (uri: Uri) => Promise<string | undefined>,
			) => this.registerJupyterPythonPathFunction(func),
		});

		return undefined;
	}

	public async integrateWithJupyterExtension(): Promise<void> {
		const api = await this.getExtensionApi();

		if (api) {
			this.registerApi(api);
		}
	}

	private async getExtensionApi(): Promise<JupyterExtensionApi | undefined> {
		if (!this.pylanceExtension) {
			const pylanceExtension =
				this.extensions.getExtension<PylanceApi>(PYLANCE_EXTENSION_ID);

			if (pylanceExtension && !pylanceExtension.isActive) {
				await pylanceExtension.activate();
			}

			this.pylanceExtension = pylanceExtension;
		}

		if (!this.jupyterExtension) {
			const jupyterExtension =
				this.extensions.getExtension<JupyterExtensionApi>(
					JUPYTER_EXTENSION_ID,
				);

			if (!jupyterExtension) {
				return undefined;
			}

			await jupyterExtension.activate();

			if (jupyterExtension.isActive) {
				this.jupyterExtension = jupyterExtension;

				return this.jupyterExtension.exports;
			}
		} else {
			return this.jupyterExtension.exports;
		}

		return undefined;
	}

	private getPylanceApi(): PylanceApi | undefined {
		const api = this.pylanceExtension?.exports;

		return api && api.notebook && api.client && api.client.isEnabled()
			? api
			: undefined;
	}

	private registerJupyterPythonPathFunction(
		func: (uri: Uri) => Promise<string | undefined>,
	) {
		const api = this.getPylanceApi();

		if (api) {
			api.notebook!.registerJupyterPythonPathFunction(func);
		}
	}
}

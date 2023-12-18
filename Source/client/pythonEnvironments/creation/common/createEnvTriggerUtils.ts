// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as path from "path";
import * as fsapi from "fs-extra";
import { ConfigurationTarget, Uri, WorkspaceFolder } from "vscode";
import { PythonExtension } from "../../../api/types";
import { PVSC_EXTENSION_ID } from "../../../common/constants";
import {
	getWorkspaceStateValue,
	updateWorkspaceStateValue,
} from "../../../common/persistentState";
import { getExtension } from "../../../common/vscodeApis/extensionsApi";
import { getConfiguration } from "../../../common/vscodeApis/workspaceApis";
import { traceVerbose } from "../../../logging";
import { getPipRequirementsFiles } from "../provider/venvUtils";

export const CREATE_ENV_TRIGGER_SETTING_PART = "createEnvironment.trigger";
export const CREATE_ENV_TRIGGER_SETTING = `python.${CREATE_ENV_TRIGGER_SETTING_PART}`;

export async function fileContainsInlineDependencies(
	_uri: Uri,
): Promise<boolean> {
	// This is a placeholder for the real implementation of inline dependencies support
	// For now we don't detect anything. Once PEP-722/PEP-723 are accepted we can implement
	// this properly.
	return false;
}

export async function hasRequirementFiles(
	workspace: WorkspaceFolder,
): Promise<boolean> {
	const files = await getPipRequirementsFiles(workspace);
	const found = (files?.length ?? 0) > 0;
	if (found) {
		traceVerbose(`Found requirement files: ${workspace.uri.fsPath}`);
	}
	return found;
}

export async function hasKnownFiles(
	workspace: WorkspaceFolder,
): Promise<boolean> {
	const filePaths: string[] = [
		"poetry.lock",
		"conda.yaml",
		"environment.yaml",
		"conda.yml",
		"environment.yml",
		"Pipfile",
		"Pipfile.lock",
	].map((fileName) => path.join(workspace.uri.fsPath, fileName));
	const result = await Promise.all(filePaths.map((f) => fsapi.pathExists(f)));
	const found = result.some((r) => r);
	if (found) {
		traceVerbose(`Found known files: ${workspace.uri.fsPath}`);
	}
	return found;
}

export async function isGlobalPythonSelected(
	workspace: WorkspaceFolder,
): Promise<boolean> {
	const extension = getExtension<PythonExtension>(PVSC_EXTENSION_ID);
	if (!extension) {
		return false;
	}
	const extensionApi: PythonExtension = extension.exports as PythonExtension;
	const interpreter = extensionApi.environments.getActiveEnvironmentPath(
		workspace.uri,
	);
	const details =
		await extensionApi.environments.resolveEnvironment(interpreter);
	const isGlobal = details?.environment === undefined;
	if (isGlobal) {
		traceVerbose(
			`Selected python for [${workspace.uri.fsPath}] is [global] type: ${interpreter.path}`,
		);
	}
	return isGlobal;
}

/**
 * Checks the setting `python.createEnvironment.trigger` to see if we should perform the checks
 * to prompt to create an environment.
 * @export
 * @returns : True if we should prompt to create an environment.
 */
export function shouldPromptToCreateEnv(): boolean {
	const config = getConfiguration("python");
	if (config) {
		const value = config.get<string>(
			CREATE_ENV_TRIGGER_SETTING_PART,
			"off",
		);
		return value !== "off";
	}

	return (
		getWorkspaceStateValue<string>(CREATE_ENV_TRIGGER_SETTING, "off") !==
		"off"
	);
}

/**
 * Sets `python.createEnvironment.trigger` to 'off' in the user settings.
 */
export function disableCreateEnvironmentTrigger(): void {
	const config = getConfiguration("python");
	if (config) {
		config.update(
			"createEnvironment.trigger",
			"off",
			ConfigurationTarget.Global,
		);
	}
}

/**
 * Sets trigger to 'off' in workspace persistent state. This disables trigger check
 * for the current workspace only. In multi root case, it is disabled for all folders
 * in the multi root workspace.
 */
export async function disableWorkspaceCreateEnvironmentTrigger(): Promise<void> {
	await updateWorkspaceStateValue(CREATE_ENV_TRIGGER_SETTING, "off");
}

let _alreadyCreateEnvCriteriaCheck = false;
/**
 * Run-once wrapper function for the workspace check to prompt to create an environment.
 * @returns : True if we should prompt to c environment.
 */
export function isCreateEnvWorkspaceCheckNotRun(): boolean {
	if (_alreadyCreateEnvCriteriaCheck) {
		return false;
	}
	_alreadyCreateEnvCriteriaCheck = true;
	return true;
}

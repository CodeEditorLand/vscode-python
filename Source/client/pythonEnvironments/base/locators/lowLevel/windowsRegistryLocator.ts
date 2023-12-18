/* eslint-disable no-continue */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { DiscoveryUsingWorkers } from "../../../../common/experiments/groups";
import { traceError, traceVerbose } from "../../../../logging";
import { isMicrosoftStoreDir } from "../../../common/environmentManagers/microsoftStoreEnv";
import { inExperiment } from "../../../common/externalDependencies";
import { getRegistryInterpreters } from "../../../common/windowsUtils";
import { PythonEnvKind, PythonEnvSource } from "../../info";
import { BasicEnvInfo, IPythonEnvsIterator, Locator } from "../../locator";

export class WindowsRegistryLocator extends Locator<BasicEnvInfo> {
	public readonly providerId: string = "windows-registry";

	// eslint-disable-next-line class-methods-use-this
	public iterEnvs(
		_?: unknown,
		useWorkerThreads = inExperiment(DiscoveryUsingWorkers.experiment),
	): IPythonEnvsIterator<BasicEnvInfo> {
		const iterator = async function* () {
			traceVerbose("Searching for windows registry interpreters");
			const interpreters =
				await getRegistryInterpreters(useWorkerThreads);
			for (const interpreter of interpreters) {
				try {
					// Filter out Microsoft Store app directories. We have a store app locator that handles this.
					// The python.exe available in these directories might not be python. It can be a store install
					// shortcut that takes you to microsoft store.
					if (isMicrosoftStoreDir(interpreter.interpreterPath)) {
						continue;
					}
					const env: BasicEnvInfo = {
						kind: PythonEnvKind.OtherGlobal,
						executablePath: interpreter.interpreterPath,
						source: [PythonEnvSource.WindowsRegistry],
					};
					yield env;
				} catch (ex) {
					traceError(
						`Failed to process environment: ${interpreter}`,
						ex,
					);
				}
			}
			traceVerbose(
				"Finished searching for windows registry interpreters",
			);
		};
		return iterator();
	}
}

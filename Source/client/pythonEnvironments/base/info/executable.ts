// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as path from "path";

import { PythonVersion } from ".";
import { getOSType, OSType } from "../../../common/utils/platform";
import { normCasePath } from "../../common/externalDependencies";
import { getEmptyVersion, parseVersion } from "./pythonVersion";

/**
 * Determine a best-effort Python version based on the given filename.
 */
export function parseVersionFromExecutable(filename: string): PythonVersion {
	const version = parseBasename(path.basename(filename));

	if (version.major === 2 && version.minor === -1) {
		version.minor = 7;
	}

	return version;
}

function parseBasename(basename: string): PythonVersion {
	basename = normCasePath(basename);
	if (getOSType() === OSType.Windows) {
		if (basename === "python.exe") {
			// On Windows we can't assume it is 2.7.
			return getEmptyVersion();
		}
	} else if (basename === "python") {
		// We can assume it is 2.7.  (See PEP 394.)
		return parseVersion("2.7");
	}
	if (!basename.startsWith("python")) {
		throw Error(
			`not a Python executable (expected "python..", got "${basename}")`,
		);
	}
	// If we reach here then we expect it to have a version in the name.
	return parseVersion(basename);
}

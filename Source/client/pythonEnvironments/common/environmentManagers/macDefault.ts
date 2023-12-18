// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { OSType, getOSType } from "../../../common/utils/platform";

/**
 * Decide if the given Python executable looks like the MacOS default Python.
 */
export function isMacDefaultPythonPath(pythonPath: string): boolean {
	if (getOSType() !== OSType.OSX) {
		return false;
	}

	const defaultPaths = ["/usr/bin/python"];

	return (
		defaultPaths.includes(pythonPath) ||
		pythonPath.startsWith("/usr/bin/python2")
	);
}

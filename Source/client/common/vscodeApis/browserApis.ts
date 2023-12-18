// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Uri, env } from "vscode";

export function launch(url: string): void {
	env.openExternal(Uri.parse(url));
}

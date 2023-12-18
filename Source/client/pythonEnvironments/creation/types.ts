// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License

import { Progress } from "vscode";

export type CreateEnvironmentProgress = Progress<{
	message?: string;
	increment?: number;
}>;

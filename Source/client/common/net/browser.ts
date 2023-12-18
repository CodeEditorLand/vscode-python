// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { injectable } from "inversify";
import { Uri, env } from "vscode";
import { IBrowserService } from "../types";

export function launch(url: string) {
	env.openExternal(Uri.parse(url));
}

@injectable()
export class BrowserService implements IBrowserService {
	public launch(url: string): void {
		launch(url);
	}
}

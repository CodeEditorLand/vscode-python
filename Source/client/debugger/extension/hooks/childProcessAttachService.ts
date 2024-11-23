// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

"use strict";

import { inject, injectable } from "inversify";
import {
	DebugConfiguration,
	DebugSession,
	DebugSessionOptions,
	l10n,
	WorkspaceFolder,
} from "vscode";

import { IDebugService } from "../../../common/application/types";
import { noop } from "../../../common/utils/misc";
import { showErrorMessage } from "../../../common/vscodeApis/windowApis";
import { getWorkspaceFolders } from "../../../common/vscodeApis/workspaceApis";
import { captureTelemetry } from "../../../telemetry";
import { EventName } from "../../../telemetry/constants";
import { AttachRequestArguments } from "../../types";
import { IChildProcessAttachService } from "./types";

/**
 * This class is responsible for attaching the debugger to any
 * child processes launched. I.e. this is the class responsible for multi-proc debugging.
 */
@injectable()
export class ChildProcessAttachService implements IChildProcessAttachService {
	constructor(
		@inject(IDebugService) private readonly debugService: IDebugService,
	) {}

	@captureTelemetry(EventName.DEBUGGER_ATTACH_TO_CHILD_PROCESS)
	public async attach(
		data: AttachRequestArguments & DebugConfiguration,
		parentSession: DebugSession,
	): Promise<void> {
		const debugConfig: AttachRequestArguments & DebugConfiguration = data;

		const folder = this.getRelatedWorkspaceFolder(debugConfig);

		const debugSessionOption: DebugSessionOptions = {
			parentSession: parentSession,
			lifecycleManagedByParent: true,
		};

		const launched = await this.debugService.startDebugging(
			folder,
			debugConfig,
			debugSessionOption,
		);

		if (!launched) {
			showErrorMessage(
				l10n.t(
					"Failed to launch debugger for child process {0}",
					debugConfig.subProcessId!,
				),
			).then(noop, noop);
		}
	}

	private getRelatedWorkspaceFolder(
		config: AttachRequestArguments & DebugConfiguration,
	): WorkspaceFolder | undefined {
		const workspaceFolder = config.workspaceFolder;

		const hasWorkspaceFolders = (getWorkspaceFolders()?.length || 0) > 0;

		if (!hasWorkspaceFolders || !workspaceFolder) {
			return;
		}
		return getWorkspaceFolders()!.find(
			(ws) => ws.uri.fsPath === workspaceFolder,
		);
	}
}

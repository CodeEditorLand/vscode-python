// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IExtensionActivationService } from "../activation/types";
import { IServiceManager } from "../ioc/types";
import { TestConfigSettingsService } from "./common/configSettingService";
import { DebugLauncher } from "./common/debugLauncher";
import { TestsHelper } from "./common/testUtils";
import {
	ITestConfigSettingsService,
	ITestConfigurationManagerFactory,
	ITestConfigurationService,
	ITestDebugLauncher,
	ITestsHelper,
} from "./common/types";
import { UnitTestConfigurationService } from "./configuration";
import { TestConfigurationManagerFactory } from "./configurationFactory";
import { TestingService, UnitTestManagementService } from "./main";
import { registerTestControllerTypes } from "./testController/serviceRegistry";
import { ITestingService } from "./types";

export function registerTypes(serviceManager: IServiceManager) {
	serviceManager.addSingleton<ITestDebugLauncher>(
		ITestDebugLauncher,
		DebugLauncher,
	);

	serviceManager.add<ITestsHelper>(ITestsHelper, TestsHelper);

	serviceManager.addSingleton<ITestConfigurationService>(
		ITestConfigurationService,
		UnitTestConfigurationService,
	);
	serviceManager.addSingleton<ITestingService>(
		ITestingService,
		TestingService,
	);

	serviceManager.addSingleton<ITestConfigSettingsService>(
		ITestConfigSettingsService,
		TestConfigSettingsService,
	);
	serviceManager.addSingleton<ITestConfigurationManagerFactory>(
		ITestConfigurationManagerFactory,
		TestConfigurationManagerFactory,
	);
	serviceManager.addSingleton<IExtensionActivationService>(
		IExtensionActivationService,
		UnitTestManagementService,
	);

	registerTestControllerTypes(serviceManager);
}

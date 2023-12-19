// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as crypto from "crypto";
import { injectable } from "inversify";
import { IRandom } from "../types";

function getRandom(): number {
	let num = 0;

	const buf: Buffer = crypto.randomBytes(2);
	num = (buf.readUInt8(0) << 8) + buf.readUInt8(1);

	const maxValue: number = 16 ** 4 - 1;
	return num / maxValue;
}

function getRandomBetween(min = 0, max = 10): number {
	const randomVal: number = getRandom();
	return min + randomVal * (max - min);
}

@injectable()
export class Random implements IRandom {
	public getRandomInt(min = 0, max = 10): number {
		return getRandomBetween(min, max);
	}
}

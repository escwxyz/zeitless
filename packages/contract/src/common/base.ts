import { oc } from "@orpc/contract";

import { commonErrorMap } from "./errors";

export const contract = oc.errors(commonErrorMap);

import { implement } from "@orpc/server";
import { adminContracts } from "@zeitless/contract";
import type { Context } from "../../context";

export const admin = implement(adminContracts).$context<Context>();

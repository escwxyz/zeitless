import { implement } from "@orpc/server";
import { commerceContracts } from "@zeitless/contract";
import type { Context } from "../../context";

export const commerce = implement(commerceContracts).$context<Context>();

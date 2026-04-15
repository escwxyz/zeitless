import { ORPCError } from "@orpc/server";
import type { CommerceBindings } from "./shared";

const durableObjectBaseUrl = "https://durable-object.local";

interface DurableObjectStubLike {
  fetch(request: Request): Promise<Response>;
}

interface DurableObjectNamespaceLike {
  idFromName(name: string): unknown;
  get(id: unknown): DurableObjectStubLike;
}

const mapStatusToError = (status: number) => {
  switch (status) {
    case 400: {
      return "BAD_REQUEST";
    }
    case 404: {
      return "NOT_FOUND";
    }
    case 409: {
      return "CONFLICT";
    }
    default: {
      return "INTERNAL_SERVER_ERROR";
    }
  }
};

const createJsonRequest = (path: string, init?: RequestInit): Request =>
  new Request(`${durableObjectBaseUrl}${path}`, init);

const readDoJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new ORPCError(mapStatusToError(response.status));
  }

  return (await response.json()) as T;
};

const writeJson = (value: unknown): BodyInit => JSON.stringify(value);

const addJsonHeaders = (init: RequestInit | undefined): RequestInit => ({
  ...init,
  headers: {
    "Content-Type": "application/json",
    ...init?.headers,
  },
});

const fetchDo = async <T>(
  stub: DurableObjectStubLike,
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await stub.fetch(createJsonRequest(path, addJsonHeaders(init)));
  return readDoJson<T>(response);
};

export const fetchCartDo = <T>(
  bindings: CommerceBindings,
  cartId: string,
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const namespace = bindings.CART_STATE as unknown as DurableObjectNamespaceLike;
  const stub = namespace.get(namespace.idFromName(cartId));
  return fetchDo<T>(stub, path, init);
};

export const fetchReservationDo = <T>(
  bindings: CommerceBindings,
  productId: string,
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const namespace = bindings.RESERVATION_STATE as unknown as DurableObjectNamespaceLike;
  const stub = namespace.get(namespace.idFromName(productId));
  return fetchDo<T>(stub, path, init);
};

export const toJsonBody = (value: unknown) => writeJson(value);

/**
 *
 * @param method
 * @param supportedMethods
 */
export function isMethodSupported(
  method: Maybe<string>,
  supportedMethods: HttpMethod | HttpMethod[]
) {
  if (Array.isArray(supportedMethods)) {
    return supportedMethods.includes(method as HttpMethod);
  }

  return method === supportedMethods;
}

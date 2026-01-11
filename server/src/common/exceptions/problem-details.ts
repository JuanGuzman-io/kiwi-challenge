export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  [key: string]: unknown;
}

export class ProblemDetailsBuilder {
  static build(
    type: string,
    title: string,
    status: number,
    detail: string,
    instance: string,
    extensions?: Record<string, unknown>,
  ): ProblemDetails {
    return {
      type: `https://api.rewards.com/problems/${type}`,
      title,
      status,
      detail,
      instance,
      ...extensions,
    };
  }
}

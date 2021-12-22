export const handleErrorNoDefault =
  (logFunc = console.error) =>
    (error: Error): unknown =>
      logFunc(error)

// prettier-ignore
export const handleErrorWithDefault =
  <Type>(value: Type, logFunc=console.error) => (error: Error): Type => (logFunc(error), value)

export const log =
  (logFunc = console.log) =>
    (...args: any[]): unknown =>
      logFunc.call(null, ...args)

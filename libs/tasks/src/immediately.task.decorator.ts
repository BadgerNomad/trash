type MethodDecorator = <T>(
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void;

/**
 * Call method with starting server
 */
const ImmediatelyTask =
  (): MethodDecorator =>
  (...args) => {
    const [proto, propName, descriptor] = args;
    Reflect.defineMetadata('IMMEDIATELY_TASK_METADATA', true, descriptor.value);

    return descriptor;
  };

export default ImmediatelyTask;

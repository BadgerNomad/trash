type MethodDecorator = <T>(
  target: unknown,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void;

const Subscribe =
  (queue: string): MethodDecorator =>
  (...args) => {
    const [_1, _2, descriptor] = args;
    Reflect.defineMetadata('QUEUE_METADATA', queue, descriptor.value);

    return descriptor;
  };

export default Subscribe;

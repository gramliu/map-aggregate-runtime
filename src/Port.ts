export abstract class Port<T> {
  constructor(
    public name: string,
    public description?: string,
    public required: boolean = false,
    public isStatic: boolean = false
  ) {}
}

export abstract class InputPort<T> extends Port<T> {
  constructor(
    public name: string,
    public description?: string,
    public required: boolean = false,
    public isStatic: boolean = false,
    public enumValues?: T[]
  ) {
    super(name, description, required, isStatic);
  }
}

export abstract class OutputPort<T> extends Port<T> {}
